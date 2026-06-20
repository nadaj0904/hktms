package com.hktms.tsys.controller;

import com.hktms.tsys.domain.CodeDTO;
import com.hktms.tsys.domain.DefectDTO;
import com.hktms.tsys.domain.UserDTO;
import com.hktms.tsys.domain.common.ApiResponse;
import com.hktms.tsys.service.CodeService;
import com.hktms.tsys.service.DefectService;
import com.hktms.tsys.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Controller
public class DefectController {

    private final DefectService defectService;
    private final UserService userService;
    private final CodeService codeService;

    public DefectController(DefectService defectService, UserService userService, CodeService codeService) {
        this.defectService = defectService;
        this.userService = userService;
        this.codeService = codeService;
    }

    @GetMapping("/defect")
    public String defectPage() {
        return "defect";
    }

    @GetMapping("/api/v1/defect")
    @ResponseBody
    public ApiResponse<Map<String, Object>> getList(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String searchStatus,
            @RequestParam(defaultValue = "") String searchBusinessUnit,
            @RequestParam(defaultValue = "") String searchMajorCategory,
            @RequestParam(defaultValue = "") String searchMiddleCategory,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        DefectDTO param = new DefectDTO();
        param.setKeyword(keyword);
        param.setSearchStatus(searchStatus);
        param.setSearchBusinessUnit(searchBusinessUnit.isEmpty() ? null : searchBusinessUnit);
        param.setSearchMajorCategory(searchMajorCategory.isEmpty() ? null : searchMajorCategory);
        param.setSearchMiddleCategory(searchMiddleCategory.isEmpty() ? null : searchMiddleCategory);
        param.setPage(page);
        param.setSize(size);
        return ApiResponse.success("조회 성공", defectService.getDefectList(param));
    }

    @GetMapping("/api/v1/defect/{defectId}")
    @ResponseBody
    public ApiResponse<DefectDTO> getOne(@PathVariable Long defectId) {
        DefectDTO data = defectService.getDefectById(defectId);
        if (data == null) return ApiResponse.error("결함을 찾을 수 없습니다.");
        return ApiResponse.success("조회 성공", data);
    }

    @PostMapping("/api/v1/defect")
    @ResponseBody
    public ApiResponse<Map<String, Object>> create(@RequestBody DefectDTO dto, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        Long defectId = defectService.createDefect(dto, loginUser);
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("defectId", defectId);
        return ApiResponse.success("등록되었습니다.", result);
    }

    @PutMapping("/api/v1/defect/{defectId}")
    @ResponseBody
    public ApiResponse<Void> update(@PathVariable Long defectId, @RequestBody DefectDTO dto, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        dto.setDefectId(defectId);
        defectService.updateDefect(dto, loginUser);
        return ApiResponse.success("수정되었습니다.", null);
    }

    @PutMapping("/api/v1/defect/{defectId}/status")
    @ResponseBody
    public ApiResponse<Void> updateStatus(@PathVariable Long defectId, @RequestBody DefectDTO dto, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        dto.setDefectId(defectId);
        defectService.updateStatus(dto, loginUser);
        return ApiResponse.success("상태가 변경되었습니다.", null);
    }

    @DeleteMapping("/api/v1/defect/{defectId}")
    @ResponseBody
    public ApiResponse<Void> delete(@PathVariable Long defectId, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        defectService.deleteDefect(defectId, loginUser);
        return ApiResponse.success("삭제되었습니다.", null);
    }

    @GetMapping("/api/v1/defect/codes")
    @ResponseBody
    public ApiResponse<Map<String, Object>> getCodes() {
        Map<String, Object> codes = Map.of(
            "defectStatusCodes", codeService.getDefectStatusCodes(),
            "developers", userService.getDeveloperList(),
            "businessCategories", codeService.getBusinessCategoryCodes()
        );
        return ApiResponse.success("조회 성공", codes);
    }

    @GetMapping("/api/v1/defect/categories")
    @ResponseBody
    public ApiResponse<List<CodeDTO>> getCategories(
            @RequestParam String businessUnit,
            @RequestParam String level,
            @RequestParam(required = false) String parentCodeValue) {
        List<CodeDTO> result = codeService.getCodesByBusinessUnitAndLevel(businessUnit, level, parentCodeValue);
        return ApiResponse.success("조회 성공", result);
    }
}
