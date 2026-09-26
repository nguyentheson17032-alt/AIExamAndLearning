package com.aiexam.learning.paper.domain;

import com.aiexam.learning.catalog.domain.CatalogService;
import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.common.exception.BusinessRuleException;
import com.aiexam.learning.common.exception.ResourceNotFoundException;
import com.aiexam.learning.paper.api.PaperSetResponse;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.infrastructure.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class DocxExamImportService {

    private static final long CAPTURE_MINUTES = 15;

    private final CatalogService catalogService;
    private final UserRepository userRepository;
    private final UploadedExamStore uploadedExamStore;
    private final ObjectMapper objectMapper;

    public PaperSetResponse importDocx(
            UUID authorId,
            UUID subjectId,
            String title,
            String filename,
            InputStream docx
    ) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found: " + authorId));
        Subject subject = catalogService.getSubject(subjectId);
        Path work = null;
        try {
            work = Files.createTempDirectory("exam-upload-");
            Path source = work.resolve("exam.docx");
            Files.copy(docx, source);
            Path out = work.resolve("out");
            Files.createDirectories(out);
            capture(source, out);
            Ts10ExamBank.Bank bank = objectMapper.readValue(out.resolve("bank.json").toFile(), Ts10ExamBank.Bank.class);
            return uploadedExamStore.persist(author, subject, titleOf(title, filename), bank, out);
        } catch (IOException ex) {
            throw new BusinessRuleException("INVALID_DOCX", "Không đọc được file Word.");
        } finally {
            deleteTree(work);
        }
    }

    private void capture(Path docx, Path out) throws IOException {
        Path script = scriptPath();
        IOException last = null;
        for (List<String> python : pythonCommands()) {
            List<String> command = new ArrayList<>(python);
            command.add(script.toString());
            command.add(docx.toString());
            command.add(out.toString());
            ProcessBuilder builder = new ProcessBuilder(command);
            builder.redirectErrorStream(true);
            Path log = out.resolve("capture.log");
            builder.redirectOutput(log.toFile());
            Process process;
            try {
                process = builder.start();
            } catch (IOException ex) {
                last = ex;
                continue;
            }
            boolean finished;
            try {
                finished = process.waitFor(CAPTURE_MINUTES, TimeUnit.MINUTES);
            } catch (InterruptedException ex) {
                process.destroyForcibly();
                Thread.currentThread().interrupt();
                throw new BusinessRuleException("CAPTURE_FAILED", "Việc chụp đề bị ngắt.");
            }
            String output = Files.exists(log) ? Files.readString(log, StandardCharsets.UTF_8) : "";
            if (!finished) {
                process.destroyForcibly();
                throw new BusinessRuleException("CAPTURE_FAILED", "Chụp đề quá lâu. Hãy thử file một đề.");
            }
            if (process.exitValue() != 0) {
                throw new BusinessRuleException("CAPTURE_FAILED", captureMessage(output));
            }
            if (!Files.isRegularFile(out.resolve("bank.json"))) {
                throw new BusinessRuleException("CAPTURE_FAILED", "Không tạo được dữ liệu đề từ file Word.");
            }
            return;
        }
        throw new BusinessRuleException(
                "CAPTURE_FAILED",
                last == null ? "Không chạy được Python để chụp đề." : "Không chạy được Python để chụp đề."
        );
    }

    static String titleOf(String requested, String filename) {
        String raw = requested == null || requested.isBlank() ? filename : requested;
        if (raw == null) {
            raw = "";
        }
        int slash = Math.max(raw.lastIndexOf('/'), raw.lastIndexOf('\\'));
        if (slash >= 0) {
            raw = raw.substring(slash + 1);
        }
        raw = raw.replaceAll("(?i)\\.docx$", "").trim();
        if (raw.isBlank()) {
            raw = "Đề đã tải";
        }
        return raw.length() > 200 ? raw.substring(0, 200) : raw;
    }

    private static String captureMessage(String output) {
        if (output == null || output.isBlank()) {
            return "Không chụp được câu hỏi trong file Word.";
        }
        String[] lines = output.trim().split("\\R");
        String last = lines[lines.length - 1].trim();
        if (last.startsWith("BANK ")) {
            return "Không chụp được câu hỏi trong file Word.";
        }
        if (last.length() > 240) {
            return last.substring(0, 240);
        }
        return last;
    }

    private static Path scriptPath() {
        Path cwd = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
        List<Path> candidates = List.of(
                cwd.resolve("scripts/capture_exam_docx.py"),
                cwd.resolve("../scripts/capture_exam_docx.py")
        );
        for (Path candidate : candidates) {
            Path normalized = candidate.normalize();
            if (Files.isRegularFile(normalized)) {
                return normalized;
            }
        }
        throw new BusinessRuleException("CAPTURE_FAILED", "Thiếu script chụp đề.");
    }

    private static List<List<String>> pythonCommands() {
        return List.of(List.of("py", "-3"), List.of("python"), List.of("python3"));
    }

    private static void deleteTree(Path root) {
        if (root == null || !Files.exists(root)) {
            return;
        }
        try (Stream<Path> walk = Files.walk(root)) {
            walk.sorted(Comparator.reverseOrder()).forEach(path -> {
                try {
                    Files.deleteIfExists(path);
                } catch (IOException ignored) {
                    /* temp files are removed on the next run */
                }
            });
        } catch (IOException ignored) {
            /* temp files are removed on the next run */
        }
    }
}
