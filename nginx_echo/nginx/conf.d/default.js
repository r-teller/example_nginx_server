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
        response: {}
    };

    _responseBody.request.uri.headers =  Object.keys(_headers).length ? _headers : undefined;
    _responseBody.request.uri.method = r.variables.request_method;
    _responseBody.request.uri.scheme = r.variables.scheme;
    _responseBody.request.uri.path = r.uri;
    _responseBody.request.uri.fullPath = r.variables.request_uri;
    _responseBody.request.uri.queryString = Object.keys(_args).length ? _args : undefined;
    _responseBody.request.uri.body = r.requestBody != 'undefined' ? r.requestBody : undefined;


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

    switch (true) {
        case (r.variables.server_port >= 5000 && r.variables.server_port < 6000):
            // Captures requests recieved on TCP port 5000-5999
            _responseBody.response.statusCode = 500;
            _responseBody.response.statusReason = 'UNHEALTHY_SERVER_PORT_RANGE';
            _responseBody.response.statusBody = 'UNHEALTHY';
            break;
        case (r.variables.server_port >= 6000 && r.variables.server_port < 7000):
            // Captures requests recieved on TCP port 6000-6999
            _responseBody.response.statusReason = 'RANDOM_SERVER_PORT_RANGE';
            if (Math.floor(Math.random() * 2)) {
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

    r.return(_responseBody.response.statusCode, JSON.stringify(_responseBody) + '\n');
}