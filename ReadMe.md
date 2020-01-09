This is an example nginx server that will return information about the incoming HTTP Request in a JSON format
- Pass in a status query param == (2XX | 3XX | 4XX | 5XX ) to get back a custom status code

```bash
docker run -dit --net=host --name nginxWorkload rteller/example_nginx_server:latest
```

```bash
root@testenv-a986f4b6-workload-2:~/example_nginx_server# curl localhost
{
	"instance": {
		"hostname": "testenv-abf22b09",
		"serverAddress": "10.149.35.8",
		"port": "80"
	},
	"uri": {
		"httpVersion": "HTTP/1.1",
		"method": "GET",
		"scheme": "http",
		"fullPath": "/browse/test?foo=bar",
		"path": "/browse/test",
		"queryString": "foo=bar",
		"isHttps": false
	},
	"ssl": {
		"sslProtocol": "",
		"sslCipher": ""
	},
	"session": {
		"httpConnection": "close",
		"requestId": "b9c0832c8645987d1d7ec013b0d1dad0",
		"connection": "8",
		"connectionNumber": "1"
	},
	"headers": {
		"host": "localhost",
		"userAgent": "curl/7.58.0",
		"xForwardedFor": "127.0.0.1",
		"xForwardedProto": ""
	},
	"status": 200
}
```
