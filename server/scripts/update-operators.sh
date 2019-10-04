#!/bin/bash

pushd ./data/

if [ ! -d "community-operators" ]; then
  
  if [ ! $1 ]; then
    echo "Using default community operators repository"
    OPERATORS_REPO=https://github.com/operator-framework/community-operators.git
  else
    OPERATORS_REPO=$1
    echo "Using $OPERATORS_REPO as community operators repository"
  fi

  git clone $OPERATORS_REPO community-operators || exit 1
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
