package com.hktms.tsys.service;

import com.hktms.tsys.domain.DashboardDTO;
import com.hktms.tsys.repository.DashboardMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    private final DashboardMapper dashboardMapper;

    public DashboardService(DashboardMapper dashboardMapper) {
        this.dashboardMapper = dashboardMapper;
    }

    public DashboardDTO getDashboardData() {
        DashboardDTO dto = new DashboardDTO();

        long ready      = dashboardMapper.countTestByStatus("READY");
        long inProgress = dashboardMapper.countTestByStatus("IN_PROGRESS");
        long success    = dashboardMapper.countTestByStatus("SUCCESS");
        long fail       = dashboardMapper.countTestByStatus("FAIL");
        long hold       = dashboardMapper.countTestByStatus("HOLD");
        long total      = ready + inProgress + success + fail + hold;

        dto.setTotalTestCount(total);
        dto.setReadyCount(ready);
        dto.setInProgressCount(inProgress);
        dto.setSuccessCount(success);
        dto.setFailCount(fail);
        dto.setHoldCount(hold);
        dto.setTestProgressRate(total > 0 ? Math.round((double) success / total * 1000.0) / 10.0 : 0.0);

        long analysis    = dashboardMapper.countDefectByStatus("ANALYSIS");
        long fixing      = dashboardMapper.countDefectByStatus("FIXING");
        long fixComplete = dashboardMapper.countDefectByStatus("FIX_COMPLETE");
        long retest      = dashboardMapper.countDefectByStatus("RETEST");
        long closed      = dashboardMapper.countDefectByStatus("CLOSED");
        long totalDefect = analysis + fixing + fixComplete + retest + closed;

        dto.setTotalDefectCount(totalDefect);
        dto.setAnalysisCount(analysis);
        dto.setFixingCount(fixing);
        dto.setFixCompleteCount(fixComplete);
        dto.setRetestCount(retest);
        dto.setClosedCount(closed);
        dto.setDefectProcessRate(totalDefect > 0 ? Math.round((double) fixComplete / totalDefect * 1000.0) / 10.0 : 0.0);

        List<DashboardDTO.CategoryProgressDTO> categoryList = dashboardMapper.countByCategoryAndStatus();
        categoryList.forEach(c -> {
            double rate = c.getTotalCount() > 0
                    ? Math.round((double) c.getSuccessCount() / c.getTotalCount() * 1000.0) / 10.0
                    : 0.0;
            c.setProgressRate(rate);
        });
        dto.setCategoryProgressList(categoryList);

        return dto;
    }
}
