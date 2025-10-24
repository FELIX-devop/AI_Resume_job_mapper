package com.resumematcher.service;

import com.resumematcher.model.Job;
import com.resumematcher.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    public Job createJob(Job job) {
        return jobRepository.save(job);
    }

    public Optional<Job> getJobById(String id) {
        return jobRepository.findById(id);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public List<Job> getJobsByDomain(String domain) {
        return jobRepository.findByDomain(domain);
    }

    public List<Job> searchJobsByTitle(String title) {
        return jobRepository.findByTitleContainingIgnoreCase(title);
    }

    public void deleteJob(String id) {
        jobRepository.deleteById(id);
    }
}
