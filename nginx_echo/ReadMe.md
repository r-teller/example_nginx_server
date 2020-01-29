This is an example nginx server that will return information about the incoming HTTP Request in a JSON format
- Pass in a status query param == (2XX | 3XX | 4XX | 5XX ) to get back a custom status code
- Pass in a request in the 5400 (HTTPS) or 5800 (HTTP) range to recieve a status code of 500
- Pass in a request in the 6200 (HTTPs) or 6100 (HTTP) range to randomly switch between HEALTHY and UNHEALTHY responses
```bash
docker run -dit --net=host --name nginxWorkload rteller/example_nginx_server:latest
```

```bash
## Basic HTTP request

ubuntu@ip-10-10-3-191:~$ curl -ks http://localhost | jq
{
  "request": {
    "uri": {
      "headers": {
        "Host": "localhost",
        "User-Agent": "curl/7.58.0",
        "Accept": "*/*"
      },
      "method": "GET",
      "scheme": "http",
      "path": "/",
      "fullPath": "/"
    },
    "network": {
      "clientPort": "50178",
      "clientAddress": "127.0.0.1",
      "serverAddress": "127.0.0.1",
      "serverPort": "80"
    },
    "ssl": {
      "isHttps": false
    },
    "session": {
      "requestId": "1799dfb0091b9773fd45ad8bb5c689e5",
      "connection": "11",
      "connectionNumber": "1"
    }
  },
  "response": {
    "statusCode": 200,
    "statusReason": "DEFAULT",
    "statusBody": "HEALTHY",
    "timeStamp": "2020-01-29T06:55:07+00:00"
  }
}
```
```bash
## Basic HTTPS request

ubuntu@ip-10-10-3-191:~$ curl -ks https://localhost | jq
{
  "request": {
    "uri": {
      "headers": {
        "Host": "localhost",
        "User-Agent": "curl/7.58.0",
        "Accept": "*/*"
      },
      "method": "GET",
      "scheme": "https",
      "path": "/",
      "fullPath": "/"
    },
    "network": {
      "clientPort": "33254",
      "clientAddress": "127.0.0.1",
      "serverAddress": "127.0.0.1",
      "serverPort": "443"
    },
    "ssl": {
      "isHttps": true,
      "sslProtocol": "TLSv1.2",
      "sslCipher": "ECDHE-RSA-AES256-GCM-SHA384"
    },
    "session": {
      "requestId": "f14747ee52d837a9a2701e65d7db8b9b",
      "connection": "12",
      "connectionNumber": "1"
    }
  },
  "response": {
    "statusCode": 200,
    "statusReason": "DEFAULT",
    "statusBody": "HEALTHY",
    "timeStamp": "2020-01-29T06:58:15+00:00"
  }
}
```

```bash
## Example request with random response

ubuntu@ip-10-10-3-191:~$ curl -ks https://localhost:6200/  | jq                      
{
  "request": {
    "uri": {
      "headers": {
        "Host": "localhost:6200",
        "User-Agent": "curl/7.58.0",
        "Accept": "*/*"
      },
      "method": "GET",
      "scheme": "https",
      "path": "/",
      "fullPath": "/"
    },
    "network": {
      "clientPort": "54988",
      "clientAddress": "127.0.0.1",
      "serverAddress": "127.0.0.1",
      "serverPort": "6200"
    },
    "ssl": {
      "isHttps": true,
      "sslProtocol": "TLSv1.2",
      "sslCipher": "ECDHE-RSA-AES256-GCM-SHA384"
    },
    "session": {
      "requestId": "f5f3f2156196542360f77b1b761b1700",
      "connection": "15",
      "connectionNumber": "1"
    }
  },
  "response": {
    "statusCode": 500,
    "statusReason": "RANDOM_SERVER_PORT_RANGE",
    "statusBody": "UNHEALTHY",
    "timeStamp": "2020-01-29T07:00:11+00:00"
  }
}
```

```bash
## Advanced HTTP Delete example that returns status code of 204
ubuntu@ip-10-10-3-191:~$ curl -ksv https://localhost/?status=204 -X DELETE
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to localhost (127.0.0.1) port 443 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
* successfully set certificate verify locations:
*   CAfile: /etc/ssl/certs/ca-certificates.crt
  CApath: /etc/ssl/certs
* (304) (OUT), TLS handshake, Client hello (1):
* (304) (IN), TLS handshake, Server hello (2):
* TLSv1.2 (IN), TLS handshake, Certificate (11):
* TLSv1.2 (IN), TLS handshake, Server key exchange (12):
* TLSv1.2 (IN), TLS handshake, Server finished (14):
* TLSv1.2 (OUT), TLS handshake, Client key exchange (16):
* TLSv1.2 (OUT), TLS change cipher, Client hello (1):
* TLSv1.2 (OUT), TLS handshake, Finished (20):
* TLSv1.2 (IN), TLS handshake, Finished (20):
* SSL connection using TLSv1.2 / ECDHE-RSA-AES256-GCM-SHA384
* ALPN, server accepted to use http/1.1
* Server certificate:
*  subject: CN=shop.ecom.dev
*  start date: Dec  2 21:36:31 2019 GMT
*  expire date: Nov 29 21:36:31 2029 GMT
*  issuer: CN=shop.ecom.dev
*  SSL certificate verify result: self signed certificate (18), continuing anyway.
> DELETE /?status=204 HTTP/1.1
> Host: localhost
> User-Agent: curl/7.58.0
> Accept: */*
> 
< HTTP/1.1 204 No Content
< Server: nginx/1.17.4
< Date: Wed, 29 Jan 2020 06:59:35 GMT
< Connection: keep-alive
< 
* Connection #0 to host localhost left intact
```