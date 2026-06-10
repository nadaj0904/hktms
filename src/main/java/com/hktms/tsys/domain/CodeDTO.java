package com.hktms.tsys.domain;

public class CodeDTO {
    private Long codeId;
    private Long codeGroupId;
    private String groupCode;
    private String codeValue;
    private String codeName;
    private Integer sortOrder;
    private Boolean isActive;
    private Long createdId;
    private Long updatedId;
    private Long deletedId;

    public Long getCodeId() { return codeId; }
    public void setCodeId(Long codeId) { this.codeId = codeId; }
    public Long getCodeGroupId() { return codeGroupId; }
    public void setCodeGroupId(Long codeGroupId) { this.codeGroupId = codeGroupId; }
    public String getGroupCode() { return groupCode; }
    public void setGroupCode(String groupCode) { this.groupCode = groupCode; }
    public String getCodeValue() { return codeValue; }
    public void setCodeValue(String codeValue) { this.codeValue = codeValue; }
    public String getCodeName() { return codeName; }
    public void setCodeName(String codeName) { this.codeName = codeName; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Long getCreatedId() { return createdId; }
    public void setCreatedId(Long createdId) { this.createdId = createdId; }
    public Long getUpdatedId() { return updatedId; }
    public void setUpdatedId(Long updatedId) { this.updatedId = updatedId; }
    public Long getDeletedId() { return deletedId; }
    public void setDeletedId(Long deletedId) { this.deletedId = deletedId; }
}
