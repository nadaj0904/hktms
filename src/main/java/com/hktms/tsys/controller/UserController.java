package com.hktms.tsys.controller;

import com.hktms.tsys.domain.UserDTO;
import com.hktms.tsys.domain.common.ApiResponse;
import com.hktms.tsys.service.CodeService;
import com.hktms.tsys.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
public class UserController {

    private final UserService userService;
    private final CodeService codeService;

    public UserController(UserService userService, CodeService codeService) {
        this.userService = userService;
        this.codeService = codeService;
    }

    @GetMapping("/admin/users")
    public String userAdminPage(HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        if (loginUser == null || !"PMO".equals(loginUser.getRole())) return "redirect:/dashboard";
        return "userAdmin";
    }

    @GetMapping("/api/v1/admin/users")
    @ResponseBody
    public ApiResponse<Map<String, Object>> getList(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String role,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        UserDTO param = new UserDTO();
        param.setKeyword(keyword);
        param.setRole(role.isEmpty() ? null : role);
        param.setPage(page);
        param.setSize(size);
        return ApiResponse.success("조회 성공", userService.getUserList(param));
    }

    @GetMapping("/api/v1/admin/users/{userId}")
    @ResponseBody
    public ApiResponse<UserDTO> getOne(@PathVariable Long userId) {
        UserDTO data = userService.getUserById(userId);
        if (data == null) return ApiResponse.error("사용자를 찾을 수 없습니다.");
        return ApiResponse.success("조회 성공", data);
    }

    @PostMapping("/api/v1/admin/users")
    @ResponseBody
    public ApiResponse<Void> create(@RequestBody UserDTO dto, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        try {
            userService.createUser(dto, loginUser);
            return ApiResponse.success("등록되었습니다.", null);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/api/v1/admin/users/{userId}")
    @ResponseBody
    public ApiResponse<Void> update(@PathVariable Long userId, @RequestBody UserDTO dto, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        dto.setUserId(userId);
        userService.updateUser(dto, loginUser);
        return ApiResponse.success("수정되었습니다.", null);
    }

    @DeleteMapping("/api/v1/admin/users/{userId}")
    @ResponseBody
    public ApiResponse<Void> delete(@PathVariable Long userId, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        userService.deleteUser(userId, loginUser);
        return ApiResponse.success("삭제되었습니다.", null);
    }

    @GetMapping("/api/v1/admin/users/codes")
    @ResponseBody
    public ApiResponse<Map<String, Object>> getCodes() {
        Map<String, Object> codes = Map.of(
            "roleCodes", codeService.getUserRoleCodes()
        );
        return ApiResponse.success("조회 성공", codes);
    }
}
