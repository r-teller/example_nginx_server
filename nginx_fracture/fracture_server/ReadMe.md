This is an example nginx server that will impact requests that are proxied by it based on provided environment variables
- ENV_NGINX_ERROR_LEVEL = sets the error logging level for nginx (default=none)
- ENV_UPSTREAM_DELAY_MIN_TIME = specifies the minimum delay to use when delaying a request (default=0)
- ENV_UPSTREAM_DELAY_MAX_TIME = specifies the maximum delay to use when delaying a request (default=1000)
- ENV_UPSTREAM_DELAY_RATIO = specifies the liklihood that a request will be delayed (default=0)
- *NOTE* UPSTREAM Response codes are weighted, so increasing the value of a response type will increase its likelihood of occurance
- ENV_UPSTREAM_RESPONSE_DRP_WEIGHT = specifies the liklihood that a response will be reset (default=0)
- ENV_UPSTREAM_RESPONSE_2XX_WEIGHT = specifies the liklihood that a response will be not be errored (default=100)
- ENV_UPSTREAM_RESPONSE_4XX_WEIGHT = specifies the liklihood that a response will be auth error (default=0)
- ENV_UPSTREAM_RESPONSE_5XX_WEIGHT = specifies the liklihood that a response will be server error (default=0)
- *NOTE* only a single UPSTREAM_ADDR per scheme is currently supported
- ENV_UPSTREAM_ADDR_HTTP = specifies the upstream server to forward HTTP traffic to (default=example.com:80)
- ENV_UPSTREAM_ADDR_HTTPS = specifies the upstream server to forward HTTPS traffic to (default=example.com:443)
- *NOTE* only a single SERVER_ADDR per scheme is currently supported but you can configure multiple container ports using -p
- ENV_SERVER_ADDR_HTTP = specifies the address and port NGINX should listen on for HTTP traffic (default=*:80)
- ENV_SERVER_ADDR_HTTPS = specifies the address and port NGINX should listen on for HTTPS traffic (default=*:443)


```bash
# Launches container that will randomly resets 50% of requests proxied by weight
docker run -dit --name nginx_fracture \
    -p 80:80 \
    -p 443:443 \
    -e ENV_UPSTREAM_RESPONSE_DRP_WEIGHT=100 \
    -e ENV_UPSTREAM_RESPONSE_2XX_WEIGHT=100 \
    -e ENV_UPSTREAM_ADDR_HTTP=10.10.0.33:80 \
    -e ENV_UPSTREAM_ADDR_HTTPS=10.10.0.33:443 \
    --restart always rteller/nginx_fracture
```

```bash
# Launches container that will randomly delay 50% of requests proxied between 1000 and 1500 ms
docker run -dit --name nginx_fracture \
    -p 80:80 \
    -p 443:443 \
    -e ENV_UPSTREAM_DELAY_MIN_TIME=1000 \
    -e ENV_UPSTREAM_DELAY_MAX_TIME=1500 \
    -e ENV_UPSTREAM_DELAY_RATIO=50 \
    -e ENV_UPSTREAM_ADDR_HTTP=10.10.0.33:80 \
    -e ENV_UPSTREAM_ADDR_HTTPS=10.10.0.33:443 \
    --restart always rteller/nginx_fracture
```

```bash
# Launches container that will 
## randomly delay 10% of requests proxied between 1000 and 1500 ms
## randomly drop or error a weighted amount of traffic
docker run -dit --name nginx_fracture \
    -p 80:80 \
    -p 443:443 \
    -e ENV_UPSTREAM_DELAY_MIN_TIME=1000 \
    -e ENV_UPSTREAM_DELAY_MAX_TIME=1500 \
    -e ENV_UPSTREAM_DELAY_RATIO=10 \
    -e ENV_UPSTREAM_RESPONSE_DRP_WEIGHT=50 \
    -e ENV_UPSTREAM_RESPONSE_2XX_WEIGHT=100 \
    -e ENV_UPSTREAM_RESPONSE_5XX_WEIGHT=50 \
    -e ENV_UPSTREAM_ADDR_HTTP=10.10.0.33:80 \
    -e ENV_UPSTREAM_ADDR_HTTPS=10.10.0.33:443 \
    --restart always rteller/nginx_fracture
```


```bash
docker run -dit --name nginx_fracture_trading \
    -p 9811:80 \
    -e ENV_UPSTREAM_DELAY_MIN_TIME=1000 \
    -e ENV_UPSTREAM_DELAY_MAX_TIME=1500 \
    -e ENV_UPSTREAM_DELAY_RATIO=100 \
    -e ENV_UPSTREAM_RESPONSE_2XX_WEIGHT=100 \
    -e ENV_UPSTREAM_ADDR_HTTP=10.1.20.21:9801 \
    -e ENV_UPSTREAM_ADDR_HTTPS=10.1.20.21:9801 \
    --restart always rteller/nginx_fracture
```

```bash
docker run -dit --name nginx_fracture_www \
    -p 9901:80 \
    -e ENV_UPSTREAM_DELAY_MIN_TIME=1000 \
    -e ENV_UPSTREAM_DELAY_MAX_TIME=1500 \
    -e ENV_UPSTREAM_DELAY_RATIO=100 \
    -e ENV_UPSTREAM_RESPONSE_2XX_WEIGHT=100 \
    -e ENV_UPSTREAM_RESPONSE_5XX_WEIGHT=25 \
    -e ENV_UPSTREAM_ADDR_HTTP=10.1.20.21:8001 \
    -e ENV_UPSTREAM_ADDR_HTTPS=10.1.20.21:8001 \
    --restart always rteller/nginx_fracture
```