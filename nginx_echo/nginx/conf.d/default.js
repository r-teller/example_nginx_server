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

    _responseBody.request.ssl.isHttps = r.variables.isHttps;
    _responseBody.request.ssl.sslProtocol = r.variables.isHttps != 'undefined' ? r.variables.ssl_protocol : null;
    _responseBody.request.ssl.sslCipher = r.variables.isHttps != 'undefined' ? r.variables.ssl_cipher : null;

    _responseBody.request.session.httpConnection = r.variables.http_connection;
    _responseBody.request.session.requestId = r.variables.request_id;
    _responseBody.request.session.connection = r.variables.connection;
    _responseBody.request.session.connectionNumber = r.variables.connection_requests;
    
    _responseBody.response.statusCode = 200;
    _responseBody.response.statusReason = 'testing';
    _responseBody.response.statusBody = 'HEALTHY';
    _responseBody.response.timeStamp = r.variables.time_iso8601;

    r.return(_responseBody.response.statusCode, JSON.stringify(_responseBody) + '\n');
}