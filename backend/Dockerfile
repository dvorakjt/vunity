FROM openjdk:18-alpine

ENV spring.jpa.hibernate.ddl-auto=none
ENV spring.jpa.show-sql=false
ENV spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
ENV spring.jpa.properties.hibernate.format_sql=true

ENV spring.mail.host=smtp.gmail.com
ENV spring.mail.port=587
ENV spring.mail.properties.mail.smtp.auth=true
ENV spring.mail.properties.mail.smtp.starttls.enable=true

ENV vunityapp.cookies.isSecure=true
ENV vunityapp.cookies.sameSitePolicy=strict

ARG DB_URL
ENV spring.datasource.url = $DB_URL
ARG DB_USER
ENV spring.datasource.username = $DB_USER
ARG DB_PASSWORD
ENV spring.datasource.password = $DB_PASSWORD

ARG MAIL_USERNAME
ENV spring.mail.username = $MAIL_USERNAME
ARG MAIL_PASSWORD
ENV spring.mail.password = $MAIL_PASSWORD

ARG RECAPTCHA_SECRET
ENV vunityapp.recaptchaSecret = $RECAPTCHA_SECRET
ARG MEETING_SECRET
ENV vunityapp.meetingPasswordEncoderSecret = $MEETING_SECRET
ARG JWT_SECRET
ENV vunityapp.jwtTokenSecret = $JWT_SECRET

COPY target/vunityapp-0.0.1-SNAPSHOT.jar /app.jar
# Inform Docker that the container is listening on the specified port at runtime.
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]