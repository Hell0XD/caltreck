buildscript {
    repositories {
        mavenCentral()
    }
    dependencies {
        // Needed by the Flyway Gradle task itself
        classpath("org.flywaydb:flyway-database-postgresql:11.10.5")
        classpath("org.postgresql:postgresql:42.7.7")
    }
}

plugins {
    java
    checkstyle
    id("org.springframework.boot") version "3.5.0"
    id("io.spring.dependency-management") version "1.1.7"
    id("org.flywaydb.flyway") version "11.10.5"
}

group = "com.caltrek"
version = "0.1.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    // Spring Boot Starters
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-data-r2dbc")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    
    // OpenAPI / Swagger
    implementation("org.springdoc:springdoc-openapi-starter-webflux-ui:2.8.14")
    
    // Flyway Core and PostgreSQL Plugin
    implementation("org.flywaydb:flyway-core")
    // This is the missing piece that the Flyway task needs to see
    runtimeOnly("org.flywaydb:flyway-database-postgresql:11.10.5")

    // Database Drivers
    implementation("org.postgresql:r2dbc-postgresql")
    runtimeOnly("org.postgresql:postgresql")

    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("io.projectreactor:reactor-test")
    testImplementation("com.squareup.okhttp3:mockwebserver:4.12.0")
    testImplementation("org.testcontainers:junit-jupiter")
    testImplementation("org.testcontainers:postgresql")
    testImplementation("org.testcontainers:r2dbc")
}

checkstyle {
    configFile = file("config/checkstyle/checkstyle.xml")
}

flyway {
    // We remove the configurations line to let it use the default classpath
    url = System.getenv("FLYWAY_URL") ?: "jdbc:postgresql://localhost:5432/caltrek"
    user = System.getenv("FLYWAY_USER") ?: "caltrek"
    password = System.getenv("FLYWAY_PASSWORD") ?: "caltrek"
    locations = arrayOf("filesystem:../../infra/postgres/migrations")
    cleanDisabled = true
}

tasks.withType<Test> {
    useJUnitPlatform()
}
