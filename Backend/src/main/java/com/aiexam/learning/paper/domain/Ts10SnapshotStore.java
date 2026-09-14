package com.aiexam.learning.paper.domain;

import com.aiexam.learning.common.config.SeedProperties;
import com.aiexam.learning.question.domain.QuestionImage;
import com.aiexam.learning.question.infrastructure.QuestionImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class Ts10SnapshotStore {

    static final Pattern MARKER = Pattern.compile("\\[\\[img:/ts10/q/([A-Za-z0-9._-]+)\\]\\]");

    private final SeedProperties seedProperties;
    private final QuestionImageRepository questionImageRepository;

    public static String filenameIn(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        Matcher matcher = MARKER.matcher(text);
        return matcher.find() ? matcher.group(1) : null;
    }

    public Map<String, UUID> newCache() {
        return new HashMap<>();
    }

    public UUID load(String filename, Map<String, UUID> cache) {
        if (filename == null || filename.isBlank()) {
            return null;
        }
        return cache.computeIfAbsent(filename, this::upsert);
    }

    Path imageDir() {
        String configured = seedProperties.ts10ImageDir();
        if (configured != null && !configured.isBlank()) {
            Path path = Path.of(configured).toAbsolutePath().normalize();
            if (Files.isDirectory(path)) {
                return path;
            }
            throw new IllegalStateException("TS10 image dir not found: " + path);
        }
        Path cwd = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
        List<Path> candidates = List.of(
                cwd.resolve("frontend/public/ts10/q"),
                cwd.resolve("Frontend/public/ts10/q"),
                cwd.resolve("../frontend/public/ts10/q"),
                cwd.resolve("../Frontend/public/ts10/q")
        );
        for (Path candidate : candidates) {
            Path normalized = candidate.normalize();
            if (Files.isDirectory(normalized)) {
                return normalized;
            }
        }
        throw new IllegalStateException("TS10 image dir not found from " + cwd);
    }

    private UUID upsert(String filename) {
        return questionImageRepository.findByFilename(filename)
                .map(QuestionImage::getId)
                .orElseGet(() -> saveFile(filename));
    }

    private UUID saveFile(String filename) {
        Path dir = imageDir();
        Path file = dir.resolve(filename).normalize();
        if (!file.startsWith(dir) || !Files.isRegularFile(file)) {
            throw new IllegalStateException("Missing TS10 snapshot: " + filename);
        }
        try {
            byte[] bytes = Files.readAllBytes(file);
            return questionImageRepository.save(QuestionImage.create(filename, "image/png", bytes)).getId();
        } catch (IOException ex) {
            throw new IllegalStateException("Cannot read TS10 snapshot: " + filename, ex);
        }
    }
}
