package com.resumematcher.service;

import com.resumematcher.model.Resume;
import com.resumematcher.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    private final WebClient webClient;

    public ResumeService() {
        this.webClient = WebClient.builder().build();
    }

    public Resume uploadAndEvaluateResume(MultipartFile file, String jobText, String domain) {
        try {
            // Extract text from file
            String resumeText = extractTextFromFile(file);
            
            // Create resume object
            Resume resume = new Resume(file.getOriginalFilename(), resumeText, domain);
            
            // Call ML service for evaluation
            Resume.EvaluationResult evaluationResult = callMLService(resumeText, jobText, domain);
            resume.setEvaluationResult(evaluationResult);
            
            // Parse entities from ML response
            Resume.ParsedEntities parsedEntities = new Resume.ParsedEntities();
            // This would be populated from ML service response
            resume.setParsedEntities(parsedEntities);
            
            // Save to database
            return resumeRepository.save(resume);
            
        } catch (Exception e) {
            throw new RuntimeException("Error processing resume: " + e.getMessage(), e);
        }
    }

    public Optional<Resume> getResumeById(String id) {
        return resumeRepository.findById(id);
    }

    public List<Resume> getAllResumes() {
        return resumeRepository.findAll();
    }

    public List<Resume> getResumesByDomain(String domain) {
        return resumeRepository.findByDomain(domain);
    }

    private String extractTextFromFile(MultipartFile file) throws IOException {
        // Simple text extraction - in production, you'd use libraries like Apache Tika
        if (file.getOriginalFilename().endsWith(".txt")) {
            return new String(file.getBytes(), StandardCharsets.UTF_8);
        } else {
            // For PDF/DOCX files, you'd need additional libraries
            return "Extracted text from " + file.getOriginalFilename();
        }
    }

    private Resume.EvaluationResult callMLService(String resumeText, String jobText, String domain) {
        try {
            // Prepare request data
            String requestBody = String.format(
                "resume_text=%s&job_text=%s&domain=%s",
                java.net.URLEncoder.encode(resumeText, StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(jobText, StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(domain, StandardCharsets.UTF_8)
            );

            // Call ML service
            String response = webClient.post()
                .uri(mlServiceUrl + "/evaluate")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

            // Parse response and create EvaluationResult
            return parseMLResponse(response);
            
        } catch (Exception e) {
            throw new RuntimeException("Error calling ML service: " + e.getMessage(), e);
        }
    }

    private Resume.EvaluationResult parseMLResponse(String response) {
        // Simple parsing - in production, you'd use proper JSON parsing
        Resume.EvaluationResult result = new Resume.EvaluationResult();
        result.setFinalScore(0.75); // Mock score
        result.setRecommendation("Good Match");
        result.setBestModelName("minilm");
        return result;
    }
}
