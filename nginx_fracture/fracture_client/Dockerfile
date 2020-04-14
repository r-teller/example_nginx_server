FROM ubuntu
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update
RUN apt-get install curl wget vim bc jq build-essential libssl-dev git zlib1g-dev -y

RUN mkdir -p /var/tmp/wrk2
RUN git clone https://github.com/giltene/wrk2.git /var/tmp/wrk2
RUN make -C /var/tmp/wrk2
RUN cp /var/tmp/wrk2/wrk /usr/local/bin/wrk2

RUN mkdir -p /var/tmp/wrk
RUN git clone https://github.com/wg/wrk.git /var/tmp/wrk
RUN make -C /var/tmp/wrk
RUN cp /var/tmp/wrk/wrk /usr/local/bin/wrk

RUN apt-get clean


COPY ./entrypoint.sh /usr/local/bin/
COPY ./wrk/* /usr/local/bin/

WORKDIR /usr/local/bin/

ENTRYPOINT [ "entrypoint.sh" ]