# Frontend builder stage
FROM registry.access.redhat.com/ubi8/nodejs-10:latest as node-frontend-build

ENV APP_ROOT=/app

USER root
WORKDIR ${APP_ROOT}
COPY frontend/package.json frontend/package-lock.json ${APP_ROOT}/
RUN npm install
COPY frontend/ ${APP_ROOT}/
RUN npm run-script build

# Server builder
FROM registry.access.redhat.com/ubi8/nodejs-10:latest as node-server-build

ENV APP_ROOT=/app

USER root
WORKDIR ${APP_ROOT}

COPY server/package.json server/package-lock.json ${APP_ROOT}/
RUN npm install
COPY server/ ${APP_ROOT}

RUN chgrp -R 0 ${APP_ROOT} && \
    chmod -R g=u ${APP_ROOT}

# Python builder
FROM registry.access.redhat.com/ubi8/python-36 as python-build

ARG COURIER_VERSION=2.1.0
ARG OPERATORS_REPO=https://github.com/operator-framework/community-operators
ARG OPERATORS_BRANCH=master

RUN pip install operator-courier==$COURIER_VERSION
RUN git clone -b $OPERATORS_BRANCH $OPERATORS_REPO /tmp/community-operators
RUN cd /tmp/community-operators/upstream-community-operators \
    && find . -mindepth 1 -maxdepth 1 -type d -exec echo "courier-operator -> {}" \; -exec operator-courier nest {} nested-structure/{} \;  \
    && echo "Done"

# Runtime stage
FROM registry.access.redhat.com/ubi8/nodejs-10:latest

ENV APP_ROOT=/app

WORKDIR ${APP_ROOT}/server
#CMD [ "/app/server/server.js" ]
EXPOSE 8080

USER root
COPY --from=node-frontend-build /app/dist ${APP_ROOT}/frontend/dist
COPY --from=node-server-build /app/ ${APP_ROOT}/server
COPY --from=python-build /tmp/community-operators/upstream-community-operators/nested-structure ${APP_ROOT}/server/data/community-operators/upstream-community-operators

### Setup user for build execution and application runtime
ENV APP_ROOT=/app
ENV HOME=${APP_ROOT}
RUN chmod -R u+x ${APP_ROOT}/server/bin && \
    chgrp -R 0 ${APP_ROOT} && \
    chmod -R g=u ${APP_ROOT} /etc/passwd

### Containers should NOT run as root as a good practice
USER 1001

ENTRYPOINT [ "/app/server/bin/uid_entrypoint" ]
