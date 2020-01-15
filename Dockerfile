FROM nginx

RUN apt-get update
RUN apt-get install curl wget vim -y

RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf

COPY nginx/conf.d/default.conf /etc/nginx/conf.d/
COPY nginx/nginx.conf /etc/nginx/
COPY nginx/ssl/* /etc/nginx/

COPY test/run_docker_tests.sh /usr/local/bin
