package com.wedding.weddingsystem.controller;

import com.wedding.weddingsystem.model.Admin;
import com.wedding.weddingsystem.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;

    @PostMapping("/login")
    public Object adminLogin(@RequestBody Admin request) {

        Admin admin = adminRepository.findByEmail(request.getEmail());

        if (admin == null) {
            return "Admin email not found";
        }

        if (!admin.getPassword().equals(request.getPassword())) {
            return "Incorrect admin password";
        }

        return admin;
    }
}
