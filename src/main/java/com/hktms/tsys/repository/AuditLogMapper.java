package com.hktms.tsys.repository;

import org.apache.ibatis.annotations.Mapper;
import java.util.Map;

@Mapper
public interface AuditLogMapper {
    void insert(Map<String, Object> param);
}