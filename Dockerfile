FROM nginx

RUN apt-get update
RUN apt-get install curl wget vim

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/ssl/* /etc/nginx/
