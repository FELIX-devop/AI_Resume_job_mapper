package com.resumematcher.controller;

import com.resumematcher.model.Job;
import com.resumematcher.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping("/jobs")
    public ResponseEntity<Job> createJob(@RequestBody Job job) {
        try {
            Job createdJob = jobService.createJob(job);
            return ResponseEntity.ok(createdJob);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getAllJobs() {
        List<Job> jobs = jobService.getAllJobs();
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<Job> getJob(@PathVariable String id) {
        Optional<Job> job = jobService.getJobById(id);
        return job.map(ResponseEntity::ok)
                 .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/jobs/domain/{domain}")
    public ResponseEntity<List<Job>> getJobsByDomain(@PathVariable String domain) {
        List<Job> jobs = jobService.getJobsByDomain(domain);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/jobs/search")
    public ResponseEntity<List<Job>> searchJobs(@RequestParam String title) {
        List<Job> jobs = jobService.searchJobsByTitle(title);
        return ResponseEntity.ok(jobs);
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable String id) {
        try {
            jobService.deleteJob(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
