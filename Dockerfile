# Stage 1: Build with Maven & Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Java 21 Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/byteforge-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
