package com.hktms.tsys.repository;

import com.hktms.tsys.domain.AttachmentDTO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface AttachmentMapper {
    List<AttachmentDTO> findByReference(AttachmentDTO param);
    AttachmentDTO findById(Long attachmentId);
    void insert(AttachmentDTO attachment);
    void softDelete(AttachmentDTO attachment);
}