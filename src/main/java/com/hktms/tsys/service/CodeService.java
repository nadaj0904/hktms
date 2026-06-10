package com.hktms.tsys.service;

import com.hktms.tsys.domain.CodeDTO;
import com.hktms.tsys.repository.CodeMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CodeService {

    private final CodeMapper codeMapper;

    public CodeService(CodeMapper codeMapper) {
        this.codeMapper = codeMapper;
    }

    public List<CodeDTO> getCodesByGroup(String groupCode) {
        return codeMapper.findByGroupCode(groupCode);
    }

    public List<CodeDTO> getTestStatusCodes() {
        return codeMapper.findByGroupCode("TEST_STATUS");
    }

    public List<CodeDTO> getDefectStatusCodes() {
        return codeMapper.findByGroupCode("DEFECT_STATUS");
    }

    public List<CodeDTO> getUserRoleCodes() {
        return codeMapper.findByGroupCode("USER_ROLE");
    }

    public List<CodeDTO> getBusinessCategoryCodes() {
        return codeMapper.findByGroupCode("BUSINESS_CATEGORY");
    }

    public List<CodeDTO> getCodesByBusinessUnitAndLevel(String businessUnit, String categoryLevel, String parentCodeValue) {
        return codeMapper.findCodesByBusinessUnitAndLevel(businessUnit, categoryLevel, parentCodeValue);
    }
}