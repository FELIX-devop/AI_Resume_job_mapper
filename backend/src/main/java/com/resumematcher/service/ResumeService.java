package com.resumematcher.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
            Map<String, Object> mlResponse = callMLService(resumeText, jobText, domain);
            
            // Parse evaluation result from ML response
            Resume.EvaluationResult evaluationResult = parseEvaluationResult(mlResponse);
            resume.setEvaluationResult(evaluationResult);
            
            // Parse entities from ML response
            Resume.ParsedEntities parsedEntities = parseParsedEntities(mlResponse);
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

    private Map<String, Object> callMLService(String resumeText, String jobText, String domain) {
        try {
            // Create multipart body with boundary
            String boundary = "----WebKitFormBoundary" + System.currentTimeMillis();
            String multipartBody = createMultipartBody(resumeText, jobText, domain, boundary);
            
            // Call ML service using multipart form data
            String response = webClient.post()
                .uri(mlServiceUrl + "/evaluate")
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .bodyValue(multipartBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

            // Parse JSON response
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(response, Map.class);
            
        } catch (Exception e) {
            throw new RuntimeException("Error calling ML service: " + e.getMessage(), e);
        }
    }

    private String createMultipartBody(String resumeText, String jobText, String domain, String boundary) {
        // Create multipart form data manually with proper boundary
        StringBuilder body = new StringBuilder();
        
        body.append("--").append(boundary).append("\r\n");
        body.append("Content-Disposition: form-data; name=\"resume_text\"\r\n\r\n");
        body.append(resumeText).append("\r\n");
        
        body.append("--").append(boundary).append("\r\n");
        body.append("Content-Disposition: form-data; name=\"job_text\"\r\n\r\n");
        body.append(jobText).append("\r\n");
        
        body.append("--").append(boundary).append("\r\n");
        body.append("Content-Disposition: form-data; name=\"domain\"\r\n\r\n");
        body.append(domain).append("\r\n");
        
        body.append("--").append(boundary).append("--\r\n");
        
        return body.toString();
    }

    private Resume.EvaluationResult parseEvaluationResult(Map<String, Object> mlResponse) {
        Resume.EvaluationResult result = new Resume.EvaluationResult();
        
        // Parse similarity scores
        Map<String, Object> similarityScores = (Map<String, Object>) mlResponse.get("similarity_scores");
        if (similarityScores != null) {
            Map<String, Double> scores = new HashMap<>();
            similarityScores.forEach((key, value) -> {
                if (value instanceof Number) {
                    scores.put(key, ((Number) value).doubleValue());
                }
            });
            result.setSimilarityScores(scores);
        }
        
        // Parse ratios and scores
        result.setSkillMatchRatio(((Number) mlResponse.getOrDefault("skill_match_ratio", 0.0)).doubleValue());
        result.setExperienceMatchRatio(((Number) mlResponse.getOrDefault("experience_match_ratio", 0.0)).doubleValue());
        result.setEducationMatchRatio(((Number) mlResponse.getOrDefault("education_match_ratio", 0.0)).doubleValue());
        result.setFinalScore(((Number) mlResponse.getOrDefault("final_score", 0.0)).doubleValue());
        
        // Parse other fields
        result.setBestModelName((String) mlResponse.getOrDefault("best_model_name", "unknown"));
        result.setRecommendation((String) mlResponse.getOrDefault("recommendation", "Unknown"));
        
        // Parse matched and missing skills
        List<String> matchedSkills = (List<String>) mlResponse.get("matched_skills");
        List<String> missingSkills = (List<String>) mlResponse.get("missing_skills");
        result.setMatchedSkills(matchedSkills != null ? matchedSkills : new ArrayList<>());
        result.setMissingSkills(missingSkills != null ? missingSkills : new ArrayList<>());
        
        // Parse feature importances
        Map<String, Object> featureImportances = (Map<String, Object>) mlResponse.get("feature_importances");
        if (featureImportances != null) {
            Map<String, Double> importances = new HashMap<>();
            featureImportances.forEach((key, value) -> {
                if (value instanceof Number) {
                    importances.put(key, ((Number) value).doubleValue());
                }
            });
            result.setFeatureImportances(importances);
        }
        
        return result;
    }

    private Resume.ParsedEntities parseParsedEntities(Map<String, Object> mlResponse) {
        Resume.ParsedEntities entities = new Resume.ParsedEntities();
        
        Map<String, Object> parsedEntities = (Map<String, Object>) mlResponse.get("parsed_entities");
        if (parsedEntities != null) {
            // Parse skills
            List<String> skills = (List<String>) parsedEntities.get("skills");
            entities.setSkills(skills != null ? skills : new ArrayList<>());
            
            // Parse job titles
            List<String> jobTitles = (List<String>) parsedEntities.get("job_titles");
            entities.setJobTitles(jobTitles != null ? jobTitles : new ArrayList<>());
            
            // Parse companies
            List<String> companies = (List<String>) parsedEntities.get("companies");
            entities.setCompanies(companies != null ? companies : new ArrayList<>());
            
            // Parse education
            List<String> education = (List<String>) parsedEntities.get("education");
            entities.setEducation(education != null ? education : new ArrayList<>());
            
            // Parse experience years
            entities.setExperienceYears(((Number) parsedEntities.getOrDefault("experience_years", 0)).intValue());
            
            // Parse raw text
            entities.setRawText((String) parsedEntities.get("raw_text"));
        }
        
        return entities;
    }
}
