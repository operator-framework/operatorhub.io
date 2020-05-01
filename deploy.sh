#!/bin/bash

set -e

ENVIRO=$1

if [[ ! "$ENVIRO" =~ ^(pica|dev|preprod|prod)$ ]]; then
    echo "Invalid environment $ENVIRO, only dev, preprod and prod supported"
    exit
fi

mkdir -p bin
if ! ./bin/oc >/dev/null ; then
    echo Installing openshift origin client
    wget https://github.com/openshift/origin/releases/download/v3.11.0/openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit.tar.gz
    tar -xvf openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit.tar.gz
    mv openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit/oc bin/
fi

if ! ./bin/kustomize >/dev/null; then
    echo Installing kustomize
    wget https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv3.5.4/kustomize_v3.5.4_linux_amd64.tar.gz
    tar -xvf kustomize_v3.5.4_linux_amd64.tar.gz
    mv kustomize bin
fi

if [[ "$ENVIRO" == "preprod" ]]; then
    OPENSHIFT_TOKEN=$OPENSHIFT_TOKEN_PREPROD
fi

./bin/oc login --token="$OPENSHIFT_TOKEN" --server="$OPENSHIFT_SERVER" > /dev/null
./bin/kustomize build k8s/$ENVIRO | sed "s/DEPLOYMENT_RUN_ID/$(uuidgen)/" > manifest.yaml
cat manifest.yaml
cat manifest.yaml | ./bin/oc apply -f -
./bin/oc rollout status -w deploy/operatorhubio
