package com.resumematcher.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "jobs")
public class Job {
    @Id
    private String id;
    private String jobText;
    private List<String> requiredSkills;
    private String domain;
    private Map<String, List<Double>> jobEmbeddings; // Model name -> embedding vector
    private LocalDateTime createdAt;
    private String title;
    private String company;
    private String location;

    // Constructors
    public Job() {
        this.createdAt = LocalDateTime.now();
    }

    public Job(String jobText, List<String> requiredSkills, String domain) {
        this();
        this.jobText = jobText;
        this.requiredSkills = requiredSkills;
        this.domain = domain;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getJobText() {
        return jobText;
    }

    public void setJobText(String jobText) {
        this.jobText = jobText;
    }

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public Map<String, List<Double>> getJobEmbeddings() {
        return jobEmbeddings;
    }

    public void setJobEmbeddings(Map<String, List<Double>> jobEmbeddings) {
        this.jobEmbeddings = jobEmbeddings;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
