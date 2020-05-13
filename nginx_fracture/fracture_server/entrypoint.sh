#!/bin/sh
rm -f /var/run/httpSocket.sock /var/run/httpsSocket.sock
envsubst "$(env | sed -e 's/=.*//' -e 's/^/\$/g')" < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'
