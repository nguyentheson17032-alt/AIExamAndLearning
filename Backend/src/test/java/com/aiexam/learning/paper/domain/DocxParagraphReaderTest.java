package com.aiexam.learning.paper.domain;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DocxParagraphReaderTest {

    @Test
    void splitsQuestionsOnCauHeadings() throws Exception {
        byte[] docx;
        try (XWPFDocument document = new XWPFDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            document.createParagraph().createRun().setText("Đề Lý");
            document.createParagraph().createRun().setText("Câu 1. Một vật");
            document.createParagraph().createRun().setText("A. 1 m");
            document.createParagraph().createRun().setText("Câu 2. Hai vật");
            document.write(out);
            docx = out.toByteArray();
        }

        List<String> questions = DocxParagraphReader.questions(
                DocxParagraphReader.paragraphs(new ByteArrayInputStream(docx)));

        assertThat(questions).hasSize(2);
        assertThat(questions.get(0)).startsWith("Câu 1").contains("A. 1 m");
        assertThat(questions.get(1)).isEqualTo("Câu 2. Hai vật");
    }

    @Test
    void withoutCauMarkers_usesTheWholeText() {
        assertThat(DocxParagraphReader.questions(List.of("Chỉ một đoạn văn")))
                .containsExactly("Chỉ một đoạn văn");
    }

    @Test
    void titleComesFromTheFileName() {
        assertThat(DocxExamImportService.titleOf("  ", "C:\\de\\de-ly.docx")).isEqualTo("de-ly");
        assertThat(UploadedExamStore.filenameIn("[[img:e01-i-01.png]]")).isEqualTo("e01-i-01.png");
    }
}
