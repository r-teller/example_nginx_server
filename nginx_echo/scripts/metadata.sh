#!/bin/bash

## Google Metadata Test
curl -f -sq -H "Metadata-Flavor: Google" "http://metadata.google.internal/computeMetadata/v1/?recursive=true" >/tmp/metadata.json
if [ 0 -ne $? ]; then
    echo {} >/tmp/metadata.json
fi

if [[ ! -z "${K_SERVICE}" ]]; then
    cat <<<"$(jq --arg value "$K_SERVICE" '.kubernetes.service = $value' /tmp/metadata.json)" >/tmp/metadata.json
fi

if [[ ! -z "${K_REVISION}" ]]; then
    cat <<<"$(jq --arg value "$K_REVISION" '.kubernetes.revision = $value' /tmp/metadata.json)" >/tmp/metadata.json
fi

if [[ "true" == ${includeEnvironment,,} ]]; then
    cat <<<"$(jq --argjson value "$(jq -n env)" '.environment = $value' /tmp/metadata.json)" >/tmp/metadata.json
fi