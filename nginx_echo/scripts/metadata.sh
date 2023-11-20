#!/bin/bash

CLOUD_PROVIDER="unknown"
if curl --connect-timeout 1 -f -sq -H "Metadata-Flavor: Google" "http://metadata.google.internal" >/dev/null 2>&1; then
    CLOUD_PROVIDER="gcp"
elif curl --connect-timeout 1 -f -sq "http://169.254.169.254/latest/meta-data/" >/dev/null 2>&1; then
    CLOUD_PROVIDER="aws"
fi

## Fetch Metadata
case $CLOUD_PROVIDER in
"gcp")
    curl -f -sq -H "Metadata-Flavor: Google" "http://metadata.google.internal/computeMetadata/v1/?recursive=true" >/tmp/metadata.json
    if [[ ! -z "${K_SERVICE}" ]]; then
        cat <<<"$(jq --arg value "$K_SERVICE" '.kubernetes.service = $value' /tmp/metadata.json)" >/tmp/metadata.json
    fi

    if [[ ! -z "${K_REVISION}" ]]; then
        cat <<<"$(jq --arg value "$K_REVISION" '.kubernetes.revision = $value' /tmp/metadata.json)" >/tmp/metadata.json
    fi

    if [[ "true" == ${includeEnvironment,,} ]]; then
        cat <<<"$(jq --argjson value "$(jq -n env)" '.environment = $value' /tmp/metadata.json)" >/tmp/metadata.json
    fi
    ;;
"aws")
    curl -f -sq "http://169.254.169.254/latest/meta-data/" >/tmp/metadata.json
    ;;
*)
    echo {} >/tmp/metadata.json
    ;;
esac

## Set Cloud Provider
jq --arg cp "$CLOUD_PROVIDER" '. + {cloudProvider: $cp}' /tmp/metadata.json >/tmp/metadata.json
