package com.wedding.weddingsystem.service;

import com.wedding.weddingsystem.model.Customer;
import com.wedding.weddingsystem.model.Admin;
import com.wedding.weddingsystem.model.User;
import com.wedding.weddingsystem.model.Vendor;
import com.wedding.weddingsystem.repository.CustomerRepository;
import com.wedding.weddingsystem.repository.AdminRepository;
import com.wedding.weddingsystem.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired private CustomerRepository customerRepository;
    @Autowired private VendorRepository   vendorRepository;
    @Autowired private AdminRepository    adminRepository;   // ADMIN only

    // ── LOGIN RESULT ───────────────────────────────────────────
    public enum LoginStatus { SUCCESS, USER_NOT_FOUND, WRONG_PASSWORD }

    public record LoginResult(
        LoginStatus status,
        String id,
        String firstName,
        String lastName,
        String email,
        String role
    ) {}

    // ── REGISTER ───────────────────────────────────────────────
    // Routes to the correct collection based on role
    public String registerUser(User incoming) {
        String email = incoming.getEmail();
        String role  = incoming.getRole();

        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        if (role == null || role.trim().isEmpty()) {
            throw new IllegalArgumentException("Role must be selected");
        }

        // ── Duplicate check across ALL collections ─────────────
        if (customerRepository.findByEmail(email).isPresent() ||
            vendorRepository.findByEmail(email).isPresent()   ||
            adminRepository.findByEmail(email) != null) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        // ── Route to correct collection ────────────────────────
        return switch (role.toUpperCase()) {
            case "VENDOR" -> {
                Vendor v = new Vendor();
                v.setFirstName(incoming.getFirstName());
                v.setLastName(incoming.getLastName());
                v.setEmail(incoming.getEmail());
                v.setPhone(incoming.getPhone());
                v.setPassword(incoming.getPassword());
                v.setRole("VENDOR");
                yield vendorRepository.save(v).getId();
            }
            case "CUSTOMER" -> {
                Customer c = new Customer();
                c.setFirstName(incoming.getFirstName());
                c.setLastName(incoming.getLastName());
                c.setEmail(incoming.getEmail());
                c.setPhone(incoming.getPhone());
                c.setPassword(incoming.getPassword());
                c.setRole("CUSTOMER");
                yield customerRepository.save(c).getId();
            }
            default -> {
                // ADMIN or any future role → admins collection
                Admin a = new Admin();
                a.setEmail(incoming.getEmail());
                a.setPassword(incoming.getPassword());
                yield adminRepository.save(a).getId();
            }
        };
    }

    // ── LOGIN ──────────────────────────────────────────────────
    // Checks customers → vendors → admins (admin) in order
    public LoginResult loginUser(String email, String password) {

        // 1️⃣ Check customers collection
        var customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            Customer c = customerOpt.get();
            if (!c.getPassword().equals(password)) {
                return new LoginResult(LoginStatus.WRONG_PASSWORD, null, null, null, null, null);
            }
            return new LoginResult(LoginStatus.SUCCESS,
                c.getId(), c.getFirstName(), c.getLastName(), c.getEmail(), "CUSTOMER");
        }

        // 2️⃣ Check vendors collection
        var vendorOpt = vendorRepository.findByEmail(email);
        if (vendorOpt.isPresent()) {
            Vendor v = vendorOpt.get();
            if (!v.getPassword().equals(password)) {
                return new LoginResult(LoginStatus.WRONG_PASSWORD, null, null, null, null, null);
            }
            return new LoginResult(LoginStatus.SUCCESS,
                v.getId(), v.getFirstName(), v.getLastName(), v.getEmail(), "VENDOR");
        }

        // 3️⃣ Check admins collection
        Admin a = adminRepository.findByEmail(email);
        if (a != null) {
            if (!a.getPassword().equals(password)) {
                return new LoginResult(LoginStatus.WRONG_PASSWORD, null, null, null, null, null);
            }
            // Note: Admin model doesn't have names, using partial info
            return new LoginResult(LoginStatus.SUCCESS,
                a.getId(), "Admin", "User", a.getEmail(), "ADMIN");
        }

        // 4️⃣ Not found in any collection
        return new LoginResult(LoginStatus.USER_NOT_FOUND, null, null, null, null, null);
    }
}
