package com.hktms.tsys.domain;

import java.time.LocalDateTime;
import java.util.List;

public class CodeGroupDTO {
    private Long codeGroupId;
    private String groupCode;
    private String groupName;
    private String description;
    private Integer sortOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Long createdId;
    private Long updatedId;
    private Long deletedId;
    private String businessUnit;
    private String categoryLevel;
    private String parentGroupCode;
    private String parentCodeValue;
    private List<CodeDTO> codes;

    public Long getCodeGroupId() { return codeGroupId; }
    public void setCodeGroupId(Long codeGroupId) { this.codeGroupId = codeGroupId; }
    public String getGroupCode() { return groupCode; }
    public void setGroupCode(String groupCode) { this.groupCode = groupCode; }
    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Long getCreatedId() { return createdId; }
    public void setCreatedId(Long createdId) { this.createdId = createdId; }
    public Long getUpdatedId() { return updatedId; }
    public void setUpdatedId(Long updatedId) { this.updatedId = updatedId; }
    public Long getDeletedId() { return deletedId; }
    public void setDeletedId(Long deletedId) { this.deletedId = deletedId; }
    public String getBusinessUnit() { return businessUnit; }
    public void setBusinessUnit(String businessUnit) { this.businessUnit = businessUnit; }
    public String getCategoryLevel() { return categoryLevel; }
    public void setCategoryLevel(String categoryLevel) { this.categoryLevel = categoryLevel; }
    public String getParentGroupCode() { return parentGroupCode; }
    public void setParentGroupCode(String parentGroupCode) { this.parentGroupCode = parentGroupCode; }
    public String getParentCodeValue() { return parentCodeValue; }
    public void setParentCodeValue(String parentCodeValue) { this.parentCodeValue = parentCodeValue; }
    public List<CodeDTO> getCodes() { return codes; }
    public void setCodes(List<CodeDTO> codes) { this.codes = codes; }
}
