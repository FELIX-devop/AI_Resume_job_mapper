package com.resumematcher.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "resumes")
public class Resume {
    @Id
    private String id;
    private String fileName;
    private String rawText;
    private ParsedEntities parsedEntities;
    private EvaluationResult evaluationResult;
    private LocalDateTime createdAt;
    private String domain;

    // Constructors
    public Resume() {
        this.createdAt = LocalDateTime.now();
    }

    public Resume(String fileName, String rawText, String domain) {
        this();
        this.fileName = fileName;
        this.rawText = rawText;
        this.domain = domain;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
    }

    public ParsedEntities getParsedEntities() {
        return parsedEntities;
    }

    public void setParsedEntities(ParsedEntities parsedEntities) {
        this.parsedEntities = parsedEntities;
    }

    public EvaluationResult getEvaluationResult() {
        return evaluationResult;
    }

    public void setEvaluationResult(EvaluationResult evaluationResult) {
        this.evaluationResult = evaluationResult;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    // Inner classes
    public static class ParsedEntities {
        private List<String> skills;
        private List<String> jobTitles;
        private List<String> companies;
        private List<String> education;
        private int experienceYears;
        private String rawText;

        // Constructors
        public ParsedEntities() {}

        // Getters and Setters
        public List<String> getSkills() {
            return skills;
        }

        public void setSkills(List<String> skills) {
            this.skills = skills;
        }

        public List<String> getJobTitles() {
            return jobTitles;
        }

        public void setJobTitles(List<String> jobTitles) {
            this.jobTitles = jobTitles;
        }

        public List<String> getCompanies() {
            return companies;
        }

        public void setCompanies(List<String> companies) {
            this.companies = companies;
        }

        public List<String> getEducation() {
            return education;
        }

        public void setEducation(List<String> education) {
            this.education = education;
        }

        public int getExperienceYears() {
            return experienceYears;
        }

        public void setExperienceYears(int experienceYears) {
            this.experienceYears = experienceYears;
        }

        public String getRawText() {
            return rawText;
        }

        public void setRawText(String rawText) {
            this.rawText = rawText;
        }
    }

    public static class EvaluationResult {
        private Map<String, Double> similarityScores;
        private double skillMatchRatio;
        private double experienceMatchRatio;
        private double educationMatchRatio;
        private double finalScore;
        private String bestModelName;
        private List<String> matchedSkills;
        private List<String> missingSkills;
        private String recommendation;
        private Map<String, Double> featureImportances;
        private String jobText;

        // Constructors
        public EvaluationResult() {}

        // Getters and Setters
        public Map<String, Double> getSimilarityScores() {
            return similarityScores;
        }

        public void setSimilarityScores(Map<String, Double> similarityScores) {
            this.similarityScores = similarityScores;
        }

        public double getSkillMatchRatio() {
            return skillMatchRatio;
        }

        public void setSkillMatchRatio(double skillMatchRatio) {
            this.skillMatchRatio = skillMatchRatio;
        }

        public double getExperienceMatchRatio() {
            return experienceMatchRatio;
        }

        public void setExperienceMatchRatio(double experienceMatchRatio) {
            this.experienceMatchRatio = experienceMatchRatio;
        }

        public double getEducationMatchRatio() {
            return educationMatchRatio;
        }

        public void setEducationMatchRatio(double educationMatchRatio) {
            this.educationMatchRatio = educationMatchRatio;
        }

        public double getFinalScore() {
            return finalScore;
        }

        public void setFinalScore(double finalScore) {
            this.finalScore = finalScore;
        }

        public String getBestModelName() {
            return bestModelName;
        }

        public void setBestModelName(String bestModelName) {
            this.bestModelName = bestModelName;
        }

        public List<String> getMatchedSkills() {
            return matchedSkills;
        }

        public void setMatchedSkills(List<String> matchedSkills) {
            this.matchedSkills = matchedSkills;
        }

        public List<String> getMissingSkills() {
            return missingSkills;
        }

        public void setMissingSkills(List<String> missingSkills) {
            this.missingSkills = missingSkills;
        }

        public String getRecommendation() {
            return recommendation;
        }

        public void setRecommendation(String recommendation) {
            this.recommendation = recommendation;
        }

        public Map<String, Double> getFeatureImportances() {
            return featureImportances;
        }

        public void setFeatureImportances(Map<String, Double> featureImportances) {
            this.featureImportances = featureImportances;
        }

        public String getJobText() {
            return jobText;
        }

        public void setJobText(String jobText) {
            this.jobText = jobText;
        }
    }
}
