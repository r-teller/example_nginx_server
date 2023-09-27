function weightedSearch(obj) {
    var weights = Object.values(obj).reduce(function (a, b) { return a + b; }, 0);
    var random = Math.floor(Math.random() * weights)
    for (var i = 0; i < Object.keys(obj).length; i++) {
        random -= Object.values(obj)[i];
        if (random < 0) {
            return Object.keys(obj)[i];
        }
    }
}

function mathRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function generateHTML(jsonData) {
    return '<html><head> <title>NGINX Echo Response</title> <link rel="stylesheet" href="./index.css"> <script src="./index.js"></script></head><body> <div class="text-center"> <h1 class="text-center mb-5">Response Echo</h1> <div id="tableContainer"></div></div><script> var jsonData = ' + jsonData + ';renterTable( jsonData ) </script></body></html>';
}

function delayHandler(obj, jsonData, type) {
    if (jsonData.response.addedDelay.status == "ENABLED") {
        var timer = mathRange(jsonData.response.addedDelay.min, jsonData.response.addedDelay.max);
        var today = new Date();
        jsonData.response.addedDelay.timeStamp = today.toISOString();
        jsonData.response.addedDelay.actual = timer;
        var jsonString = JSON.stringify(jsonData);
        setTimeout(
            function () {
                switch (type) {
                    case "json":
                        obj.return(jsonData.response.statusCode, jsonString + '\n');
                        break;
                    case "html":
                        obj.return(jsonData.response.statusCode, generateHTML(jsonString) + '\n');
                        break;
                    default:
                        obj.return(jsonData.response.statusCode, jsonString + '\n');
                        break;
                }
            },
            timer
        );
    } else {
        var jsonString = JSON.stringify(jsonData);
        switch (type) {
            case "json":
                obj.return(jsonData.response.statusCode, jsonString + '\n');
                break;
            case "html":
                obj.return(jsonData.response.statusCode, generateHTML(jsonString) + '\n');
                break;
            default:
                obj.return(jsonData.response.statusCode, jsonString + '\n');
                break;
        }
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
        environment: {
            metaData: {}
        },
        response: {
            addedDelay: {}
        }
    };

    _responseBody.request.uri.headers = Object.keys(_headers).length ? _headers : undefined;
    _responseBody.request.uri.method = r.variables.request_method;
    _responseBody.request.uri.scheme = r.variables.scheme;
    _responseBody.request.uri.path = r.uri;
    _responseBody.request.uri.fullPath = r.variables.request_uri;
    _responseBody.request.uri.queryString = Object.keys(_args).length ? _args : undefined;
    _responseBody.request.uri.body = r.requestBody != 'undefined' ? r.requestBody : undefined;

    _responseBody.environment.hostname = r.variables.hostname;

    if (typeof (metadata) != 'undefined' && metadata.instance != undefined) {
        _responseBody.environment.metaData.zone = metadata.instance.zone != undefined ? metadata.instance.zone.split("/").slice(-1)[0] : undefined;
        _responseBody.environment.metaData.image = metadata.instance.image != undefined ? metadata.instance.image.split("/").slice(-1)[0] : undefined;
        _responseBody.environment.metaData.region = metadata.instance.zone != undefined ? metadata.instance.zone.split("/").slice(-1)[0].slice(0, -2) : undefined;
        _responseBody.environment.metaData.tags = metadata.instance.tags != undefined ? metadata.project.tags : undefined;
        _responseBody.environment.metaData.machineName = metadata.instance.name != undefined ? metadata.instance.name : undefined;
        _responseBody.environment.metaData.instanceId = metadata.instance.id != undefined ? metadata.instance.id : undefined;
        _responseBody.environment.metaData.machineType = metadata.instance.machineType != undefined ? metadata.instance.machineType.split("/").slice(-1)[0] : undefined;

        if (metadata.kubernetes != undefined) {
            _responseBody.environment.metaData.serviceName = metadata.kubernetes.service != undefined ? metadata.kubernetes.service : undefined;
            _responseBody.environment.metaData.revision = metadata.kubernetes.revision != undefined ? metadata.kubernetes.revision : undefined;
        }

        _responseBody.environment.metaData.projectId = metadata.project.projectId != undefined ? metadata.project.projectId : undefined;

        if (metadata.instance.attributes != undefined) {
            _responseBody.environment.metaData.clusterName = metadata.instance.attributes['cluster-name'] != undefined ? metadata.instance.attributes['cluster-name'] : undefined;
            _responseBody.environment.metaData.clusterUID = metadata.instance.attributes['cluster-uid'] != undefined ? metadata.instance.attributes['cluster-uid'] : undefined;
        }

        if (metadata.environment != undefined) {
            _responseBody.environment.variables = metadata.environment;
        }

        // Uncomment when debugging
        // _responseBody.environment.fullMetaData = metadata
    }

    _responseBody.request.network.clientPort = r.variables.remote_port;
    _responseBody.request.network.clientAddress = r.variables.remote_addr;
    _responseBody.request.network.serverPort = r.variables.server_port;
    _responseBody.request.network.serverAddress = r.variables.server_addr;

    _responseBody.request.ssl.isHttps = r.variables.Https != 'undefined' && r.variables.Https == 'on' ? true : false;
    _responseBody.request.ssl.sslProtocol = r.variables.sslProtocol != 'undefined' ? r.variables.ssl_protocol : undefined;
    _responseBody.request.ssl.sslCipher = r.variables.sslCipher != 'undefined' ? r.variables.ssl_cipher : undefined;

    _responseBody.request.session.httpConnection = r.variables.http_connection;
    _responseBody.request.session.requestId = r.variables.request_id;
    _responseBody.request.session.connection = r.variables.connection;
    _responseBody.request.session.connectionNumber = r.variables.connection_requests;
    _responseBody.request.session.connectionsActive = r.variables.connections_active;
    _responseBody.request.session.connectionsWaiting = r.variables.connections_waiting;

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
            var _responseB64 = b64blobs["1kb-file"];
            _responseBody.response.bodySize = weightedSearch(_fileSizeWeight);
            switch (_responseBody.response.bodySize) {
                case "1k":
                    _responseBody.response.body = _responseB64;
                    break;
                case "2k":
                    _responseBody.response.body = _responseB64 + _responseB64;
                    break;
                case "3k":
                    _responseBody.response.body = _responseB64 + _responseB64 + _responseB64;
                    break;
                case "4k":
                    _responseBody.response.body = _responseB64 + _responseB64 + _responseB64 + _responseB64;
                    break;
                case "5k":
                    _responseBody.response.body = _responseB64 + _responseB64 + _responseB64 + _responseB64 + _responseB64;
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
            var _responseB64 = b64blobs["10kb-file"];
            _responseBody.response.bodySize = weightedSearch(_fileSizeWeight);
            switch (_responseBody.response.bodySize) {
                case "10k":
                    _responseBody.response.body = _responseB64;
                    break;
                case "20k":
                    _responseBody.response.body = _responseB64 + _responseB64;
                    break;
                case "30k":
                    _responseBody.response.body = _responseB64 + _responseB64 + _responseB64;
                    break;
                case "40k":
                    _responseBody.response.body = _responseB64 + _responseB64 + _responseB64 + _responseB64;
                    break;
                case "50k":
                    _responseBody.response.body = _responseB64 + _responseB64 + _responseB64 + _responseB64 + _responseB64;
                    break;
            }

            break;
        default:
            break;
    }

    // Check if response should be delayed
    switch (true) {
        case ((/^[-+]?\d*$/i).test(r.variables.http_delay_min) && (/^[-+]?\d*$/i).test(r.variables.http_delay_max)):
            if (r.variables.http_delay_min < r.variables.http_delay_max) {
                _responseBody.response.addedDelay.status = 'ENABLED';
                _responseBody.response.addedDelay.min = r.variables.http_delay_min;
                _responseBody.response.addedDelay.max = r.variables.http_delay_max;
            }
        case ((/^[0-9][0-1][0-9][0-9]$/i).test(r.variables.server_port) && (r.args.delay == undefined)):
            // Do not introduce delay for ports in the X000 or X1000 port range
            break;
        case ((/^[4,8][2][0-9][0-9]$/i).test(r.variables.server_port) || (r.args.delay != undefined && (/^2[0-9]{2}$/i).test(r.args.delay))):
            _responseBody.response.addedDelay.status = 'ENABLED';
            _responseBody.response.addedDelay.min = 100;
            _responseBody.response.addedDelay.max = 200;
            break;
        case ((/^[4,8][3][0-9][0-9]$/i).test(r.variables.server_port) || (r.args.delay != undefined && (/^3[0-9]{2}$/i).test(r.args.delay))):
            _responseBody.response.addedDelay.status = 'ENABLED';
            _responseBody.response.addedDelay.min = 200;
            _responseBody.response.addedDelay.max = 300;
            break;
        case ((/^[4,8][4][0-9][0-9]$/i).test(r.variables.server_port) || (r.args.delay != undefined && (/^4[0-9]{2}$/i).test(r.args.delay))):
            _responseBody.response.addedDelay.status = 'ENABLED';
            _responseBody.response.addedDelay.min = 300;
            _responseBody.response.addedDelay.max = 400;
            break;
        case ((/^[4,8][5][0-9][0-9]$/i).test(r.variables.server_port) || (r.args.delay != undefined && (/^5[0-9]{2}$/i).test(r.args.delay))):
            _responseBody.response.addedDelay.status = 'ENABLED';
            _responseBody.response.addedDelay.min = 400;
            _responseBody.response.addedDelay.max = 500;
            break;
        case ((/^[4,8][6][0-9][0-9]$/i).test(r.variables.server_port) || (r.args.delay != undefined && (/^6[0-9]{2}$/i).test(r.args.delay))):
            _responseBody.response.addedDelay.status = 'ENABLED';
            _responseBody.response.addedDelay.min = 500;
            _responseBody.response.addedDelay.max = 600;
            break;
        case ((/^[4,8][7][0-9][0-9]$/i).test(r.variables.server_port) || (r.args.delay != undefined && (/^7[0-9]{2}$/i).test(r.args.delay))):
            _responseBody.response.addedDelay.status = 'ENABLED';
            _responseBody.response.addedDelay.min = 600;
            _responseBody.response.addedDelay.max = 700;
            break;
        case ((/^[4,8][8][0-9][0-9]$/i).test(r.variables.server_port) || (r.args.delay != undefined && (/^8[0-9]{2}$/i).test(r.args.delay))):
            _responseBody.response.addedDelay.status = 'ENABLED';
            _responseBody.response.addedDelay.min = 700;
            _responseBody.response.addedDelay.max = 800;
            break;
        case ((/^[4,8][9][0-9][0-9]$/i).test(r.variables.server_port) || (r.args.delay != undefined && (/^9[0-9]{2}$/i).test(r.args.delay))):
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
            var _isHealthy = JSON.parse(weightedSearch({ false: _randomFailRate, true: 100 - _randomFailRate }));
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
    return _responseBody
}

function echoJSON(r) {
    let jsonData = echo(r);
    delayHandler(r, jsonData, "json");
}

function echoHTML(r) {
    let jsonData = echo(r);
    delayHandler(r, jsonData, "html");
}

export default { echoHTML, echoJSON };
