package com.hktms.tsys.service;

import com.hktms.tsys.domain.UserDTO;
import com.hktms.tsys.repository.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserMapper userMapper;
    private final AuditLogService auditLogService;

    public UserService(UserMapper userMapper, AuditLogService auditLogService) {
        this.userMapper = userMapper;
        this.auditLogService = auditLogService;
    }

    public Map<String, Object> getUserList(UserDTO param) {
        int page = param.getPage() <= 0 ? 1 : param.getPage();
        int size = param.getSize() <= 0 ? 20 : param.getSize();
        param.setPage(page);
        param.setSize(size);
        param.setOffset((page - 1) * size);

        List<UserDTO> list = userMapper.findAll(param);
        int total = userMapper.count(param);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    public UserDTO getUserById(Long userId) {
        return userMapper.findById(userId);
    }

    public List<UserDTO> getDeveloperList() {
        return userMapper.findByRole("DEVELOPER");
    }

    public List<UserDTO> getTesterList() {
        return userMapper.findByRoles(java.util.List.of("USER", "PMO"));
    }

    public List<UserDTO> getAllActiveUsers() {
        UserDTO param = new UserDTO();
        param.setIsActive(true);
        param.setPage(1);
        param.setSize(1000);
        param.setOffset(0);
        return userMapper.findAll(param);
    }

    @Transactional
    public void createUser(UserDTO user, UserDTO actor) {
        if (userMapper.findByLoginId(user.getLoginId()) != null) {
            throw new IllegalArgumentException("이미 사용중인 로그인 ID입니다.");
        }
        user.setCreatedId(id(actor));
        userMapper.insert(user);
        auditLogService.log("US_CREATE", id(actor), name(actor),
                user.getUserId(), null, null,
                "사용자 등록: " + user.getLoginId());
    }

    @Transactional
    public void updateUser(UserDTO user, UserDTO actor) {
        user.setUpdatedId(id(actor));
        userMapper.update(user);
        auditLogService.log("US_UPDATE", id(actor), name(actor),
                user.getUserId(), null, null,
                "사용자 수정: " + user.getLoginId());
    }

    @Transactional
    public void deleteUser(Long userId, UserDTO actor) {
        UserDTO param = new UserDTO();
        param.setUserId(userId);
        param.setDeletedId(id(actor));
        userMapper.softDelete(param);
        auditLogService.log("US_DELETE", id(actor), name(actor),
                userId, null, null,
                "사용자 삭제: " + userId);
    }

    private Long id(UserDTO actor)     { return actor != null ? actor.getUserId()  : null; }
    private String name(UserDTO actor) { return actor != null ? actor.getUserName() : null; }
}
