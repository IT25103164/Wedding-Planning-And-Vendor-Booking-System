package com.wedding.weddingsystem.config;

import com.wedding.weddingsystem.model.Admin;
import com.wedding.weddingsystem.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    private static final String ADMIN_EMAIL    = "admin@gmail.com";
    private static final String ADMIN_PASSWORD = "Admin123";

    @Override
    public void run(String... args) {
        if (adminRepository.findByEmail(ADMIN_EMAIL) == null) {
            Admin admin = new Admin();
            admin.setEmail(ADMIN_EMAIL);
            admin.setPassword(ADMIN_PASSWORD);

            adminRepository.save(admin);
            System.out.println("✅ Default admin account seeded: " + ADMIN_EMAIL);
        } else {
            System.out.println("ℹ️  Admin account already exists — skipping seed.");
        }
    }
}
