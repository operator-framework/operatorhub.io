#!/bin/bash

set -e

mkdir -p bin
if ! ./bin/akamai-purge >/dev/null 2>&1; then
    echo Installing akamai-purge
    wget -Lo bin/akamai-purge https://github.com/akamai/cli-purge/releases/download/1.0.1/akamai-purge-1.0.1-linuxamd64
    chmod +x bin/akamai-purge
fi

if [ ! -f ~/.edgerc ]; then
    echo Setting up ~/.edgerc
    echo $AKAMAI_SECRETS | base64 -d > ~/.edgerc
fi

bin/akamai-purge \
    invalidate \
    --cpcode $AKAMAI_APPCODES
