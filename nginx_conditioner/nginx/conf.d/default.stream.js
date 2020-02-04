var fs = require('fs')
var responseFileLocation = '/etc/nginx/'
var responseFileName = 'responseState.json'

var o_delay = {
    "min": 1,
    "max": 3000,
    "weight": 25,
    "increased_weight_min": 10,
    "increased_weight_max": 25,
    "repeate_weight": 25,
    "expected_probablity": 1,
    "trueup_percent": 5
};

var o_drop = {
    "weight": 2,
    "increased_weight_min": 25,
    "increased_weight_max": 50,
    "repeate_weight": 15,
    "expected_probablity": 1,
    "trueup_percent": 5
};

var o_error = {
    "codes": {400:1,401:1,403:1,404:1,405:1,429:1,500:1,502:1,503:1,504:1},
    "weight": 20,
    "increased_weight_min": 30,
    "increased_weight_max": 70,
    "repeate_weight": 15,
    "expected_probablity": 1,
    "trueup_percent": 5
};

var o_valid = {
    "weight": 70
}

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

function readStateHandler(file) {
    try {
        return JSON.parse(fs.readFileSync(file));
    } catch (e) {
        return {};
    }
}

function writeStateHandler(file,json) {
    try {
        fs.writeFileSync(file,JSON.stringify(json));
    } catch (e) {
        return e;
    }
}

function mathRange(min,max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function delayHandler(delayed,obj){
    if (delayed == "true") {
        var timer = mathRange(o_delay.min,o_delay.max);
        setTimeout(
            function(){
                obj;
            },
            timer
        );
    } else {
        obj;
    }
}

function delayCheck(s) {
    s.on('upload', function (data, flags) {
        var n = data.indexOf('\n');
        if (n != -1) {
            var responseState = readStateHandler(responseFileLocation+s.variables.pid+'_'+responseFileName);

            if (responseState.delay == undefined) {
                responseState.delay = {};
            }

            if (responseState.lastActionDelay == "true"){
                o_delay.weight += mathRange(o_delay.increased_weight_min,o_delay.increased_weight_max);
            }

            var delayed = weightedSearch({true:o_delay.weight,false:100-o_delay.weight});
            responseState.lastActionDelay = delayed;

            if (delayed == 'true') {
                if (responseState.delay.true > 0) {
                    responseState.delay.true = responseState.delay.true + 1;
                } else {
                    responseState.delay.true = 1;
                }
            } else {
                if (responseState.delay.false > 0) {
                    responseState.delay.false = responseState.delay.false + 1;
                } else {
                    responseState.delay.false = 1;
                }
            }
            writeStateHandler(responseFileLocation+s.variables.pid+'_'+responseFileName,responseState);
            delayHandler(delayed,s.done());
            // s.done();
        }
    })
}

function praseHeader(data,s){
    var o_data = data.split('\r\n');
    var a_data_1 = o_data[0].split(' ');
    var request = {}
    request.method = a_data_1[0];
    request.url = a_data_1[1];
    request.version = a_data_1[2];
    request.headers = {};
    for (var i=1;i<o_data.indexOf('');i++) {
        var header = o_data[i].split(':');
        if (header[2]) {
            request.headers[header[0]] = header[1].trim()+':'+header[2];
        } else {
            request.headers[header[0]] = header[1].trim();
        }

    }

    return request;
}

function streamStart(s){
    s.on('upload', function (data, flags) {
        if (!flags.last) {
            var responseState = readStateHandler(responseFileLocation+s.variables.pid+'_'+responseFileName);
            var request = praseHeader(data,s);
            var currentRequest = request.headers.Host+request.url;
            var lastRequest = responseState.lastRequest;
            var o_request = {};

            switch(responseState.lastAction) {
                case "drop":
                    o_drop.weight += mathRange(o_drop.increased_weight_min,o_drop.increased_weight_max);
                    if (currentRequest === lastRequest) o_drop.weight += o_drop.repeate_weight;
                    break;
                case "error":
                    o_error.weight += mathRange(o_error.increased_weight_min,o_error.increased_weight_max);
                    if (currentRequest === lastRequest) o_error.weight += o_error.repeate_weight;
                    break;
                default:
            }

            o_request = {
                "drop": o_drop.weight,
                "error": o_error.weight,
                "valid": o_valid.weight
            }

            o_request.result = weightedSearch(o_request);

            responseState.lastRequest = currentRequest;

            switch (o_request.result) {
                case "drop":
                    if (responseState.drop == undefined) {
                        responseState.drop = {};
                    }

                    if (responseState.drop.count > 0) {
                        responseState.drop.count = responseState.drop.count + 1;
                    } else {
                        responseState.drop.count = 1;
                    }

                    responseState.lastAction = "drop";
                    responseState.drop.lastRequest = currentRequest;
                    writeStateHandler(responseFileLocation+s.variables.pid+'_'+responseFileName, responseState);
                    s.deny();
                    // s.off('upload');
                    break;
                case "error":
                    if (responseState.error == undefined) {
                        responseState.error = {};
                    }
                    if (responseState.error.codes == undefined) {
                        responseState.error.codes = {};
                    }

                    if (responseState.error.count > 0) {
                        responseState.error.count = responseState.error.count+1;
                    } else {
                        responseState.error.count = 1;
                    }


                    if (responseState.error.lastCode) {
                        o_error.codes[responseState.error.lastCode] = Object.keys(o_error.codes).length;
                    }
                    responseState.error.lastCode = weightedSearch(o_error.codes)

                    if (responseState.error.codes[responseState.error.lastCode] > 0) {
                        responseState.error.codes[responseState.error.lastCode] = responseState.error.codes[responseState.error.lastCode]+1;
                    } else {
                        responseState.error.codes[responseState.error.lastCode] = 1;
                    }

                    responseState.lastAction = "error";
                    responseState.error.lastRequest = currentRequest;
                    writeStateHandler(responseFileLocation+s.variables.pid+'_'+responseFileName, responseState);
                    s.send("GET /error/" + responseState.error.lastCode + " HTTP/1.1\r\nHost: 127.0.0.1:8828\r\n\r\n");
                    // s.off('upload');
                    break;
                default:
                    if (responseState.valid == undefined) {
                        responseState.valid = {};
                    }

                    if (responseState.valid.count > 0) {
                        responseState.valid.count = responseState.valid.count+1;
                    } else {
                        responseState.valid.count = 1;
                    }
                    responseState.lastAction = "valid";
                    responseState.valid.lastRequest = currentRequest;
                    writeStateHandler(responseFileLocation+s.variables.pid+'_'+responseFileName, responseState);
                    s.send(data)
                    // s.off('upload');
            }
        }
    });
}
