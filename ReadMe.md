This is an example nginx server that will return information about the incoming HTTP Request in a JSON format
- Pass in a status query param == (2XX | 3XX | 4XX | 5XX ) to get back a custom status code

```bash
docker run -dit --net=host --name nginxWorkload rteller/example_nginx_server
```

```bash
root@testenv-a986f4b6-workload-2:~/example_nginx_server# curl localhost
{
        "instance": {
            "hostname": "testenv-a986f4b6-workload-2.indigo.test",
            "serverAddress": "127.0.0.1",
        },
        "uri": {
            "scheme": "http",
            "fullPath": "/",
            "path": "/",
            "queryString": ""
            "port": "80",
            "isHttps": false
        },
        "headers": {
            "host": "localhost",
            "x-forwarded-for": "",
            "x-forwarded-proto": ""
        }
        "status": "200"
    }
```
