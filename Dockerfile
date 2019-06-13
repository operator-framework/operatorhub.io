FROM python:3.6 as python-build

ARG COURIER_VERSION=2.1.0
ARG OPERATORS_REPO=https://github.com/operator-framework/community-operators
ARG OPERATORS_BRANCH=master

RUN pip install operator-courier==$COURIER_VERSION

RUN git clone -b $OPERATORS_BRANCH $OPERATORS_REPO /tmp/community-operators

RUN cd /tmp/community-operators/upstream-community-operators \
    && find . -mindepth 1 -maxdepth 1 -type d -exec echo "courier-operator -> {}" \; -exec operator-courier nest {} nested-structure/{} \;  \
    && echo "Done"

FROM node:11.15.0 as node-frontend-build
WORKDIR /app

COPY frontend/package.json .
RUN npm install

COPY frontend/ /app/
RUN npm run-script build

FROM node:11.15.0 as node-server-build
WORKDIR /app

COPY server/package.json .
RUN npm install

COPY server/ /app

FROM node:11.15.0
WORKDIR /app/server

ENTRYPOINT [ "node" ]
EXPOSE 8080
CMD [ "/app/server/server.js" ]

COPY --from=node-frontend-build /app/ /app/frontend
COPY --from=node-server-build /app/ /app/server
COPY --from=python-build /tmp/community-operators /app/server/data/community-operators
