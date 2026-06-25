package com.hktms.tsys.service;

import com.hktms.tsys.domain.AttachmentDTO;
import com.hktms.tsys.domain.DefectDTO;
import com.hktms.tsys.domain.UserDTO;
import com.hktms.tsys.repository.AttachmentMapper;
import com.hktms.tsys.repository.DefectMapper;
import com.hktms.tsys.repository.TestCaseMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DefectService {

    private final DefectMapper defectMapper;
    private final AttachmentMapper attachmentMapper;
    private final TestCaseMapper testCaseMapper;
    private final AuditLogService auditLogService;

    public DefectService(DefectMapper defectMapper, AttachmentMapper attachmentMapper,
                         TestCaseMapper testCaseMapper, AuditLogService auditLogService) {
        this.defectMapper = defectMapper;
        this.attachmentMapper = attachmentMapper;
        this.testCaseMapper = testCaseMapper;
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

            // fix_attachment_id로 먼저 조회, 없으면 DEFECT_FIX 레퍼런스로 fallback
            if (defect.getFixAttachmentId() != null) {
                defect.setFixAttachment(attachmentMapper.findById(defect.getFixAttachmentId()));
            }
            if (defect.getFixAttachment() == null) {
                AttachmentDTO fixParam = new AttachmentDTO();
                fixParam.setReferenceType("DEFECT_FIX");
                fixParam.setReferenceId(defectId);
                List<AttachmentDTO> fixList = attachmentMapper.findByReference(fixParam);
                if (!fixList.isEmpty()) {
                    defect.setFixAttachment(fixList.get(fixList.size() - 1));
                }
            }
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

        // 조치완료 전환 시 연결된 테스트케이스를 자동으로 완료 처리
        if ("FIX_COMPLETE".equals(defect.getDefectStatus())
                && before != null && before.getTestCaseId() != null) {
            testCaseMapper.updateStatusOnly(before.getTestCaseId(), "SUCCESS", id(actor));
            auditLogService.log("TC_STATUS", id(actor), name(actor),
                    before.getTestCaseId(), null, "SUCCESS",
                    "결함 조치완료로 테스트케이스 자동 완료처리: 결함ID=" + defect.getDefectId());
        }
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
