This is an example nginx server that will return information about the incoming HTTP Request in a JSON format
- Pass in a status query param == (2XX | 3XX | 4XX | 5XX ) to get back a custom status code

```bash
docker run -dit --net=host --name nginxWorkload rteller/example_nginx_server
```

```bash
root@testenv-a986f4b6-workload-2:~/example_nginx_server# curl localhost
{
	"instance": {
		"hostname": "ubuntu-112233",
		"serverAddress": "127.0.0.1"
	},
	"uri": {
		"method": "GET",
		"scheme": "http",
		"fullPath": "/foo?a=b",
		"path": "/foo",
		"queryString": "a=b",
		"port": "80",
		"isHttps": false
	},
	"headers": {
		"host": "localhost",
		"x-forwarded-for": "192.168.10.10",
		"x-forwarded-proto": "https"
	},
	"status": 200
}
```
