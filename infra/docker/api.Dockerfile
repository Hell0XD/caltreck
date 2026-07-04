# syntax=docker/dockerfile:1.7

ARG JDK_VERSION=25

FROM eclipse-temurin:${JDK_VERSION}-jdk-alpine AS builder
WORKDIR /workspace

COPY apps/api/gradlew apps/api/gradlew
COPY apps/api/gradlew.bat apps/api/gradlew.bat
COPY apps/api/gradle apps/api/gradle
COPY apps/api/settings.gradle.kts apps/api/build.gradle.kts apps/api/
COPY infra/postgres/migrations infra/postgres/migrations

WORKDIR /workspace/apps/api
RUN chmod +x ./gradlew && ./gradlew --no-daemon dependencies

COPY apps/api/src src
RUN ./gradlew --no-daemon bootJar -x test

FROM eclipse-temurin:${JDK_VERSION}-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S caltrek && adduser -S caltrek -G caltrek

COPY --from=builder /workspace/apps/api/build/libs/*.jar /app/caltrek-api.jar

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0" \
    SERVER_PORT=8080

EXPOSE 8080
USER caltrek

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/caltrek-api.jar"]
