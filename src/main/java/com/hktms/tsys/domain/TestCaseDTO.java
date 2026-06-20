package com.hktms.tsys.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TestCaseDTO {
    private Long testCaseId;
    private String businessUnit;
    private String majorCategory;
    private String middleCategory;
    private String minorCategory;
    private String businessUnitName;
    private String majorCategoryName;
    private String middleCategoryName;
    private String minorCategoryName;
    private String testCaseName;
    private String testContent;
    private String inputData;
    private String expectedResult;
    private Long developerId;
    private String developerName;
    private Long testerId;
    private String testerName;
    private Boolean isTestAvailable;
    private String testStatus;
    private String testStatusName;
    private String testResult;
    private LocalDate completedDate;
    private Boolean isRetestRequested;
    private String remark;
    private Long createdId;
    private LocalDateTime createdAt;
    private Long updatedId;
    private LocalDateTime updatedAt;
    private Long deletedId;
    private LocalDateTime deletedAt;

    // 검색 파라미터
    private String keyword;
    private String searchStatus;
    private String searchCategory;
    private int page;
    private int size;
    private int offset;

    public Long getTestCaseId() { return testCaseId; }
    public void setTestCaseId(Long testCaseId) { this.testCaseId = testCaseId; }
    public String getBusinessUnit() { return businessUnit; }
    public void setBusinessUnit(String businessUnit) { this.businessUnit = businessUnit; }
    public String getBusinessUnitName() { return businessUnitName; }
    public void setBusinessUnitName(String businessUnitName) { this.businessUnitName = businessUnitName; }
    public String getMajorCategoryName() { return majorCategoryName; }
    public void setMajorCategoryName(String majorCategoryName) { this.majorCategoryName = majorCategoryName; }
    public String getMiddleCategoryName() { return middleCategoryName; }
    public void setMiddleCategoryName(String middleCategoryName) { this.middleCategoryName = middleCategoryName; }
    public String getMinorCategoryName() { return minorCategoryName; }
    public void setMinorCategoryName(String minorCategoryName) { this.minorCategoryName = minorCategoryName; }
    public String getMajorCategory() { return majorCategory; }
    public void setMajorCategory(String majorCategory) { this.majorCategory = majorCategory; }
    public String getMiddleCategory() { return middleCategory; }
    public void setMiddleCategory(String middleCategory) { this.middleCategory = middleCategory; }
    public String getMinorCategory() { return minorCategory; }
    public void setMinorCategory(String minorCategory) { this.minorCategory = minorCategory; }
    public String getTestCaseName() { return testCaseName; }
    public void setTestCaseName(String testCaseName) { this.testCaseName = testCaseName; }
    public String getTestContent() { return testContent; }
    public void setTestContent(String testContent) { this.testContent = testContent; }
    public String getInputData() { return inputData; }
    public void setInputData(String inputData) { this.inputData = inputData; }
    public String getExpectedResult() { return expectedResult; }
    public void setExpectedResult(String expectedResult) { this.expectedResult = expectedResult; }
    public Long getDeveloperId() { return developerId; }
    public void setDeveloperId(Long developerId) { this.developerId = developerId; }
    public String getDeveloperName() { return developerName; }
    public void setDeveloperName(String developerName) { this.developerName = developerName; }
    public Long getTesterId() { return testerId; }
    public void setTesterId(Long testerId) { this.testerId = testerId; }
    public String getTesterName() { return testerName; }
    public void setTesterName(String testerName) { this.testerName = testerName; }
    public Boolean getIsTestAvailable() { return isTestAvailable; }
    public void setIsTestAvailable(Boolean isTestAvailable) { this.isTestAvailable = isTestAvailable; }
    public String getTestStatus() { return testStatus; }
    public void setTestStatus(String testStatus) { this.testStatus = testStatus; }
    public String getTestStatusName() { return testStatusName; }
    public void setTestStatusName(String testStatusName) { this.testStatusName = testStatusName; }
    public String getTestResult() { return testResult; }
    public void setTestResult(String testResult) { this.testResult = testResult; }
    public LocalDate getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDate completedDate) { this.completedDate = completedDate; }
    public Boolean getIsRetestRequested() { return isRetestRequested; }
    public void setIsRetestRequested(Boolean isRetestRequested) { this.isRetestRequested = isRetestRequested; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
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
    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
    public String getSearchStatus() { return searchStatus; }
    public void setSearchStatus(String searchStatus) { this.searchStatus = searchStatus; }
    public String getSearchCategory() { return searchCategory; }
    public void setSearchCategory(String searchCategory) { this.searchCategory = searchCategory; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    public int getOffset() { return offset; }
    public void setOffset(int offset) { this.offset = offset; }
}