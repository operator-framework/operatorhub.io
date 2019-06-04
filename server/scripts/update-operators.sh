#!/bin/sh

pushd ./data/

if [ ! -d "example-apps" ]; then
  
  if [ ! $1 ]; then
    echo "Using default community apps repository"
    OPERATORS_REPO=https://github.com/knative-scout/serverless-apps.git
  else
    OPERATORS_REPO=$1
    echo "Using $OPERATORS_REPO as community app repository"
  fi

  git clone $OPERATORS_REPO example-apps || exit 1
fi

if [ ! $2 ]; then
  echo "Using master branch"
  OPERATORS_BRANCH=master
else
  OPERATORS_BRANCH=$2
  echo "Using $OPERATORS_BRANCH branch"
fi

pushd community-operators
git fetch origin $OPERATORS_BRANCH
git pull origin $OPERATORS_BRANCH
popd

popd
exit 0
