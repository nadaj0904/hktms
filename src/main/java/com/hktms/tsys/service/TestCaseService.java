package com.hktms.tsys.service;

import com.hktms.tsys.domain.CodeDTO;
import com.hktms.tsys.domain.TestCaseDTO;
import com.hktms.tsys.domain.UserDTO;
import com.hktms.tsys.repository.CodeMapper;
import com.hktms.tsys.repository.TestCaseMapper;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TestCaseService {

    private final TestCaseMapper testCaseMapper;
    private final CodeMapper codeMapper;
    private final AuditLogService auditLogService;

    public TestCaseService(TestCaseMapper testCaseMapper, CodeMapper codeMapper,
                           AuditLogService auditLogService) {
        this.testCaseMapper = testCaseMapper;
        this.codeMapper = codeMapper;
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

    /**
     * 엑셀 템플릿 파싱 (Row 구조: Row0=제목, Row1=공백, Row2=헤더, Row3+=데이터)
     * 컬럼 순서: 0=업무단위, 1=대분류, 2=중분류, 3=소분류, 4=테스트명
     * 각 셀의 한글 코드명을 DB 코드값으로 변환하여 반환
     */
    public List<Map<String, Object>> parseExcel(MultipartFile file) throws IOException {
        List<Map<String, Object>> rows = new ArrayList<>();

        // BUSINESS_CATEGORY: 코드명 → 코드값 맵
        Map<String, String> bizNameToValue = codeMapper.findByGroupCode("BUSINESS_CATEGORY")
                .stream().collect(Collectors.toMap(CodeDTO::getCodeName, CodeDTO::getCodeValue, (a, b) -> a));

        // 코드 캐시: "businessUnit:LEVEL:parentCodeValue" → (코드명 → 코드값)
        Map<String, Map<String, String>> codeCache = new HashMap<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 3; i <= sheet.getLastRowNum(); i++) {   // 데이터는 Row 3부터
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String bizUnitName  = getCellValue(row, 0);
                String majorName    = getCellValue(row, 1);
                String middleName   = getCellValue(row, 2);
                String minorName    = getCellValue(row, 3);
                String testCaseName = getCellValue(row, 4);

                // 완전히 빈 행 스킵
                if (bizUnitName.isBlank() && testCaseName.isBlank()) continue;

                StringBuilder errors = new StringBuilder();

                // 업무단위 코드값 조회
                String bizUnit = bizNameToValue.get(bizUnitName);
                if (bizUnit == null && !bizUnitName.isBlank()) {
                    errors.append("업무단위 미등록(").append(bizUnitName).append(") ");
                }

                // 대분류 코드값 조회 — final로 선언해야 중분류 람다에서 캡처 가능
                final String majorCode;
                if (bizUnit != null && !majorName.isBlank()) {
                    Map<String, String> map = codeCache.computeIfAbsent(bizUnit + ":MAJOR:", k ->
                            codeMapper.findCodesByBusinessUnitAndLevel(bizUnit, "MAJOR", null)
                                    .stream().collect(Collectors.toMap(CodeDTO::getCodeName, CodeDTO::getCodeValue, (a, b) -> a)));
                    String resolved = map.get(majorName);
                    if (resolved == null) errors.append("대분류 미등록(").append(majorName).append(") ");
                    majorCode = resolved;
                } else {
                    majorCode = null;
                }

                // 중분류 코드값 조회 — final로 선언해야 소분류 람다에서 캡처 가능
                final String middleCode;
                if (bizUnit != null && majorCode != null && !middleName.isBlank()) {
                    Map<String, String> map = codeCache.computeIfAbsent(bizUnit + ":MIDDLE:" + majorCode, k ->
                            codeMapper.findCodesByBusinessUnitAndLevel(bizUnit, "MIDDLE", majorCode)
                                    .stream().collect(Collectors.toMap(CodeDTO::getCodeName, CodeDTO::getCodeValue, (a, b) -> a)));
                    String resolved = map.get(middleName);
                    if (resolved == null) errors.append("중분류 미등록(").append(middleName).append(") ");
                    middleCode = resolved;
                } else {
                    middleCode = null;
                }

                // 소분류 코드값 조회 (선택항목 — 미등록이어도 오류 아님)
                String minorCode = null;
                if (bizUnit != null && middleCode != null && !minorName.isBlank()) {
                    Map<String, String> map = codeCache.computeIfAbsent(bizUnit + ":MINOR:" + middleCode, k ->
                            codeMapper.findCodesByBusinessUnitAndLevel(bizUnit, "MINOR", middleCode)
                                    .stream().collect(Collectors.toMap(CodeDTO::getCodeName, CodeDTO::getCodeValue, (a, b) -> a)));
                    minorCode = map.get(minorName);
                }

                if (testCaseName.isBlank()) errors.append("테스트명 필수");

                Map<String, Object> rowMap = new LinkedHashMap<>();
                rowMap.put("rowNum",            i + 1);
                // 화면 표시용 (한글명)
                rowMap.put("businessUnitName",  bizUnitName);
                rowMap.put("majorCategoryName", majorName);
                rowMap.put("middleCategoryName",middleName);
                rowMap.put("minorCategoryName", minorName);
                rowMap.put("testCaseName",      testCaseName);
                // 임포트용 (코드값)
                rowMap.put("businessUnit",      bizUnit);
                rowMap.put("majorCategory",     majorCode);
                rowMap.put("middleCategory",    middleCode);
                rowMap.put("minorCategory",     minorCode);
                rowMap.put("error",             errors.toString().trim());
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
