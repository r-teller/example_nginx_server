function echo(r) {
    var _headers = {};
    for (var h in r.headersIn) {
        _headers[h] = r.headersIn[h];
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

    _responseBody.request.uri.headers = _headers;
    _responseBody.request.uri.method = r.variables.request_method;
    _responseBody.request.uri.schme = r.variables.scheme;
    _responseBody.request.uri.path = r.uri;
    _responseBody.request.uri.fullPath = r.variables.request_uri;
    _responseBody.request.uri.queryString = Object.keys(r.args).length ? r.args : null;
    _responseBody.request.uri.body = r.requestBody != 'undefined' ? r.requestBody : null;


    _responseBody.request.network.clientPort = r.variables.remote_port;
    _responseBody.request.network.clientAddress = r.variables.remote_addr;
    _responseBody.request.network.serverAddress = r.variables.server_addr;
    _responseBody.request.network.serverPort = r.variables.server_port;

    _responseBody.request.ssl.isHttps = r.variables.Https != 'undefined' && r.variables == 'on' ? true : false;
    _responseBody.request.ssl.sslProtocol = r.variables.isHttps != 'undefined' ? r.variables.ssl_protocol : null;
    _responseBody.request.ssl.sslCipher = r.variables.isHttps != 'undefined' ? r.variables.ssl_cipher : null;

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
        case (r.args.status != undefined && typeof(r.args.status) == number):
            // Captures requests recieved on TCP port 6000-6999
            _responseBody.response.statusCode = r.args.status;
            switch (true) {
                case (r.args.status >= 200 && r.args.status < 299):
                    _responseBody.response.statusReason = 'QUERY_PARAM';
                    _responseBody.response.statusBody = 'HEALTHY';
                    break;
                case (r.args.status >= 300 && r.args.status < 399):
                    _responseBody.response.statusReason = 'QUERY_PARAM';
                    _responseBody.response.statusBody = 'REDIRECT';
                    break;
                case (r.args.status >= 400 && r.args.status < 499):
                    _responseBody.response.statusReason = 'QUERY_PARAM';
                    _responseBody.response.statusBody = 'UNAUTHORIZED';
                    break;
                case (r.args.status >= 500 && r.args.status < 599):
                    _responseBody.response.statusReason = 'QUERY_PARAM';
                    _responseBody.response.statusBody = 'UNHEALTHY';
                    break;
                default:
                    _responseBody.response.statusReason = 'QUERY_PARAM';
                    _responseBody.response.statusBody = 'UNKNOWN_QUERY_PARAM';
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