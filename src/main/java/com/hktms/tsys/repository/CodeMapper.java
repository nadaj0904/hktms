package com.hktms.tsys.repository;

import com.hktms.tsys.domain.CodeDTO;
import com.hktms.tsys.domain.CodeGroupDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface CodeMapper {
    /* 기존 - 서비스에서 사용 */
    List<CodeDTO> findByGroupCode(String groupCode);
    List<CodeGroupDTO> findAllGroups();
    CodeDTO findByGroupAndValue(String groupCode, String codeValue);

    /* 공통코드 관리 - 그룹 */
    List<CodeGroupDTO> findAllGroupsForAdmin();
    CodeGroupDTO findGroupById(Long codeGroupId);
    void insertGroup(CodeGroupDTO group);
    void updateGroup(CodeGroupDTO group);
    void softDeleteGroup(CodeGroupDTO group);

    /* 카스케이드 드롭다운용 (업무단위 → 대분류 → 중분류) */
    List<CodeDTO> findCodesByBusinessUnitAndLevel(
            @Param("businessUnit") String businessUnit,
            @Param("categoryLevel") String categoryLevel,
            @Param("parentCodeValue") String parentCodeValue);

    /* 공통코드 관리 - 코드 */
    List<CodeDTO> findCodesByGroupId(Long codeGroupId);
    CodeDTO findCodeById(Long codeId);
    void insertCode(CodeDTO code);
    void updateCode(CodeDTO code);
    void softDeleteCode(CodeDTO code);
}
