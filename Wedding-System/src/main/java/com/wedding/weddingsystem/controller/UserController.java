package com.wedding.weddingsystem.controller;

import com.wedding.weddingsystem.model.User;
import com.wedding.weddingsystem.service.UserService;
import com.wedding.weddingsystem.service.UserService.LoginResult;
import com.wedding.weddingsystem.service.UserService.LoginStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // ── REGISTER ───────────────────────────────────────────────
    // Delegates to UserService which routes to the correct collection:
    //   CUSTOMER → customers | VENDOR → vendors | ADMIN → admins
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            String savedId = userService.registerUser(user);
            return ResponseEntity.ok().body(Map.of(
                "message", "Account created successfully",
                "id",      savedId,
                "role",    user.getRole().toUpperCase()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "An error occurred during registration"));
        }
    }

    // ── LOGIN ──────────────────────────────────────────────────
    // Checks customers → vendors → admins (admin) collections
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        try {
            String email    = credentials.get("email");
            String password = credentials.get("password");

            if (email == null || password == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email and password are required"));
            }

            LoginResult result = userService.loginUser(email.trim(), password);

            return switch (result.status()) {

                // ❌ Email not in any collection → sign-up popup
                case USER_NOT_FOUND -> ResponseEntity.status(404).body(Map.of(
                    "message",   "No account found with this email. Please sign up first.",
                    "errorCode", "USER_NOT_FOUND"
                ));

                // ❌ Found but wrong password
                case WRONG_PASSWORD -> ResponseEntity.status(401).body(Map.of(
                    "message",   "Incorrect password. Please try again.",
                    "errorCode", "WRONG_PASSWORD"
                ));

                // ✅ Success — returns role for frontend redirect
                case SUCCESS -> ResponseEntity.ok().body(Map.of(
                    "message",   "Login successful",
                    "id",        result.id(),
                    "firstName", result.firstName(),
                    "lastName",  result.lastName(),
                    "email",     result.email(),
                    "role",      result.role()   // CUSTOMER | VENDOR | ADMIN
                ));
            };

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "An error occurred during login"));
        }
    }
}

