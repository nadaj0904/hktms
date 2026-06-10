package com.hktms.tsys.repository;

import com.hktms.tsys.domain.TestCaseDTO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface TestCaseMapper {
    List<TestCaseDTO> findAll(TestCaseDTO param);
    int count(TestCaseDTO param);
    TestCaseDTO findById(Long testCaseId);
    void insert(TestCaseDTO testCase);
    void update(TestCaseDTO testCase);
    void softDelete(TestCaseDTO testCase);
    void updateStatus(TestCaseDTO testCase);
    int bulkInsert(List<TestCaseDTO> list);
}