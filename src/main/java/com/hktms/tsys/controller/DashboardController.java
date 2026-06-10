package com.hktms.tsys.controller;

import com.hktms.tsys.domain.DashboardDTO;
import com.hktms.tsys.domain.common.ApiResponse;
import com.hktms.tsys.service.DashboardService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping({"/", "/dashboard"})
    public String dashboard() {
        return "index";
    }

    @GetMapping("/api/v1/dashboard")
    @ResponseBody
    public ApiResponse<DashboardDTO> getDashboardData() {
        try {
            DashboardDTO data = dashboardService.getDashboardData();
            return ApiResponse.success("조회 성공", data);
        } catch (Exception e) {
            return ApiResponse.error("대시보드 데이터 조회 중 오류가 발생했습니다.");
        }
    }
}