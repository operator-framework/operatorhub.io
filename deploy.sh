#!/bin/bash

set -e

ENVIRO=$1

if [[ ! "$ENVIRO" =~ ^(dev|preprod|prod)$ ]]; then
    echo "Invalid environment $ENVIRO, only dev, preprod and prod supported"
    exit
fi

mkdir -p bin
if ! /usr/local/bin/oc > /dev/null 2>&1 ; then
    echo openshift origin client not found, installing
    curl -#L -o openshift.tar.gz https://github.com/openshift/origin/releases/download/v3.11.0/openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit.tar.gz
    tar -xvf openshift.tar.gz --wildcards '*oc'
    mv openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit/oc bin/
    rm -rd openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit*
fi

if ! /usr/local/bin/kustomize > /dev/null 2>&1 ; then
    echo kustomize binary not found, installing
    curl -L# -o kustomize.tar.gz https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv3.5.4/kustomize_v3.5.4_linux_amd64.tar.gz
    tar -xvf kustomize.tar.gz
    mv kustomize bin
fi

if [[ "$ENVIRO" == "dev" ]]; then
    OPENSHIFT_TOKEN=$OPENSHIFT_TOKEN_DEV
fi

if [[ "$ENVIRO" == "preprod" ]]; then
    OPENSHIFT_TOKEN=$OPENSHIFT_TOKEN_PREPROD
fi

if [[ "$ENVIRO" == "prod" ]]; then
    OPENSHIFT_TOKEN=$OPENSHIFT_TOKEN_PROD
fi

oc login --token="$OPENSHIFT_TOKEN" --server="$OPENSHIFT_SERVER"
# oc login --token="$OPENSHIFT_TOKEN" --server="$OPENSHIFT_SERVER" > /dev/null
kustomize build k8s/$ENVIRO | sed "s/DEPLOYMENT_RUN_ID/$(uuidgen)/" > manifest.yaml
cat manifest.yaml
cat manifest.yaml | oc apply -f -
oc rollout status -w deploy/operatorhubio
