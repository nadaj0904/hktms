package com.hktms.tsys.service;

import com.hktms.tsys.domain.CodeDTO;
import com.hktms.tsys.domain.CodeGroupDTO;
import com.hktms.tsys.domain.UserDTO;
import com.hktms.tsys.repository.CodeMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CodeAdminService {

    private final CodeMapper codeMapper;
    private final AuditLogService auditLogService;

    public CodeAdminService(CodeMapper codeMapper, AuditLogService auditLogService) {
        this.codeMapper = codeMapper;
        this.auditLogService = auditLogService;
    }

    /* ── 코드 그룹 ────────────────────────────── */

    public List<CodeGroupDTO> getAllGroups() {
        return codeMapper.findAllGroupsForAdmin();
    }

    public CodeGroupDTO getGroupById(Long codeGroupId) {
        return codeMapper.findGroupById(codeGroupId);
    }

    @Transactional
    public void createGroup(CodeGroupDTO group, UserDTO actor) {
        group.setCreatedId(id(actor));
        if (group.getIsActive() == null) group.setIsActive(true);
        codeMapper.insertGroup(group);
        auditLogService.log("CD_GRP_CREATE", id(actor), name(actor),
                group.getCodeGroupId(), null, null,
                "코드그룹 등록: " + group.getGroupCode());
    }

    @Transactional
    public void updateGroup(CodeGroupDTO group, UserDTO actor) {
        group.setUpdatedId(id(actor));
        codeMapper.updateGroup(group);
        auditLogService.log("CD_GRP_UPDATE", id(actor), name(actor),
                group.getCodeGroupId(), null, null,
                "코드그룹 수정: " + group.getGroupCode());
    }

    @Transactional
    public void deleteGroup(Long codeGroupId, UserDTO actor) {
        CodeGroupDTO param = new CodeGroupDTO();
        param.setCodeGroupId(codeGroupId);
        param.setDeletedId(id(actor));
        codeMapper.softDeleteGroup(param);
        auditLogService.log("CD_GRP_DELETE", id(actor), name(actor),
                codeGroupId, null, null,
                "코드그룹 삭제: " + codeGroupId);
    }

    /* ── 코드 ──────────────────────────────────── */

    public List<CodeDTO> getCodesByGroupId(Long codeGroupId) {
        return codeMapper.findCodesByGroupId(codeGroupId);
    }

    public CodeDTO getCodeById(Long codeId) {
        return codeMapper.findCodeById(codeId);
    }

    @Transactional
    public void createCode(CodeDTO code, UserDTO actor) {
        code.setCreatedId(id(actor));
        if (code.getIsActive() == null) code.setIsActive(true);
        codeMapper.insertCode(code);
        auditLogService.log("CD_CREATE", id(actor), name(actor),
                code.getCodeId(), null, null,
                "코드 등록: " + code.getCodeValue());
    }

    @Transactional
    public void updateCode(CodeDTO code, UserDTO actor) {
        code.setUpdatedId(id(actor));
        codeMapper.updateCode(code);
        auditLogService.log("CD_UPDATE", id(actor), name(actor),
                code.getCodeId(), null, null,
                "코드 수정: " + code.getCodeValue());
    }

    @Transactional
    public void deleteCode(Long codeId, UserDTO actor) {
        CodeDTO param = new CodeDTO();
        param.setCodeId(codeId);
        param.setDeletedId(id(actor));
        codeMapper.softDeleteCode(param);
        auditLogService.log("CD_DELETE", id(actor), name(actor),
                codeId, null, null,
                "코드 삭제: " + codeId);
    }

    private Long id(UserDTO actor)     { return actor != null ? actor.getUserId()  : null; }
    private String name(UserDTO actor) { return actor != null ? actor.getUserName() : null; }
}
