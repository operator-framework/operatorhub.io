FROM registry.access.redhat.com/ubi8/nodejs-10:latest

ARG OPERATORS_REPO=https://github.com/operator-framework/community-operators
ARG OPERATORS_BRANCH=master

ENV APP_ROOT=/app

WORKDIR ${APP_ROOT}

# root for build stages
USER root

# frontent
COPY frontend/ ${APP_ROOT}/frontend
RUN cd ${APP_ROOT}/frontend; npm install \
    && npm run-script build \
    && rm -rdf ${APP_ROOT}/frontend/node_modules ${APP_ROOT}/frontend/.cache-loader /opt/app-root/src/.npm /tmp/v8-compile-cache-0

# server
COPY server/ ${APP_ROOT}/server
RUN cd ${APP_ROOT}/server \
    && npm install \
    && npm run tsc \
    && rm -rdf /opt/app-root/src/.npm /tmp/v8-compile-cache-0

# prepare upstream operators for server processing
RUN mkdir -p ${APP_ROOT}/server/data/community-operators \
    && mkdir -p /tmp/community-operators \
    && git clone -b $OPERATORS_BRANCH $OPERATORS_REPO /tmp/community-operators \
    && cp -a /tmp/community-operators/upstream-community-operators ${APP_ROOT}/server/data/community-operators/upstream-community-operators \
    && rm -rfd /tmp/community-operators

### Setup user for build execution and application runtime
ENV APP_ROOT=/app
ENV HOME=${APP_ROOT}
RUN chmod -R u+x ${APP_ROOT}/server/bin && \
    chgrp -R 0 ${APP_ROOT} && \
    chmod -R g=u ${APP_ROOT} /etc/passwd

### Containers should NOT run as root as a good practice
USER 1001

# Finalize
WORKDIR ${APP_ROOT}/server
ENTRYPOINT [ "/app/server/bin/uid_entrypoint" ]
EXPOSE 8080
