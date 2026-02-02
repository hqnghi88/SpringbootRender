FROM eclipse-temurin:21-jdk-alpine

ARG GAMA_VERSION=0.0.0-SNAPSHOT
ARG BUILD_DATE

LABEL maintainer="GAMA Platform <gama@ird.fr>"
LABEL description="GAMA Headless Modeling and Simulation Platform"
LABEL version="${GAMA_VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"

RUN apk add --no-cache \
    bash \
    curl \
    unzip \
    libstdc++ \
    libc6-compat \
    && rm -rf /var/cache/apk/*

ENV JAVA_HOME=/opt/java/openjdk
ENV PATH="${JAVA_HOME}/bin:${PATH}"
ENV GAMA_HOME=/opt/gama
ENV GAMA_VERSION=${GAMA_VERSION}

WORKDIR ${GAMA_HOME}

RUN echo "GAMA_VERSION=${GAMA_VERSION}" > .gamaenv && \
    echo "BUILD_DATE=${BUILD_DATE}" >> .gamaenv

COPY gama.product/target/gama.product-*.zip /tmp/gama.zip

RUN unzip -q /tmp/gama.zip -d . && \
    mv gama.product-*/linux/gtk/x86_64/* . 2>/dev/null || true && \
    rm -rf /tmp/gama.zip gama.product-* && \
    chmod +x *.sh 2>/dev/null || true

RUN mkdir -p ${GAMA_HOME}/workspace && \
    mkdir -p ${GAMA_HOME}/logs

VOLUME ["${GAMA_HOME}/workspace", "${GAMA_HOME}/logs"]

EXPOSE 8080 9090

ENV JAVA_OPTS="-Xms1g -Xmx4g -XX:+UseG1GC"
ENV GAMA_OPTS=""

ENTRYPOINT ["java", "-jar"]

CMD ["plugins/gama.headless-0.0.0-SNAPSHOT.jar"]
