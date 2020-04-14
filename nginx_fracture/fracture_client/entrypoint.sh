#!/bin/sh
if [ -z "${wrkEndpoint}" ]; then
    echo "ERROR: Environment variable wrkEndpoint was not defined" >> /dev/stderr
    exit 1
fi

while true
do
    # Time offset, hours. Positive values only. Good values are 1, 9, 17
    OFFSET=1

    echo "Started: $(date)\r\n" >> /dev/stdout
    s=$(((`date +%s -d "now + $OFFSET hour"`) % 86400))
    s=`echo "$s/86400" | bc -l`

    a=0.4 # width - Width GE 1 provides deminishing returns for graphing
    b=2 # Slope
    c=0.2 # Constant - Constant GE 1 flattens the graph
    max=30
    min=5

    variation=$(((`date +%s`) % 3600))
    variation=`echo "1+0.5*s($variation/90)" | bc -l`

    value=`echo "define abs(x) {if (x<0) {return -x}; return x;} $min + $max * $variation / (1 +(abs($c-$s)/$a)^(2*$b))" | bc -l`

    sin=`echo "define abs(x) {if (x<0) {return -x}; return x;} abs( s($value) * (s($value*$c)))*100" | bc -l`
    intvalue=${sin%.*}
    echo "Variation Value => ${intvalue}" >> /dev/stdout
    if [ ! -z "${wrkScript}" ]; then
        if [ -f "${wrkScript}" ]; then
            /usr/local/bin/wrk -t1 -c$((3 * $intvalue)) -s ${wrkScript}  -d20s ${wrkEndpoint} >> /dev/stdout
        else
            echo "ERROR: Environment variable wrkScript was defined but does not exist at ${wrkScript}" >> /dev/stderr
            exit 1
        fi
    else
        /usr/local/bin/wrk -t1 -c$((3 * $intvalue)) -d20s ${wrkEndpoint} >> /dev/stdout
    fi
    echo "\r\nSleeping: $(date)\r\n" >> /dev/stdout
    sleep 10
done
