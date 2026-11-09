package com.company.email.security.service;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AdminUserDetailsService implements UserDetailsService {

    private final JdbcTemplate jdbcTemplate;

    public AdminUserDetailsService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {

        try {
            return jdbcTemplate.queryForObject(
                    "CALL sp_get_admin_by_username(?)",
                    (rs, rowNum) -> User.withUsername(
                                    rs.getString("username"))
                            .password(rs.getString("password_hash"))
                            .roles("ADMIN")
                            .disabled(!rs.getBoolean("is_active"))
                            .build(),
                    username
            );

        } catch (EmptyResultDataAccessException exception) {
            throw new UsernameNotFoundException(
                    "Invalid username or password."
            );
        }
    }
}
