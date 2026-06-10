package com.hktms.tsys.service;

import com.hktms.tsys.domain.TestCaseDTO;
import com.hktms.tsys.domain.UserDTO;
import com.hktms.tsys.repository.TestCaseMapper;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
public class TestCaseService {

    private final TestCaseMapper testCaseMapper;
    private final AuditLogService auditLogService;

    public TestCaseService(TestCaseMapper testCaseMapper, AuditLogService auditLogService) {
        this.testCaseMapper = testCaseMapper;
        this.auditLogService = auditLogService;
    }

    public Map<String, Object> getTestCaseList(TestCaseDTO param) {
        int page = param.getPage() <= 0 ? 1 : param.getPage();
        int size = param.getSize() <= 0 ? 20 : param.getSize();
        param.setPage(page);
        param.setSize(size);
        param.setOffset((page - 1) * size);

        List<TestCaseDTO> list = testCaseMapper.findAll(param);
        int total = testCaseMapper.count(param);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    public TestCaseDTO getTestCaseById(Long testCaseId) {
        return testCaseMapper.findById(testCaseId);
    }

    @Transactional
    public void createTestCase(TestCaseDTO testCase, UserDTO actor) {
        testCase.setCreatedId(id(actor));
        testCaseMapper.insert(testCase);
        auditLogService.log("TC_CREATE", id(actor), name(actor),
                testCase.getTestCaseId(), null, null,
                "테스트케이스 등록: " + testCase.getTestCaseName());
    }

    @Transactional
    public void updateTestCase(TestCaseDTO testCase, UserDTO actor) {
        testCase.setUpdatedId(id(actor));
        testCaseMapper.update(testCase);
        auditLogService.log("TC_UPDATE", id(actor), name(actor),
                testCase.getTestCaseId(), null, null,
                "테스트케이스 수정: " + testCase.getTestCaseId());
    }

    @Transactional
    public void updateStatus(TestCaseDTO testCase, UserDTO actor) {
        TestCaseDTO before = testCaseMapper.findById(testCase.getTestCaseId());
        testCase.setUpdatedId(id(actor));
        testCaseMapper.updateStatus(testCase);
        auditLogService.log("TC_STATUS", id(actor), name(actor),
                testCase.getTestCaseId(),
                before != null ? before.getTestStatus() : null,
                testCase.getTestStatus(),
                "테스트케이스 상태 변경: " + testCase.getTestCaseId());
    }

    @Transactional
    public void deleteTestCase(Long testCaseId, UserDTO actor) {
        TestCaseDTO param = new TestCaseDTO();
        param.setTestCaseId(testCaseId);
        param.setDeletedId(id(actor));
        testCaseMapper.softDelete(param);
        auditLogService.log("TC_DELETE", id(actor), name(actor),
                testCaseId, null, null,
                "테스트케이스 삭제: " + testCaseId);
    }

    public List<Map<String, Object>> parseExcel(MultipartFile file) throws IOException {
        List<Map<String, Object>> rows = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Row header = sheet.getRow(0);
            if (header == null) return rows;

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Map<String, Object> rowMap = new LinkedHashMap<>();
                rowMap.put("rowNum", i + 1);
                rowMap.put("majorCategory",  getCellValue(row, 0));
                rowMap.put("middleCategory", getCellValue(row, 1));
                rowMap.put("minorCategory",  getCellValue(row, 2));
                rowMap.put("testCaseName",   getCellValue(row, 3));
                rowMap.put("testContent",    getCellValue(row, 4));
                rowMap.put("remark",         getCellValue(row, 5));

                String error = "";
                if (rowMap.get("testCaseName") == null || rowMap.get("testCaseName").toString().isBlank()) {
                    error = "테스트명 필수 입력";
                }
                rowMap.put("error", error);
                rows.add(rowMap);
            }
        }
        return rows;
    }

    @Transactional
    public int bulkImport(List<TestCaseDTO> list, UserDTO actor) {
        list.forEach(tc -> tc.setCreatedId(id(actor)));
        int count = testCaseMapper.bulkInsert(list);
        auditLogService.log("TC_IMPORT", id(actor), name(actor),
                null, null, String.valueOf(count),
                "테스트케이스 엑셀 임포트: " + count + "건");
        return count;
    }

    private String getCellValue(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private Long id(UserDTO actor)   { return actor != null ? actor.getUserId()  : null; }
    private String name(UserDTO actor) { return actor != null ? actor.getUserName() : null; }
}
