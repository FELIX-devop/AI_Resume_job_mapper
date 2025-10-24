package com.resumematcher.controller;

import com.resumematcher.model.Resume;
import com.resumematcher.service.ResumeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ResumeController.class)
class ResumeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ResumeService resumeService;

    @Test
    void testUploadResume() throws Exception {
        // Mock service response
        Resume mockResume = new Resume();
        mockResume.setId("123");
        mockResume.setFileName("test.pdf");
        mockResume.setDomain("Fullstack");
        
        when(resumeService.uploadAndEvaluateResume(any(), anyString(), anyString()))
            .thenReturn(mockResume);

        // Create mock file
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.pdf", "application/pdf", "test content".getBytes()
        );

        // Perform request
        mockMvc.perform(multipart("/api/uploadResume")
                .file(file)
                .param("jobText", "Software Engineer position")
                .param("domain", "Fullstack"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("123"))
                .andExpect(jsonPath("$.fileName").value("test.pdf"))
                .andExpect(jsonPath("$.domain").value("Fullstack"));
    }

    @Test
    void testGetResume() throws Exception {
        // Mock service response
        Resume mockResume = new Resume();
        mockResume.setId("123");
        mockResume.setFileName("test.pdf");
        
        when(resumeService.getResumeById("123"))
            .thenReturn(Optional.of(mockResume));

        // Perform request
        mockMvc.perform(get("/api/resumes/123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("123"))
                .andExpect(jsonPath("$.fileName").value("test.pdf"));
    }

    @Test
    void testGetResumeNotFound() throws Exception {
        // Mock service response
        when(resumeService.getResumeById("999"))
            .thenReturn(Optional.empty());

        // Perform request
        mockMvc.perform(get("/api/resumes/999"))
                .andExpect(status().isNotFound());
    }
}
