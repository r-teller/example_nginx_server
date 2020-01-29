This is an example nginx server that will return information about the incoming HTTP Request in a JSON format
- Pass in a status query param == (2XX | 3XX | 4XX | 5XX ) to get back a custom status code

```bash
docker run -dit --net=host --name nginxWorkload rteller/example_nginx_server:latest
```

```bash
root@testenv-a986f4b6-workload-2:~/example_nginx_server# curl localhost
{
        "hostname": "testenv-abf22b09-workload-1",
        "network": {
            "clientPort": "56798",
            "clientAddress": "172.18.68.184",
            "serverAddress": "10.149.35.8",
            "serverPort": "443"
        },
        "uri": {
            "httpVersion": "HTTP/1.1",
            "method": "GET",
            "scheme": "https",
            "fullPath": "/browser/test?foo=bar",
            "path": "/browser/test",
            "queryString": "foo=bar",
            "isHttps": true
        },
        "ssl": {
            "sslProtocol": "TLSv1.2",
            "sslCipher": "ECDHE-RSA-AES128-GCM-SHA256"
        },
        "session": {
            "httpConnection": "keep-alive",
            "requestId": "242297953919d02131d3dbc9e3aaa072",
            "connection": "48",
            "connectionNumber": "3"
        },
        "headers": {
            "host": "10.149.35.8",
            "userAgent": "Mozilla/5.0",
            "xForwardedFor": "",
            "xForwardedProto": ""
        },
        "status": 200
    }
```
