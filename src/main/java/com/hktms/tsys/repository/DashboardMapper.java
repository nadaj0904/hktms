package com.hktms.tsys.repository;

import com.hktms.tsys.domain.DashboardDTO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface DashboardMapper {
    DashboardDTO.CategoryProgressDTO countByStatus(String status);
    List<DashboardDTO.CategoryProgressDTO> countByCategoryAndStatus();
    long countTestByStatus(String status);
    long countDefectByStatus(String status);
}