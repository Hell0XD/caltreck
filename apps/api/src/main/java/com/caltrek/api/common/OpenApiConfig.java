package com.caltrek.api.common;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI caltrekOpenApi() {
        return new OpenAPI()
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
}

