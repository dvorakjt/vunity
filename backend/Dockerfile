FROM openjdk:18-alpine

ENV spring.jpa.hibernate.ddl-auto=create
ENV spring.jpa.show-sql=true
ENV spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
ENV spring.jpa.properties.hibernate.format_sql=true

ENV spring.mail.host=smtp.gmail.com
ENV spring.mail.port=587
ENV spring.mail.properties.mail.smtp.auth=true
ENV spring.mail.properties.mail.smtp.starttls.enable=true

ENV vunityapp.cookies.isSecure=true
ENV vunityapp.cookies.sameSitePolicy=strict

COPY target/vunityapp-0.0.1-SNAPSHOT.jar /app.jar
# Inform Docker that the container is listening on the specified port at runtime.
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]