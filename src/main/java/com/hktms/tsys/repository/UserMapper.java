package com.hktms.tsys.repository;

import com.hktms.tsys.domain.UserDTO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface UserMapper {
    UserDTO findByLoginId(String loginId);
    UserDTO findById(Long userId);
    List<UserDTO> findAll(UserDTO param);
    int count(UserDTO param);
    List<UserDTO> findByRole(String role);
    List<UserDTO> findByRoles(List<String> roles);
    void insert(UserDTO user);
    void update(UserDTO user);
    void softDelete(UserDTO user);
}