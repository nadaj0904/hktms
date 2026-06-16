package com.hktms.tsys.domain;

import java.util.List;

public class DashboardDTO {
    // 테스트 진행 현황
    private long totalTestCount;
    private long successCount;
    private long inProgressCount;
    private long failCount;
    private long holdCount;
    private long readyCount;
    private double testProgressRate;

    // 결함 현황
    private long totalDefectCount;
    private long analysisCount;
    private long fixingCount;
    private long fixCompleteCount;
    private long retestCount;
    private long closedCount;
    private double defectProcessRate;

    // 업무별 테스트 진행 현황
    private List<CategoryProgressDTO> categoryProgressList;

    public static class CategoryProgressDTO {
        private String majorCategory;
        private String businessUnitName;
        private long totalCount;
        private long successCount;
        private long failCount;
        private double progressRate;

        public String getMajorCategory() { return majorCategory; }
        public void setMajorCategory(String majorCategory) { this.majorCategory = majorCategory; }
        public String getBusinessUnitName() { return businessUnitName; }
        public void setBusinessUnitName(String businessUnitName) { this.businessUnitName = businessUnitName; }
        public long getTotalCount() { return totalCount; }
        public void setTotalCount(long totalCount) { this.totalCount = totalCount; }
        public long getSuccessCount() { return successCount; }
        public void setSuccessCount(long successCount) { this.successCount = successCount; }
        public long getFailCount() { return failCount; }
        public void setFailCount(long failCount) { this.failCount = failCount; }
        public double getProgressRate() { return progressRate; }
        public void setProgressRate(double progressRate) { this.progressRate = progressRate; }
    }

    public long getTotalTestCount() { return totalTestCount; }
    public void setTotalTestCount(long totalTestCount) { this.totalTestCount = totalTestCount; }
    public long getSuccessCount() { return successCount; }
    public void setSuccessCount(long successCount) { this.successCount = successCount; }
    public long getInProgressCount() { return inProgressCount; }
    public void setInProgressCount(long inProgressCount) { this.inProgressCount = inProgressCount; }
    public long getFailCount() { return failCount; }
    public void setFailCount(long failCount) { this.failCount = failCount; }
    public long getHoldCount() { return holdCount; }
    public void setHoldCount(long holdCount) { this.holdCount = holdCount; }
    public long getReadyCount() { return readyCount; }
    public void setReadyCount(long readyCount) { this.readyCount = readyCount; }
    public double getTestProgressRate() { return testProgressRate; }
    public void setTestProgressRate(double testProgressRate) { this.testProgressRate = testProgressRate; }
    public long getTotalDefectCount() { return totalDefectCount; }
    public void setTotalDefectCount(long totalDefectCount) { this.totalDefectCount = totalDefectCount; }
    public long getAnalysisCount() { return analysisCount; }
    public void setAnalysisCount(long analysisCount) { this.analysisCount = analysisCount; }
    public long getFixingCount() { return fixingCount; }
    public void setFixingCount(long fixingCount) { this.fixingCount = fixingCount; }
    public long getFixCompleteCount() { return fixCompleteCount; }
    public void setFixCompleteCount(long fixCompleteCount) { this.fixCompleteCount = fixCompleteCount; }
    public long getRetestCount() { return retestCount; }
    public void setRetestCount(long retestCount) { this.retestCount = retestCount; }
    public long getClosedCount() { return closedCount; }
    public void setClosedCount(long closedCount) { this.closedCount = closedCount; }
    public double getDefectProcessRate() { return defectProcessRate; }
    public void setDefectProcessRate(double defectProcessRate) { this.defectProcessRate = defectProcessRate; }
    public List<CategoryProgressDTO> getCategoryProgressList() { return categoryProgressList; }
    public void setCategoryProgressList(List<CategoryProgressDTO> categoryProgressList) { this.categoryProgressList = categoryProgressList; }
}