#!/bin/sh
if [ -z "${wrkEndpoint}" ]; then
    echo "ERROR: Environment variable wrkEndpoint was not defined" >> /dev/stderr
    exit 1
fi

while true
do
    # Time offset, hours. Positive values only. Good values are 1, 9, 17
    if [ -z "${wrkOffset}" ]; then
        OFFSET=1
    else
        OFFSET=${wrkOffset}
    fi

    echo "Started: $(date) with OFFSET of ${OFFSET}\r\n" >> /dev/stdout
    offset=$(((`date +%s -d "now + $OFFSET hour"`) % 86400))
    offsetReduced=`echo "$offset/86400" | bc -l`

    a=0.4 # width - Width GE 1 provides deminishing returns for graphing
    b=2 # Slope
    c=0.2 # Constant - Constant GE 1 flattens the graph
    max=30
    min=5

    variation=$(((`date +%s`) % 3600))
    variationReduced=`echo "1+0.5*s($variation/90)" | bc -l`

    value=`echo "define abs(x) {if (x<0) {return -x}; return x;} $min + $max * $variationReduced / (1 +(abs($c-$offsetReduced)/$a)^(2*$b))" | bc -l`

    sin=`echo "define abs(x) {if (x<0) {return -x}; return x;} 3 * (abs( s($value) * (s($value*$c)))*100)" | bc -l`

    intvalue=${sin%.*}

    echo "Offset Value => ${offset} - ${offsetReduced}" >> /dev/stdout
    echo "Variation Value => ${variation} - ${variationReduced}" >> /dev/stdout
    echo "Interval Value => ${intvalue}\r\n" >> /dev/stdout
    if [ ! -z "${wrkScript}" ]; then
        if [ -f "${wrkScript}" ]; then
            /usr/local/bin/wrk -t1 -c ${intvalue} -s ${wrkScript}  -d20s ${wrkEndpoint} >> /dev/stdout
        else
            echo "ERROR: Environment variable wrkScript was defined but does not exist at ${wrkScript}" >> /dev/stderr
            exit 1
        fi
    else
        /usr/local/bin/wrk -t1 -c ${intvalue} -d20s ${wrkEndpoint} >> /dev/stdout
    fi
    echo "Sleeping: $(date)\r\n" >> /dev/stdout
    sleep 10
done
