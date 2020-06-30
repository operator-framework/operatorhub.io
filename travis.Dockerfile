FROM alpine:3.12 as alpine_deps_builder

ENV DOCKERIZE_VERSION v0.6.1
ENV APP_ROOT=/app

ARG OPERATORS_REPO=https://github.com/operator-framework/community-operators
ARG OPERATORS_BRANCH=master

RUN apk add --no-cache git curl

WORKDIR ${APP_ROOT}

# prepare dockerize
RUN curl -#L -o dockerize.tar.gz https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -xzvf dockerize.tar.gz

# prepare upstream operators for server processing
RUN mkdir -p ${APP_ROOT}/server/data/community-operators \
    && mkdir -p /tmp/community-operators \
    && git clone --depth 1 -b $OPERATORS_BRANCH $OPERATORS_REPO

# build frontend dist files
FROM node:10.19.0-alpine as alpine_frontend_builder

ENV APP_ROOT=/app

WORKDIR ${APP_ROOT}

# root for build stages
USER root

COPY frontend/ ${APP_ROOT}/frontend
RUN cd ${APP_ROOT}/frontend; npm install \
    && npm run-script build

FROM node:10.19.0-buster-slim
#FROM node:10.19.0-alpine

ENV APP_ROOT=/app
ENV HOME=${APP_ROOT}

# root for build stages
# USER root

# RUN apk add --no-cache vips-dev
# gcc g++ make libc6-compat

# server
COPY server/ ${APP_ROOT}/server
RUN cd ${APP_ROOT}/server \
    && npm install \
    && npm run tsc \
    && rm -rf /opt/app-root/src/.npm /tmp/v8-compile-cache-0 ${APP_ROOT}/app/.config ${APP_ROOT}/.npm

COPY --from=alpine_deps_builder ${APP_ROOT}/dockerize /usr/local/bin/dockerize
# COPY --from=alpine_deps_builder ${APP_ROOT}/community-operators/upstream-community-operators ${APP_ROOT}/server/data/community-operators/upstream-community-operators
COPY --from=alpine_frontend_builder ${APP_ROOT}/frontend/dist ${APP_ROOT}/frontend/dist
# COPY --from=alpine_server_builder ${APP_ROOT}/server ${APP_ROOT}/server

### Setup user for build execution and application runtime
RUN chmod -R u+x ${APP_ROOT}/server/bin && \
    chgrp -R 0 ${APP_ROOT} && \
    chmod -R g=u ${APP_ROOT} /etc/passwd

### Containers should NOT run as root as a good practice
USER 1001

# Finalize
WORKDIR ${APP_ROOT}/server
ENTRYPOINT [ "/app/server/bin/uid_entrypoint" ]
EXPOSE 8080
