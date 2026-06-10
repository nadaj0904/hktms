package com.hktms.tsys.repository;

import com.hktms.tsys.domain.DefectDTO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface DefectMapper {
    List<DefectDTO> findAll(DefectDTO param);
    int count(DefectDTO param);
    DefectDTO findById(Long defectId);
    void insert(DefectDTO defect);
    void update(DefectDTO defect);
    void softDelete(DefectDTO defect);
    void updateStatus(DefectDTO defect);
}