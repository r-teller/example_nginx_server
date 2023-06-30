Install steps for nginx and nginx-js can be found here --> http://nginx.org/en/linux_packages.html


# GCE Instance Startup
`
STARTUP_SCRIPT_URL=`curl -sH "Metadata-Flavor: Google" -o /tmp/metadata.json "http://metadata.google.internal/computeMetadata/v1/?recursive=true"`
`