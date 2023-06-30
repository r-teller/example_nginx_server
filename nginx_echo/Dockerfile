FROM nginx
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update
RUN apt-get install curl wget vim nginx-module-njs jq -y
RUN apt-get clean

RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf

COPY ./nginx/conf.d/* /etc/nginx/conf.d/
COPY ./nginx/html /etc/nginx/html
COPY ./nginx/nginx.conf /etc/nginx/
COPY ./nginx/ssl/* /etc/nginx/

COPY ./test/run_nginx_tests.sh /usr/local/bin
COPY ./test/schema.json /usr/local/bin

COPY ./scripts/metadata.sh /docker-entrypoint.d/metadata.sh
RUN chmod +x /docker-entrypoint.d/metadata.sh