FROM nginx
ENV DEBIAN_FRONTEND=noninteractive

ENV ENV_NGINX_ERROR_LEVEL=off

ENV ENV_UPSTREAM_DELAY_MIN_TIME=0
ENV ENV_UPSTREAM_DELAY_MAX_TIME=1000
ENV ENV_UPSTREAM_DELAY_RATIO=0

ENV ENV_UPSTREAM_RESPONSE_DRP_WEIGHT=0
ENV ENV_UPSTREAM_RESPONSE_2XX_WEIGHT=100
ENV ENV_UPSTREAM_RESPONSE_4XX_WEIGHT=0
ENV ENV_UPSTREAM_RESPONSE_5XX_WEIGHT=0

ENV ENV_SERVER_ADDR_HTTP=*:80
ENV ENV_SERVER_ADDR_HTTPS=*:443

ENV ENV_UPSTREAM_ADDR_HTTP=example.com:80
ENV ENV_UPSTREAM_ADDR_HTTPS=example.com:443

RUN apt-get update
RUN apt-get install curl wget vim nginx-module-njs jq -y
RUN apt-get clean

RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf

COPY ./entrypoint.sh /usr/local/bin/
COPY ./nginx/conf.d/* /etc/nginx/conf.d/
COPY ./nginx/nginx.conf /etc/nginx/
COPY ./nginx/ssl/* /etc/nginx/

WORKDIR /usr/local/bin/
ENTRYPOINT [ "entrypoint.sh" ]