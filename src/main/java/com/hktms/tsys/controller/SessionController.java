package com.hktms.tsys.controller;

import com.hktms.tsys.domain.UserDTO;
import com.hktms.tsys.domain.common.ApiResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SessionController {

    @GetMapping("/api/v1/session/user")
    public ApiResponse<UserDTO> getSessionUser(HttpSession session) {
        UserDTO user = (UserDTO) session.getAttribute("loginUser");
        if (user == null) return ApiResponse.error("세션 정보가 없습니다.");
        UserDTO safe = new UserDTO();
        safe.setUserId(user.getUserId());
        safe.setUserName(user.getUserName());
        safe.setRole(user.getRole());
        safe.setOrganization(user.getOrganization());
        return ApiResponse.success("조회 성공", safe);
    }

    @GetMapping("/api/v1/session/extend")
    public ApiResponse<Void> extendSession(HttpSession session) {
        session.setMaxInactiveInterval(3600);
        return ApiResponse.success("세션이 연장되었습니다.", null);
    }
}
