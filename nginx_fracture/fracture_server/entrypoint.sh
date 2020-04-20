#!/bin/sh
envsubst "$(env | sed -e 's/=.*//' -e 's/^/\$/g')" < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'
