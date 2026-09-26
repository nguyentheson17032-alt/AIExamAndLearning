package com.aiexam.learning.paper.domain;

import org.apache.poi.xwpf.usermodel.IBodyElement;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public final class DocxParagraphReader {

    static final int MAX_QUESTIONS = 99;
    private static final int MAX_STEM_CHARS = 12_000;
    private static final Pattern QUESTION_START = Pattern.compile("(?i)^\\s*câu\\s+\\d+\\b.*");

    private DocxParagraphReader() {}

    public static List<String> paragraphs(InputStream input) throws IOException {
        try (XWPFDocument document = new XWPFDocument(input)) {
            List<String> lines = new ArrayList<>();
            for (IBodyElement element : document.getBodyElements()) {
                if (element instanceof XWPFParagraph paragraph) {
                    add(lines, paragraph.getText());
                } else if (element instanceof XWPFTable table) {
                    for (XWPFTableRow row : table.getRows()) {
                        for (XWPFTableCell cell : row.getTableCells()) {
                            add(lines, cell.getText());
                        }
                    }
                }
            }
            return lines;
        }
    }

    public static List<String> questions(List<String> paragraphs) {
        List<String> questions = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean started = false;
        for (String raw : paragraphs) {
            String line = raw.trim();
            if (line.isEmpty()) {
                continue;
            }
            if (QUESTION_START.matcher(line).matches()) {
                flush(questions, current);
                if (questions.size() >= MAX_QUESTIONS) {
                    return questions;
                }
                current.append(clip(line));
                started = true;
            } else if (started && questions.size() < MAX_QUESTIONS) {
                append(current, line);
            }
        }
        flush(questions, current);
        if (!questions.isEmpty()) {
            return questions.size() > MAX_QUESTIONS ? questions.subList(0, MAX_QUESTIONS) : questions;
        }
        String all = paragraphs.stream().map(String::trim).filter(line -> !line.isEmpty()).reduce((a, b) -> a + "\n" + b).orElse("");
        if (all.isBlank()) {
            return List.of();
        }
        return List.of(clip(all));
    }

    private static void add(List<String> lines, String text) {
        if (text != null && !text.isBlank()) {
            lines.add(text.trim());
        }
    }

    private static void append(StringBuilder current, String line) {
        if (current.length() >= MAX_STEM_CHARS) {
            return;
        }
        if (!current.isEmpty()) {
            current.append('\n');
        }
        current.append(clip(line));
        if (current.length() > MAX_STEM_CHARS) {
            current.setLength(MAX_STEM_CHARS);
        }
    }

    private static void flush(List<String> questions, StringBuilder current) {
        if (current.isEmpty() || questions.size() >= MAX_QUESTIONS) {
            current.setLength(0);
            return;
        }
        questions.add(current.toString());
        current.setLength(0);
    }

    private static String clip(String text) {
        return text.length() <= MAX_STEM_CHARS ? text : text.substring(0, MAX_STEM_CHARS);
    }
}
