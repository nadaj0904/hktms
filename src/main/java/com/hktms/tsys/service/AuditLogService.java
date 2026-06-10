package com.hktms.tsys.service;

import com.hktms.tsys.repository.AuditLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuditLogService {

    private final AuditLogMapper auditLogMapper;

    public AuditLogService(AuditLogMapper auditLogMapper) {
        this.auditLogMapper = auditLogMapper;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String logType, Long actorId, String actorName,
                    Long referenceId, String beforeValue, String afterValue, String description) {
        try {
            Map<String, Object> param = new HashMap<>();
            param.put("logType",     logType);
            param.put("actorId",     actorId);
            param.put("actorName",   actorName);
            param.put("referenceId", referenceId);
            param.put("beforeValue", beforeValue);
            param.put("afterValue",  afterValue);
            param.put("description", description);
            param.put("ipAddress",   getClientIp());
            auditLogMapper.insert(param);
        } catch (Exception ignored) {
            // 감사 로그 실패가 주 트랜잭션을 방해하지 않도록 무시
        }
    }

    private String getClientIp() {
        try {
            HttpServletRequest req =
                ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String ip = req.getHeader("X-Forwarded-For");
            if (ip != null && !ip.isBlank()) return ip.split(",")[0].trim();
            ip = req.getHeader("X-Real-IP");
            if (ip != null && !ip.isBlank()) return ip.trim();
            return req.getRemoteAddr();
        } catch (Exception e) {
            return "unknown";
        }
    }
}
