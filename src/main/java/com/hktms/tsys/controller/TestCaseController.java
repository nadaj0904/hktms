package com.hktms.tsys.controller;

import com.hktms.tsys.domain.CodeDTO;
import com.hktms.tsys.domain.TestCaseDTO;
import com.hktms.tsys.domain.UserDTO;
import com.hktms.tsys.domain.common.ApiResponse;
import com.hktms.tsys.service.CodeService;
import com.hktms.tsys.service.TestCaseService;
import com.hktms.tsys.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Controller
public class TestCaseController {

    private final TestCaseService testCaseService;
    private final UserService userService;
    private final CodeService codeService;

    public TestCaseController(TestCaseService testCaseService, UserService userService, CodeService codeService) {
        this.testCaseService = testCaseService;
        this.userService = userService;
        this.codeService = codeService;
    }

    @GetMapping("/testcase")
    public String testCasePage() {
        return "testCase";
    }

    @GetMapping("/api/v1/testcase")
    @ResponseBody
    public ApiResponse<Map<String, Object>> getList(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String searchStatus,
            @RequestParam(defaultValue = "") String searchCategory,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        TestCaseDTO param = new TestCaseDTO();
        param.setKeyword(keyword);
        param.setSearchStatus(searchStatus);
        param.setSearchCategory(searchCategory);
        param.setPage(page);
        param.setSize(size);
        return ApiResponse.success("조회 성공", testCaseService.getTestCaseList(param));
    }

    @GetMapping("/api/v1/testcase/{testCaseId}")
    @ResponseBody
    public ApiResponse<TestCaseDTO> getOne(@PathVariable Long testCaseId) {
        TestCaseDTO data = testCaseService.getTestCaseById(testCaseId);
        if (data == null) return ApiResponse.error("테스트케이스를 찾을 수 없습니다.");
        return ApiResponse.success("조회 성공", data);
    }

    @PostMapping("/api/v1/testcase")
    @ResponseBody
    public ApiResponse<Void> create(@RequestBody TestCaseDTO dto, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        testCaseService.createTestCase(dto, loginUser);
        return ApiResponse.success("등록되었습니다.", null);
    }

    @PutMapping("/api/v1/testcase/{testCaseId}")
    @ResponseBody
    public ApiResponse<Void> update(@PathVariable Long testCaseId, @RequestBody TestCaseDTO dto, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        dto.setTestCaseId(testCaseId);
        testCaseService.updateTestCase(dto, loginUser);
        return ApiResponse.success("수정되었습니다.", null);
    }

    @PutMapping("/api/v1/testcase/{testCaseId}/status")
    @ResponseBody
    public ApiResponse<Void> updateStatus(@PathVariable Long testCaseId, @RequestBody TestCaseDTO dto, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        dto.setTestCaseId(testCaseId);
        testCaseService.updateStatus(dto, loginUser);
        return ApiResponse.success("상태가 변경되었습니다.", null);
    }

    @DeleteMapping("/api/v1/testcase/{testCaseId}")
    @ResponseBody
    public ApiResponse<Void> delete(@PathVariable Long testCaseId, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        testCaseService.deleteTestCase(testCaseId, loginUser);
        return ApiResponse.success("삭제되었습니다.", null);
    }

    @PostMapping("/api/v1/testcase/excel/preview")
    @ResponseBody
    public ApiResponse<List<Map<String, Object>>> excelPreview(@RequestParam("file") MultipartFile file) {
        try {
            List<Map<String, Object>> rows = testCaseService.parseExcel(file);
            return ApiResponse.success("파싱 성공", rows);
        } catch (Exception e) {
            return ApiResponse.error("엑셀 파싱 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @PostMapping("/api/v1/testcase/excel/import")
    @ResponseBody
    public ApiResponse<Map<String, Integer>> excelImport(@RequestBody List<TestCaseDTO> list, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        int count = testCaseService.bulkImport(list, loginUser);
        return ApiResponse.success(count + "건이 등록되었습니다.", Map.of("count", count));
    }

    @GetMapping("/api/v1/testcase/codes")
    @ResponseBody
    public ApiResponse<Map<String, Object>> getCodes() {
        Map<String, Object> codes = Map.of(
            "testStatusCodes", codeService.getTestStatusCodes(),
            "users", userService.getAllActiveUsers(),
            "businessCategories", codeService.getBusinessCategoryCodes()
        );
        return ApiResponse.success("조회 성공", codes);
    }

    @GetMapping("/api/v1/testcase/categories")
    @ResponseBody
    public ApiResponse<List<CodeDTO>> getCategories(
            @RequestParam String businessUnit,
            @RequestParam String level,
            @RequestParam(required = false) String parentCodeValue) {
        List<CodeDTO> result = codeService.getCodesByBusinessUnitAndLevel(businessUnit, level, parentCodeValue);
        return ApiResponse.success("조회 성공", result);
    }

    @GetMapping("/api/v1/testcase/excel/download")
    public ResponseEntity<byte[]> excelDownload() {
        // 엑셀 다운로드는 추후 구현
        return ResponseEntity.ok().build();
    }
}
