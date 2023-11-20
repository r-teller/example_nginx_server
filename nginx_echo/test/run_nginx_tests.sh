#!/bin/bash

echo "Running test to verify nginx.conf syntax"
nginx -t

echo "Installing JSON syntax validator"
# apt-get install npm -y
# apt-get install npm --no-install-recommends -y
# npm install -g ajv-cli

# ## Add legacy repo to support old version of curl
# echo 'deb http://ftp.de.debian.org/debian stretch main' >> /etc/apt/sources.list.d/stretch-main.list
# apt-get update
# apt-get install libcurl3 curl=7.52.1-5+deb9u9 -y --allow-downgrades

echo "Verify Base Request"
echo "Base Request - HTTP"
curl -ks http://localhost/ | jq . > /tmp/test_schema_1_base_http.json

echo "Base Request - HTTPs"
curl -ks https://localhost/ | jq . > /tmp/test_schema_1_base_https.json

echo "Verify request by Query Params"
echo "Query Params - 2XX"
curl -ks http://localhost/?status=200 | jq . > /tmp/test_schema_2_query_200_http.json

echo "Query Params - 3XX"
curl -ks http://localhost/?status=300 | jq . > /tmp/test_schema_2_query_300_http.json

echo "Query Params - 4XX"
curl -ks http://localhost/?status=400 | jq . > /tmp/test_schema_2_query_400_http.json

echo "Query Params - 5XX"
curl -ks http://localhost/?status=500 | jq . > /tmp/test_schema_2_query_500_http.json

echo "Query Params - 6XX"
curl -ks http://localhost/?status=600 | jq . > /tmp/test_schema_2_query_600_http.json

echo "Verify request by Destination Port"
echo "Destination Port - 54XX"
curl -ks https://localhost:5400/ | jq . > /tmp/test_schema_3_port_54XX_https.json

echo "Destination Port - 58XX"
curl -ks http://localhost:5800/ | jq . > /tmp/test_schema_3_port_58XX_http.json

echo "Destination Port - 61XX"
curl -ks http://localhost:6100/ | jq . > /tmp/test_schema_3_port_61XX_http.json

echo "Destination Port - 62XX"
curl -ks https://localhost:6200/ | jq . > /tmp/test_schema_3_port_62XX_https.json

echo "Test additional scenarios"
curl -ks 'http://localhost/foo/bar?first=oof&second=rab' | jq . > /tmp/test_schema_4_params.json
curl -ks http://localhost/ -X PUT --data "TestingPut" | jq . > /tmp/test_schema_4_put.json
curl -ks http://localhost/ -X POST --data "TestingPOST" | jq .  > /tmp/test_schema_4_post.json
curl -ks https://localhost --tlsv1.0 | jq .  > /tmp/test_schema_4_tlsv10.json

## Working through validation issues
ajv test -s /usr/local/bin/schema.json -d "/tmp/test_schema_*.json" --valid