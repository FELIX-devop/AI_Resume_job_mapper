package com.resumematcher.repository;

import com.resumematcher.model.Job;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends MongoRepository<Job, String> {
    List<Job> findByDomain(String domain);
    List<Job> findByTitleContainingIgnoreCase(String title);
}
