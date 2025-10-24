package com.resumematcher.controller;

import com.resumematcher.model.Resume;
import com.resumematcher.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping("/uploadResume")
    public ResponseEntity<Resume> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("jobText") String jobText,
            @RequestParam("domain") String domain) {
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Resume resume = resumeService.uploadAndEvaluateResume(file, jobText, domain);
            return ResponseEntity.ok(resume);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/resumes/{id}")
    public ResponseEntity<Resume> getResume(@PathVariable String id) {
        Optional<Resume> resume = resumeService.getResumeById(id);
        return resume.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/resumes")
    public ResponseEntity<List<Resume>> getAllResumes() {
        List<Resume> resumes = resumeService.getAllResumes();
        return ResponseEntity.ok(resumes);
    }

    @GetMapping("/resumes/domain/{domain}")
    public ResponseEntity<List<Resume>> getResumesByDomain(@PathVariable String domain) {
        List<Resume> resumes = resumeService.getResumesByDomain(domain);
        return ResponseEntity.ok(resumes);
    }
}
