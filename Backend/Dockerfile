# Stage 1: Build Spring Boot Application
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy Maven wrapper and pom.xml first (for Docker layer caching)
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and package jar
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Runtime Image
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Run as non-root user for security
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

# Copy executable jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose default port (Render automatically provides $PORT)
EXPOSE 8080

# Start Spring Boot application with dynamic PORT from environment
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
