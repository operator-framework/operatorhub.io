#!/bin/sh

if [ ! -d "data/community-operators" ]; then
  pushd ./data/

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

pushd data/community-operators
git fetch origin master
git pull origin master
popd

exit 0
