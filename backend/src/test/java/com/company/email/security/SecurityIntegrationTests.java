package com.company.email.security;

import com.company.email.record.controller.RecordController;
import com.company.email.record.service.RecordService;
import com.company.email.security.config.SecurityConfig;
import com.company.email.security.controller.AuthController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = {
                AuthController.class,
                RecordController.class
        },
        properties = {
                "app.cors.allowed-origin=http://localhost:4200"
        }
)
@Import({
        SecurityConfig.class,
        SecurityIntegrationTests.TestSecurityConfiguration.class
})
class SecurityIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RecordService recordService;

    @Test
    void anonymousUserCannotAccessRecords() throws Exception {

        mockMvc.perform(get("/api/records"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidCredentialsReturnUnauthorized() throws Exception {

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "username": "test-admin",
                                    "password": "wrong-password"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message")
                        .value("Invalid username or password."));
    }

    @Test
    void validLoginEstablishesAuthenticatedSession() throws Exception {

        MvcResult loginResult = mockMvc.perform(
                        post("/api/auth/login")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                            "username": "test-admin",
                                            "password": "correct-password"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username")
                        .value("test-admin"))
                .andExpect(jsonPath("$.authenticated")
                        .value(true))
                .andReturn();

        MockHttpSession session =
                (MockHttpSession) loginResult.getRequest()
                        .getSession(false);

        assertNotNull(session);

        mockMvc.perform(get("/api/auth/me")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username")
                        .value("test-admin"))
                .andExpect(jsonPath("$.authenticated")
                        .value(true));
    }

    @Test
    void authenticatedUserCanAccessRecords() throws Exception {

        MockHttpSession session = loginAs(
                "test-admin",
                "correct-password"
        );

        when(recordService.getAllRecords())
                .thenReturn(List.of());

        mockMvc.perform(get("/api/records")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void stateChangingRequestWithoutCsrfTokenIsRejected()
            throws Exception {

        MockHttpSession session = loginAs(
                "test-admin",
                "correct-password"
        );

        mockMvc.perform(post("/api/records")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void stateChangingRequestWithInvalidCsrfTokenIsRejected()
            throws Exception {

        MockHttpSession session = loginAs(
                "test-admin",
                "correct-password"
        );

        mockMvc.perform(post("/api/records")
                        .session(session)
                        .with(csrf().useInvalidToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void logoutInvalidatesAuthenticatedSession() throws Exception {

        MockHttpSession session = loginAs(
                "test-admin",
                "correct-password"
        );

        mockMvc.perform(post("/api/auth/logout")
                        .session(session)
                        .with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/auth/me")
                        .session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void inactiveAdministratorCannotAuthenticate() throws Exception {

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "username": "inactive-admin",
                                    "password": "inactive-password"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message")
                        .value("Invalid username or password."));
    }

    private MockHttpSession loginAs(
            String username,
            String password
    ) throws Exception {

        MvcResult result = mockMvc.perform(
                        post("/api/auth/login")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                            "username": "%s",
                                            "password": "%s"
                                        }
                                        """.formatted(username, password)))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session =
                (MockHttpSession) result.getRequest()
                        .getSession(false);

        assertNotNull(session);

        return session;
    }

    @TestConfiguration
    @EnableWebSecurity
    static class TestSecurityConfiguration {

        @Bean
        UserDetailsService testUserDetailsService(
                PasswordEncoder passwordEncoder
        ) {
            return new InMemoryUserDetailsManager(

                    User.withUsername("test-admin")
                            .password(
                                    passwordEncoder.encode("correct-password")
                            )
                            .roles("ADMIN")
                            .build(),

                    User.withUsername("inactive-admin")
                            .password(
                                    passwordEncoder.encode("inactive-password")
                            )
                            .roles("ADMIN")
                            .disabled(true)
                            .build()
            );
        }
    }
}
