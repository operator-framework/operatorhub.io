#!/bin/sh

pushd ../data/
if [ ! -d "community-operators" ]; then
  if [ ! $1 ]; then
    echo "Using default community operators repository"
    OPERATORS_REPO=https://github.com/operator-framework/community-operators.git
  else
    OPERATORS_REPO=$1
  fi
  git clone $OPERATORS_REPO community-operators || exit 1
  popd
  exit 0
fi

pushd community-operators
git fetch origin master
git pull origin master
popd
popd
exit 0
