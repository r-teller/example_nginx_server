var fs = require('fs');
var responseB64 = JSON.parse(fs.readFileSync('/etc/nginx/conf.d/b64blobs.json'));


function readStateHandler(file) {
    try {
        return JSON.parse(fs.readFileSync(file));
    } catch (e) {
        return {};
    }
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

function mathRange(min,max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function delayHandler(obj,json){
    if (json.response.addedDelay.status == "ENABLED") {
        var timer = mathRange(json.response.addedDelay.min,json.response.addedDelay.max);
        var today = new Date();
        json.response.addedDelay.timeStamp = today.toISOString();
        json.response.addedDelay.actual = timer;
        setTimeout(
            function(){
                obj.return(json.response.statusCode, JSON.stringify(json) + '\n');
            },
            timer
        );
    } else {
        obj.return(json.response.statusCode, JSON.stringify(json) + '\n');
    }
}

function echo(r) {
    var _headers = {};
    for (var h in r.headersIn) {
        _headers[h] = r.headersIn[h];
    }

    var _args = {}
    for (var a in r.args) {
        _args[a] = r.args[a];
    }

    var _responseBody = {
        request: {
            uri: {},
            network: {},
            ssl: {},
            session: {}
        },
        environment: {},
        response: {
            addedDelay: {}
        }
    };

    _responseBody.request.uri.headers =  Object.keys(_headers).length ? _headers : undefined;
    _responseBody.request.uri.method = r.variables.request_method;
    _responseBody.request.uri.scheme = r.variables.scheme;
    _responseBody.request.uri.path = r.uri;
    _responseBody.request.uri.fullPath = r.variables.request_uri;
    _responseBody.request.uri.queryString = Object.keys(_args).length ? _args : undefined;
    _responseBody.request.uri.body = r.requestBody != 'undefined' ? r.requestBody : undefined;

    _responseBody.environment.machineName = r.variables.hostname;

    _responseBody.request.network.clientPort = r.variables.remote_port;
    _responseBody.request.network.clientAddress = r.variables.remote_addr;
    _responseBody.request.network.serverAddress = r.variables.server_addr;
    _responseBody.request.network.serverPort = r.variables.server_port;

    _responseBody.request.ssl.isHttps = r.variables.Https != 'undefined' && r.variables.Https == 'on' ? true : false;
    _responseBody.request.ssl.sslProtocol = r.variables.sslProtocol != 'undefined' ? r.variables.ssl_protocol : undefined;
    _responseBody.request.ssl.sslCipher = r.variables.sslCipher != 'undefined' ? r.variables.ssl_cipher : undefined;

    _responseBody.request.session.httpConnection = r.variables.http_connection;
    _responseBody.request.session.requestId = r.variables.request_id;
    _responseBody.request.session.connection = r.variables.connection;
    _responseBody.request.session.connectionNumber = r.variables.connection_requests;
    
    // Default response values
    _responseBody.response.statusCode = 200;
    _responseBody.response.statusReason = 'DEFAULT';
    _responseBody.response.statusBody = 'HEALTHY';
    _responseBody.response.addedDelay.status = 'DISABLED';
    _responseBody.response.body = 'Default Body';

    // Check if response body payload should be updated
    switch (true) {
        case ((/.js$|.json$/i).test(r.uri)):
            var _fileSizeWeight = {
                "1k": 50,
                "2k": 40,
                "3k": 30,
                "4k": 20,
                "5k": 10
            };
            var _responseB64 =  responseB64["1kb-file"];
            _responseBody.response.bodySize = weightedSearch(_fileSizeWeight);
            switch (_responseBody.response.bodySize) {
                case "1k":
                    _responseBody.response.body = _responseB64;
                    break;
                case "2k":
                    _responseBody.response.body = _responseB64+_responseB64;
                    break;
                case "3k":
                    _responseBody.response.body = _responseB64+_responseB64+_responseB64;
                    break;
                case "4k":
                    _responseBody.response.body = _responseB64+_responseB64+_responseB64+_responseB64;
                    break;
                case "5k":
                    _responseBody.response.body = _responseB64+_responseB64+_responseB64+_responseB64+_responseB64;
                    break;
            }
            break;
        case ((/.jpeg$|.jpg$|.png$|.gif$/i).test(r.uri)):
            var _fileSizeWeight = {
                "10k": 50,
                "20k": 40,
                "30k": 30,
                "40k": 20,
                "50k": 10
            };
            var _responseB64 =  responseB64["10kb-file"];
            _responseBody.response.bodySize = weightedSearch(_fileSizeWeight);
            switch (_responseBody.response.bodySize) {
                case "10k":
                    _responseBody.response.body = _responseB64;
                    break;
                case "20k":
                    _responseBody.response.body = _responseB64+_responseB64;
                    break;
                case "30k":
                    _responseBody.response.body = _responseB64+_responseB64+_responseB64;
                    break;
                case "40k":
                    _responseBody.response.body = _responseB64+_responseB64+_responseB64+_responseB64;
                    break;
                case "50k":
                    _responseBody.response.body = _responseB64+_responseB64+_responseB64+_responseB64+_responseB64;
                    break;
            }

            break;
        default:
            break;
    }

    // Check if response should be delayed
    switch (true) {
        case ( (/^[-+]?\d*$/i).test(r.variables.http_delay_min) && (/^[-+]?\d*$/i).test(r.variables.http_delay_max)):
            if (r.variables.http_delay_min < r.variables.http_delay_max) {
                _responseBody.response.addedDelay.status = 'ENABLED';
                _responseBody.response.addedDelay.min = r.variables.http_delay_min;
                _responseBody.response.addedDelay.max = r.variables.http_delay_max;
            }
        case ( (/^[0-9][0-1][0-9][0-9]$/i).test(r.variables.server_port) && (r.args.delay == undefined)):
            // Do not introduce delay for ports in the X000 or X1000 port range
            break;
        case ( (/^[4,8][2][0-9][0-9]$/i).test(r.variables.server_port) || (r.args.delay != undefined && (/^2[0-9]{2}$/i).test(r.args.delay)) ):
            _responseBody.response.addedDelay.status = 'ENABLED';
            _responseBody.response.addedDelay.min = 100;
            _responseBody.response.addedDelay.max = 200;
            break;
        case ( (/^[4,8][3][0-9][0-9]$/i).test(r.variables.server_port) || (r.args.delay != undefined && (/^3[0-9]{2}$/i).test(r.args.delay))):
            _responseBody.response.addedDelay.status = 'ENABLED';
            _responseBody.response.addedDelay.min = 200;
            _responseBody.response.addedDelay.max = 300;
            break;
        case ( (/^[4,8][4][0-9][0-9]$/i).test(r.variables.server_port) || (r.args.delay != undefined && (/^4[0-9]{2}$/i).test(r.args.delay))):
            _responseBody.response.addedDelay.status = 'ENABLED';
            _responseBody.response.addedDelay.min = 300;
            _responseBody.response.addedDelay.max = 400;
            break;
        case ( (/^[4,8][5][0-9][0-9]$/i).test(r.variables.server_port) || (r.args.delay != undefined && (/^5[0-9]{2}$/i).test(r.args.delay))):
            _responseBody.response.addedDelay.status = 'ENABLED';
            _responseBody.response.addedDelay.min = 400;
            _responseBody.response.addedDelay.max = 500;
            break;
        case ( (/^[4,8][6][0-9][0-9]$/i).test(r.variables.server_port) || (r.args.delay != undefined && (/^6[0-9]{2}$/i).test(r.args.delay))):
            _responseBody.response.addedDelay.status = 'ENABLED';
            _responseBody.response.addedDelay.min = 500;
            _responseBody.response.addedDelay.max = 600;
            break;
        case ( (/^[4,8][7][0-9][0-9]$/i).test(r.variables.server_port) || (r.args.delay != undefined && (/^7[0-9]{2}$/i).test(r.args.delay))):
            _responseBody.response.addedDelay.status = 'ENABLED';
            _responseBody.response.addedDelay.min = 600;
            _responseBody.response.addedDelay.max = 700;
            break;
        case ( (/^[4,8][8][0-9][0-9]$/i).test(r.variables.server_port) || (r.args.delay != undefined && (/^8[0-9]{2}$/i).test(r.args.delay))):
            _responseBody.response.addedDelay.status = 'ENABLED';
            _responseBody.response.addedDelay.min = 700;
            _responseBody.response.addedDelay.max = 800;
            break;
        case ( (/^[4,8][9][0-9][0-9]$/i).test(r.variables.server_port) || (r.args.delay != undefined && (/^9[0-9]{2}$/i).test(r.args.delay))):
            _responseBody.response.addedDelay.status = 'ENABLED';
            _responseBody.response.addedDelay.min = 1000;
            _responseBody.response.addedDelay.max = 10000;
            break;
        default:
            break;
    }

    switch (true) {
        case (r.variables.server_port >= 5000 && r.variables.server_port < 6000):
            // Captures requests recieved on TCP port 5000-5999
            _responseBody.response.statusCode = 500;
            _responseBody.response.statusReason = 'UNHEALTHY_SERVER_PORT_RANGE';
            _responseBody.response.statusBody = 'UNHEALTHY';
            break;
        case (r.variables.server_port >= 6000 && r.variables.server_port < 7000):
            var _randomFailRate = 50;
            // Checks if randomFailRate status param was provided and that it is between 0 and 100, if not assume the rate of failure should be 50%
            if (r.args.randomFailRate != undefined && (/^[0-9]$|^[1-9][0-9]$|^(100)$/i).test(r.args.randomFailRate)) {
                _randomFailRate = Number(r.args.randomFailRate);
            }

            // Captures requests recieved on TCP port 6000-6999
            _responseBody.response.statusReason = 'RANDOM_SERVER_PORT_RANGE';
            var _isHealthy = JSON.parse(weightedSearch({false:_randomFailRate,true:100-_randomFailRate}));
            if (_isHealthy) {
                _responseBody.response.statusCode = 200;
                _responseBody.response.statusBody = 'HEALTHY';
            } else {
                _responseBody.response.statusCode = 500;
                _responseBody.response.statusBody = 'UNHEALTHY';
            }

            break;
        case (r.args.status != undefined):
            // Captures requests that have Status Query param defined and that aren't coming in on the 5K or 6K port range
            switch (true) {
                case ((/^2[0-9]{2}$/i).test(r.args.status)):
                    // Regex test to see if Status Query param is between 200-299
                    _responseBody.response.statusReason = 'QUERY_PARAM';
                    _responseBody.response.statusBody = 'HEALTHY';
                    _responseBody.response.statusCode = Number(r.args.status);
                    break;
                case ((/^3[0-9]{2}$/i).test(r.args.status)):
                    // Regex test to see if Status Query param is between 300-399
                    _responseBody.response.statusReason = 'QUERY_PARAM';
                    _responseBody.response.statusBody = 'REDIRECT';
                    _responseBody.response.statusCode = Number(r.args.status);
                    break;
                case ((/^4[0-9]{2}$/i).test(r.args.status)):
                    // Regex test to see if Status Query param is between 400-499
                    _responseBody.response.statusReason = 'QUERY_PARAM';
                    _responseBody.response.statusBody = 'UNAUTHORIZED';
                    _responseBody.response.statusCode = Number(r.args.status);
                    break;
                case ((/^5[0-9]{2}$/i).test(r.args.status)):
                    // Regex test to see if Status Query param is between 500-599
                    _responseBody.response.statusReason = 'QUERY_PARAM';
                    _responseBody.response.statusBody = 'UNHEALTHY';
                    _responseBody.response.statusCode = Number(r.args.status);
                    break;
                default:
                    _responseBody.response.statusReason = 'QUERY_PARAM';
                    _responseBody.response.statusBody = 'UNKNOWN_QUERY_PARAM - ' + r.args.status;
                    break;
            }
            break;
        default:
            // Captures everything else
            break;
    }

    _responseBody.response.timeStamp = r.variables.time_iso8601;
    delayHandler(r,_responseBody);
}