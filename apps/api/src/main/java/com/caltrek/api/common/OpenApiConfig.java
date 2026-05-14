package com.caltrek.api.common;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI caltrekOpenApi() {
        return new OpenAPI()
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Use the accessToken returned by /api/auth/register, /api/auth/login, or /api/auth/refresh.")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
                .info(new Info()
                        .title("caltrek API")
                        .description("Reactive calorie tracking API for foods, daily logs, and user libraries.")
                        .version("0.1.0")
                        .contact(new Contact().name("caltrek"))
                        .license(new License().name("Proprietary")))
                .externalDocs(new ExternalDocumentation()
                        .description("caltrek project documentation")
                        .url("/docs"));
    }

    @Bean
    public OpenApiCustomizer publicAuthEndpointCustomizer() {
        return openApi -> {
            clearSecurity(openApi, "/api/auth/register", "post");
            clearSecurity(openApi, "/api/auth/login", "post");
            clearSecurity(openApi, "/api/auth/refresh", "post");
        };
    }

    private void clearSecurity(OpenAPI openApi, String path, String method) {
        if (openApi.getPaths() == null || openApi.getPaths().get(path) == null) {
            return;
        }
        var operation = openApi.getPaths().get(path).readOperationsMap().get(io.swagger.v3.oas.models.PathItem.HttpMethod.valueOf(method.toUpperCase()));
        if (operation != null) {
            operation.setSecurity(java.util.List.of());
        }
    }
}
