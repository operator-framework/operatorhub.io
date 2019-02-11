#!/bin/sh

pushd ../data/
if [ ! -d "community-operators" ]; then
  if [ ! $1 ]; then
    echo "Please provide github URL to clone as command line argument"
    exit 1
  else
    git clone $1 community-operators || exit 1
    popd
    exit 0
  fi
fi

pushd community-operators
git fetch origin master
git pull origin master
popd
popd
exit 0
