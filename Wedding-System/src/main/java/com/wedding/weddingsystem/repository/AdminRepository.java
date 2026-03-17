package com.wedding.weddingsystem.repository;

import com.wedding.weddingsystem.model.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepository extends MongoRepository<Admin, String> {

    Admin findByEmail(String email);

}
