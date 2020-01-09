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
		"serverAddress": "127.0.0.1",
		"port": "443"
	},
	"uri": {
		"httpVersion": "HTTP/1.1",
		"method": "GET",
		"scheme": "https",
		"fullPath": "/",
		"path": "/",
		"queryString": "",
		"isHttps": true
	},
	"ssl": {
		"sslProtocol": "TLSv1.2",
		"sslCipher": "ECDHE-RSA-AES256-GCM-SHA384"
	},
	"session": {
		"requestId": "2195ba795b567d78f64ac595da75e12c",
		"connection": "5",
		"connectionNumber": "1"
	},
	"headers": {
		"host": "localhost",
		"userAgent": "curl/7.58.0",
		"xForwardedFor": "",
		"xForwardedProto": "",
		"connection": ""

	},
	"status": 200
}
```
