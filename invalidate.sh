#!/bin/bash

set -e

mkdir -p bin
if ! ./bin/egcurl >/dev/null 2>&1; then
    echo Installing egcurl
    curl -o bin/egcurl https://raw.githubusercontent.com/akamai/edgegrid-curl/a69a71a133a539df3195f82a56664b21bc9beb0b/egcurl
    pip2 install --user edgegrid-python
fi

if ! cat ~/.edgerc >/dev/null ; then
    echo Setting up ~/.edgerc
    echo $AKAMAI_SECRETS | base64 -d > ~/.edgerc
    cat ~/.edgerc
fi

python2 bin/egcurl -sSik \
    --eg-section ccu \
    -X POST \
    --data-binary "{\"objects\":[$AKAMAI_APPCODES]}" \
    -H "Content-type: application/json" \
    -H "Accept: application/json" \
    "https://$AKAMAI_HOST/ccu/v3/invalidate/cpcode/production"
