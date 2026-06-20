package com.hktms.tsys.domain;

import java.time.LocalDateTime;
import java.util.List;

public class DefectDTO {
    private Long defectId;
    private Long testCaseId;
    private String testCaseName;
    private String testCaseContent;
    private String businessName;
    private String businessUnit;
    private String majorCategory;
    private String middleCategory;
    private String businessUnitName;
    private String majorCategoryName;
    private String middleCategoryName;
    private String title;
    private String content;
    private Long registrantId;
    private String registrantName;
    private Long developerId;
    private String developerName;
    private String defectStatus;
    private String defectStatusName;
    private String fixContent;
    private Boolean isFinalClosed;
    private Long createdId;
    private LocalDateTime createdAt;
    private Long updatedId;
    private LocalDateTime updatedAt;
    private Long deletedId;
    private LocalDateTime deletedAt;
    private List<AttachmentDTO> attachments;

    // 검색 파라미터
    private String keyword;
    private String searchStatus;
    private String searchBusinessUnit;
    private String searchMajorCategory;
    private String searchMiddleCategory;
    private int page;
    private int size;
    private int offset;

    public Long getDefectId() { return defectId; }
    public void setDefectId(Long defectId) { this.defectId = defectId; }
    public Long getTestCaseId() { return testCaseId; }
    public void setTestCaseId(Long testCaseId) { this.testCaseId = testCaseId; }
    public String getTestCaseName() { return testCaseName; }
    public void setTestCaseName(String testCaseName) { this.testCaseName = testCaseName; }
    public String getTestCaseContent() { return testCaseContent; }
    public void setTestCaseContent(String testCaseContent) { this.testCaseContent = testCaseContent; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getBusinessUnit() { return businessUnit; }
    public void setBusinessUnit(String businessUnit) { this.businessUnit = businessUnit; }
    public String getMajorCategory() { return majorCategory; }
    public void setMajorCategory(String majorCategory) { this.majorCategory = majorCategory; }
    public String getMiddleCategory() { return middleCategory; }
    public void setMiddleCategory(String middleCategory) { this.middleCategory = middleCategory; }
    public String getBusinessUnitName() { return businessUnitName; }
    public void setBusinessUnitName(String businessUnitName) { this.businessUnitName = businessUnitName; }
    public String getMajorCategoryName() { return majorCategoryName; }
    public void setMajorCategoryName(String majorCategoryName) { this.majorCategoryName = majorCategoryName; }
    public String getMiddleCategoryName() { return middleCategoryName; }
    public void setMiddleCategoryName(String middleCategoryName) { this.middleCategoryName = middleCategoryName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Long getRegistrantId() { return registrantId; }
    public void setRegistrantId(Long registrantId) { this.registrantId = registrantId; }
    public String getRegistrantName() { return registrantName; }
    public void setRegistrantName(String registrantName) { this.registrantName = registrantName; }
    public Long getDeveloperId() { return developerId; }
    public void setDeveloperId(Long developerId) { this.developerId = developerId; }
    public String getDeveloperName() { return developerName; }
    public void setDeveloperName(String developerName) { this.developerName = developerName; }
    public String getDefectStatus() { return defectStatus; }
    public void setDefectStatus(String defectStatus) { this.defectStatus = defectStatus; }
    public String getDefectStatusName() { return defectStatusName; }
    public void setDefectStatusName(String defectStatusName) { this.defectStatusName = defectStatusName; }
    public String getFixContent() { return fixContent; }
    public void setFixContent(String fixContent) { this.fixContent = fixContent; }
    public Boolean getIsFinalClosed() { return isFinalClosed; }
    public void setIsFinalClosed(Boolean isFinalClosed) { this.isFinalClosed = isFinalClosed; }
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
    public List<AttachmentDTO> getAttachments() { return attachments; }
    public void setAttachments(List<AttachmentDTO> attachments) { this.attachments = attachments; }
    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
    public String getSearchStatus() { return searchStatus; }
    public void setSearchStatus(String searchStatus) { this.searchStatus = searchStatus; }
    public String getSearchBusinessUnit() { return searchBusinessUnit; }
    public void setSearchBusinessUnit(String searchBusinessUnit) { this.searchBusinessUnit = searchBusinessUnit; }
    public String getSearchMajorCategory() { return searchMajorCategory; }
    public void setSearchMajorCategory(String searchMajorCategory) { this.searchMajorCategory = searchMajorCategory; }
    public String getSearchMiddleCategory() { return searchMiddleCategory; }
    public void setSearchMiddleCategory(String searchMiddleCategory) { this.searchMiddleCategory = searchMiddleCategory; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    public int getOffset() { return offset; }
    public void setOffset(int offset) { this.offset = offset; }
}