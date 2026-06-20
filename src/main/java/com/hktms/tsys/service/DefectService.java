package com.hktms.tsys.service;

import com.hktms.tsys.domain.AttachmentDTO;
import com.hktms.tsys.domain.DefectDTO;
import com.hktms.tsys.domain.UserDTO;
import com.hktms.tsys.repository.AttachmentMapper;
import com.hktms.tsys.repository.DefectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DefectService {

    private final DefectMapper defectMapper;
    private final AttachmentMapper attachmentMapper;
    private final AuditLogService auditLogService;

    public DefectService(DefectMapper defectMapper, AttachmentMapper attachmentMapper,
                         AuditLogService auditLogService) {
        this.defectMapper = defectMapper;
        this.attachmentMapper = attachmentMapper;
        this.auditLogService = auditLogService;
    }

    public Map<String, Object> getDefectList(DefectDTO param) {
        int page = param.getPage() <= 0 ? 1 : param.getPage();
        int size = param.getSize() <= 0 ? 20 : param.getSize();
        param.setPage(page);
        param.setSize(size);
        param.setOffset((page - 1) * size);

        List<DefectDTO> list = defectMapper.findAll(param);
        int total = defectMapper.count(param);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    public DefectDTO getDefectById(Long defectId) {
        DefectDTO defect = defectMapper.findById(defectId);
        if (defect != null) {
            AttachmentDTO param = new AttachmentDTO();
            param.setReferenceType("DEFECT");
            param.setReferenceId(defectId);
            defect.setAttachments(attachmentMapper.findByReference(param));
        }
        return defect;
    }

    @Transactional
    public Long createDefect(DefectDTO defect, UserDTO actor) {
        defect.setCreatedId(id(actor));
        defect.setRegistrantId(id(actor));
        defectMapper.insert(defect);
        auditLogService.log("DF_CREATE", id(actor), name(actor),
                defect.getDefectId(), null, null,
                "결함 등록: " + defect.getTitle());
        return defect.getDefectId();
    }

    @Transactional
    public void updateDefect(DefectDTO defect, UserDTO actor) {
        defect.setUpdatedId(id(actor));
        defectMapper.update(defect);
        auditLogService.log("DF_UPDATE", id(actor), name(actor),
                defect.getDefectId(), null, null,
                "결함 수정: " + defect.getDefectId());
    }

    @Transactional
    public void updateStatus(DefectDTO defect, UserDTO actor) {
        DefectDTO before = defectMapper.findById(defect.getDefectId());
        defect.setUpdatedId(id(actor));
        defectMapper.updateStatus(defect);
        auditLogService.log("DF_STATUS", id(actor), name(actor),
                defect.getDefectId(),
                before != null ? before.getDefectStatus() : null,
                defect.getDefectStatus(),
                "결함 상태 변경: " + defect.getDefectId());
    }

    @Transactional
    public void deleteDefect(Long defectId, UserDTO actor) {
        DefectDTO param = new DefectDTO();
        param.setDefectId(defectId);
        param.setDeletedId(id(actor));
        defectMapper.softDelete(param);
        auditLogService.log("DF_DELETE", id(actor), name(actor),
                defectId, null, null,
                "결함 삭제: " + defectId);
    }

    private Long id(UserDTO actor)     { return actor != null ? actor.getUserId()  : null; }
    private String name(UserDTO actor) { return actor != null ? actor.getUserName() : null; }
}
