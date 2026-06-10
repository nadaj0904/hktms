package com.hktms.tsys.config;

import com.hktms.tsys.domain.UserDTO;
import com.hktms.tsys.repository.UserMapper;
import com.hktms.tsys.service.AuditLogService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserMapper userMapper;
    private final AuditLogService auditLogService;

    public LoginSuccessHandler(UserMapper userMapper, AuditLogService auditLogService) {
        this.userMapper = userMapper;
        this.auditLogService = auditLogService;
        setDefaultTargetUrl("/dashboard");
        setAlwaysUseDefaultTargetUrl(true);
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        String loginId = authentication.getName();
        UserDTO user = userMapper.findByLoginId(loginId);
        if (user != null) {
            HttpSession session = request.getSession();
            session.setAttribute("loginUser", user);
            auditLogService.log("LOGIN", user.getUserId(), user.getUserName(),
                    user.getUserId(), null, null,
                    "로그인: " + loginId);
        }
        super.onAuthenticationSuccess(request, response, authentication);
    }
}
