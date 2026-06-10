package com.hktms.tsys.domain;

import java.time.LocalDateTime;

public class UserDTO {
    private Long userId;
    private String loginId;
    private String userName;
    private String password;
    private String organization;
    private String role;
    private String email;
    private String phone;
    private Boolean isActive;
    private Long createdId;
    private LocalDateTime createdAt;
    private Long updatedId;
    private LocalDateTime updatedAt;
    private Long deletedId;
    private LocalDateTime deletedAt;
    private String keyword;
    private int page;
    private int size;
    private int offset;

    // Getters & Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getLoginId() { return loginId; }
    public void setLoginId(String loginId) { this.loginId = loginId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Long getCreatedId() { return createdId; }
    public void setCreatedId(Long createdId) { this.createdId = createdId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Long getUpdatedId() { return updatedId; }
    public void setUpdatedId(Long updatedId) { this.updatedId = updatedId; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Long getDeletedId() { return deletedId; }
    public void setDeletedId(Long deletedId) { this.deletedId = deletedId; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    public int getOffset() { return offset; }
    public void setOffset(int offset) { this.offset = offset; }
    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
}