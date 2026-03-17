package com.wedding.weddingsystem.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "user_actions")
public class UserAction {

    @Id
    private String id;
    
    private String email;
    private String role; // ADMIN, VENDOR, CUSTOMER
    private String actionType; // SIGNUP, LOGIN, LOGOUT
    private LocalDateTime timestamp;

    public UserAction() {
    }

    public UserAction(String email, String role, String actionType, LocalDateTime timestamp) {
        this.email = email;
        this.role = role;
        this.actionType = actionType;
        this.timestamp = timestamp;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
