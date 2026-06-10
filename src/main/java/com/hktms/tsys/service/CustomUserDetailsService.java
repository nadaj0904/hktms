package com.hktms.tsys.service;

import com.hktms.tsys.domain.UserDTO;
import com.hktms.tsys.repository.UserMapper;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserMapper userMapper;

    public CustomUserDetailsService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
        UserDTO user = userMapper.findByLoginId(loginId);
        if (user == null || Boolean.FALSE.equals(user.getIsActive())) {
            throw new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + loginId);
        }
        return new User(
            user.getLoginId(),
            user.getPassword(),
            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }
}