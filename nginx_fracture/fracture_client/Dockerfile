FROM ubuntu
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update
RUN apt-get install curl wget vim jq build-essential libssl-dev git zlib1g-dev -y
RUN mkdir -p /var/tmp/wrk2
RUN git clone git clone https://github.com/giltene/wrk2.git /var/tmp/wrk2
RUN cd /var/tmp/wrk2
RUN make
RUN cp /var/tmp/wrk2/wrk /usr/local/bin

RUN apt-get clean


COPY ./entrypoint.sh /usr/local/bin/
COPY ./wrk/* /usr/local/bin/

WORKDIR /usr/local/bin/

ENTRYPOINT [ "entrypoint.sh" ]