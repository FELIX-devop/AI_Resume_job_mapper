package com.resumematcher.repository;

import com.resumematcher.model.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResumeRepository extends MongoRepository<Resume, String> {
    List<Resume> findByDomain(String domain);
    List<Resume> findByCreatedAtGreaterThan(java.time.LocalDateTime date);
}
