package com.company.email.security.bootstrap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "app.admin.bootstrap.enabled",
        havingValue = "true"
)
public class AdminBootstrap implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String password;

    public AdminBootstrap(
            JdbcTemplate jdbcTemplate,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.bootstrap.username:}") String username,
            @Value("${app.admin.bootstrap.password:}") String password
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {

        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM admin_users",
                Long.class
        );

        if (count != null && count > 0) {
            return;
        }

        if (username.isBlank() || password.isBlank()) {
            throw new IllegalStateException(
                    "Administrator bootstrap is enabled, "
                            + "but credentials are missing."
            );
        }

        jdbcTemplate.update(
                """
                        INSERT INTO admin_users
                            (username, password_hash, is_active)
                        VALUES (?, ?, TRUE)
                        """,
                username,
                passwordEncoder.encode(password)
        );
    }
}
