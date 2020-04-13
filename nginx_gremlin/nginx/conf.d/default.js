function weightedSearch(obj) {
    var weights = Object.values(obj).reduce(function(a, b) { return a + b; }, 0);
    var random = Math.floor(Math.random() * weights)
    for (var i = 0; i < Object.keys(obj).length; i++){
        random -= Object.values(obj)[i];
        if (random < 0) {
            return Object.keys(obj)[i];
        }
    }
}

function mathRange(min,max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function delayHandler(delayTime,obj){
    if (delayTime > 0) {
        setTimeout(
            function(){
                obj;
            },
            delayTime
        );
    } else {
        obj;
    }
}

// This function checks if the incoming request should be delayed based on the provided Env Variables
function mainGremlinPhaseOne(s) {
    var delayTime = 0;
    var delayRatio = Number(s.variables.UPSTREAM_DELAY_RATIO);
    if (delayRatio > 100){
        s.error(`ERROR: UPSTREAM_DELAY_RATIO (${delayRatio}) is greater than 100`);
        s.deny();
    } else {
        var isDelayed =  JSON.parse(weightedSearch({true:delayRatio,false:100-delayRatio}));

        if (isDelayed) {
            var delayMin = Number(s.variables.UPSTREAM_DELAY_MIN_TIME);
            var delayMax = Number(s.variables.UPSTREAM_DELAY_MAX_TIME);

            if (delayMin >= delayMax) {
                s.error(`ERROR: UPSTREAM_DELAY_MIN_TIME (${delayMin}) is greater than or equal UPSTREAM_DELAY_MAX_TIME (${delayMax})`);
                s.deny();
            }
            delayTime = mathRange(delayMin,delayMax);
            s.log(`INFO: Delay Weighting -> {"min": ${delayMin}, "max": ${delayMax}}`)
            s.log(`INFO: UPSTREAM request was delayed for ${delayTime} miliseconds`)
        }
    }
    delayHandler(delayTime,s.done());
}

// This function checks if the outgoing response should be modified based on the provided Env Variables
function mainGremlinPhaseTwo(s) {
    s.on('upload', function (data, flags) {
        if (!flags.last) {
            var responseDrp = Number(s.variables.UPSTREAM_RESPONSE_DRP_WEIGHT);
            var response2XX = Number(s.variables.UPSTREAM_RESPONSE_2XX_WEIGHT);
            var response3XX = Number(s.variables.UPSTREAM_RESPONSE_3XX_WEIGHT);
            var response4XX = Number(s.variables.UPSTREAM_RESPONSE_4XX_WEIGHT);
            var response5XX = Number(s.variables.UPSTREAM_RESPONSE_5XX_WEIGHT);

            // Redirect Response is not currently implemented so ignoring the value
            var responseWeighting = {
                "drop": responseDrp,
                "valid": response2XX,
                // "redirect": response3XX,
                "noAuth": response4XX,
                "error": response5XX
            }
            s.log(`INFO: Response Weighting -> ${JSON.stringify(responseWeighting)}`)

            var weightedResponse = weightedSearch(responseWeighting);
            s.log(`INFO: Selected response -> ${weightedResponse}`)

            switch (weightedResponse) {
                case "drop":
                    s.deny();
                    s.off('upload');
                    break;
                case "noAuth":
                    s.send("GET /error/401 HTTP/1.1\r\nHost: 127.5.5.5:8888\r\n\r\n");
                    break;
                case "error":
                    s.send("GET /error/500 HTTP/1.1\r\nHost: 127.5.5.5:8888\r\n\r\n");
                    break;
                default:
                    s.send(data);
            }
        }
    })
}
