package com.hktms.tsys.controller;

import com.hktms.tsys.domain.CodeDTO;
import com.hktms.tsys.domain.CodeGroupDTO;
import com.hktms.tsys.domain.UserDTO;
import com.hktms.tsys.domain.common.ApiResponse;
import com.hktms.tsys.service.CodeAdminService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class CodeAdminController {

    private final CodeAdminService codeAdminService;

    public CodeAdminController(CodeAdminService codeAdminService) {
        this.codeAdminService = codeAdminService;
    }

    @GetMapping("/admin/codes")
    public String codeAdminPage() {
        return "codeAdmin";
    }

    /* ── 코드 그룹 API ──────────────────────── */

    @GetMapping("/api/v1/admin/code-groups")
    @ResponseBody
    public ApiResponse<List<CodeGroupDTO>> getGroups() {
        return ApiResponse.success("조회 성공", codeAdminService.getAllGroups());
    }

    @GetMapping("/api/v1/admin/code-groups/{codeGroupId}")
    @ResponseBody
    public ApiResponse<CodeGroupDTO> getGroup(@PathVariable Long codeGroupId) {
        CodeGroupDTO data = codeAdminService.getGroupById(codeGroupId);
        if (data == null) return ApiResponse.error("코드그룹을 찾을 수 없습니다.");
        return ApiResponse.success("조회 성공", data);
    }

    @PostMapping("/api/v1/admin/code-groups")
    @ResponseBody
    public ApiResponse<Void> createGroup(@RequestBody CodeGroupDTO dto, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        codeAdminService.createGroup(dto, loginUser);
        return ApiResponse.success("등록되었습니다.", null);
    }

    @PutMapping("/api/v1/admin/code-groups/{codeGroupId}")
    @ResponseBody
    public ApiResponse<Void> updateGroup(@PathVariable Long codeGroupId,
                                         @RequestBody CodeGroupDTO dto, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        dto.setCodeGroupId(codeGroupId);
        codeAdminService.updateGroup(dto, loginUser);
        return ApiResponse.success("수정되었습니다.", null);
    }

    @DeleteMapping("/api/v1/admin/code-groups/{codeGroupId}")
    @ResponseBody
    public ApiResponse<Void> deleteGroup(@PathVariable Long codeGroupId, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        codeAdminService.deleteGroup(codeGroupId, loginUser);
        return ApiResponse.success("삭제되었습니다.", null);
    }

    /* ── 코드 API ───────────────────────────── */

    @GetMapping("/api/v1/admin/code-groups/{codeGroupId}/codes")
    @ResponseBody
    public ApiResponse<List<CodeDTO>> getCodes(@PathVariable Long codeGroupId) {
        return ApiResponse.success("조회 성공", codeAdminService.getCodesByGroupId(codeGroupId));
    }

    @GetMapping("/api/v1/admin/codes/{codeId}")
    @ResponseBody
    public ApiResponse<CodeDTO> getCode(@PathVariable Long codeId) {
        CodeDTO data = codeAdminService.getCodeById(codeId);
        if (data == null) return ApiResponse.error("코드를 찾을 수 없습니다.");
        return ApiResponse.success("조회 성공", data);
    }

    @PostMapping("/api/v1/admin/codes")
    @ResponseBody
    public ApiResponse<Void> createCode(@RequestBody CodeDTO dto, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        codeAdminService.createCode(dto, loginUser);
        return ApiResponse.success("등록되었습니다.", null);
    }

    @PutMapping("/api/v1/admin/codes/{codeId}")
    @ResponseBody
    public ApiResponse<Void> updateCode(@PathVariable Long codeId,
                                        @RequestBody CodeDTO dto, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        dto.setCodeId(codeId);
        codeAdminService.updateCode(dto, loginUser);
        return ApiResponse.success("수정되었습니다.", null);
    }

    @DeleteMapping("/api/v1/admin/codes/{codeId}")
    @ResponseBody
    public ApiResponse<Void> deleteCode(@PathVariable Long codeId, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        codeAdminService.deleteCode(codeId, loginUser);
        return ApiResponse.success("삭제되었습니다.", null);
    }
}
