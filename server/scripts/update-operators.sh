#!/bin/sh
if [ ! -d "community-operators" ]; then
  git clone https://github.com/operator-framework/community-operators.git
  exit 0
fi
 
cd community-operators
git fetch origin master
git pull origin master
exit 0
