function echo(r) {
    var _headers = {};
    for (var h in r.headersIn) {
        _headers[h] = r.headersIn[h];
    }
    var _responseBody = {};
    _responseBody.request.uri.headers = _headers;
    _responseBody.request.uri.method = r.variables.request_method;
    _responseBody.request.uri.schme = r.variables.scheme;
    _responseBody.request.uri.path = r.uri;
    _responseBody.request.uri.fullPath = r.variables.request_uri;
    _responseBody.request.uri.queryString = r.variables.args;
    _responseBody.request.uri.body = r.requestBody != '' ? r.requestBody : null;


    _responseBody.request.network.clientPort = r.variables.remote_port;
    _responseBody.request.network.clientAddress = r.variables.remote_addr;
    _responseBody.request.network.serverAddress = r.variables.server_addr;
    _responseBody.request.network.serverPort = r.variables.server_port;

    _responseBody.request.ssl.isHttps = r.variables.isHttps;
    _responseBody.request.ssl.sslProtocol = r.variables.isHttps ? r.variables.ssl_protocol : null;
    _responseBody.request.ssl.sslCipher = r.variables.isHttps ? r.variables.ssl_cipher : null;

    _responseBody.request.session.httpConnection = r.variables.http_connection;
    _responseBody.request.session.requestId = r.variables.request_id;
    _responseBody.request.session.connection = r.variables.connection;
    _responseBody.request.session.connectionNumber = r.variables.connection_requests;
    
    _responseBody.response.statusCode = 200;
    _responseBody.response.statusReason = 'testing';
    _responseBody.response.statusBody = 'HEALTHY';
    _responseBody.response.timeStamp = r.variables.time_iso8601;


    // var req = { "client": r.variables.remote_addr, "port": Number(r.variables.server_port), "host": r.variables.host, "method": r.variables.request_method, "uri": r.variables.request_uri, "headers": headers, "body": r.variables.request_body }
    // var res = { "status": Number(_responseBody.response.statusCode), "timestamp": r.variables.time_iso8601 }
​
    r.return(Number(_responseBody.response.statusCode, JSON.stringify(_responseBody) + '\n');
}

// set $rspBody '{
//     "hostname": "$hostname",
//     "network": {
//         "clientPort": "$remote_port",
//         "clientAddress": "$remote_addr",
//         "serverAddress": "$server_addr",
//         "serverPort": "$server_port"
//     },
//     "uri": {
//         "httpVersion": "$server_protocol",
//         "method": "$request_method",
//         "scheme": "$scheme",
//         "fullPath": "$request_uri",
//         "path": "$uri",
//         "queryString": "$args",
//         "isHttps": $isHttps
//     },
//     "ssl": {
//         "sslProtocol": "$ssl_protocol",
//         "sslCipher": "$ssl_cipher"
//     },
//     "session": {
//         "httpConnection": "$http_connection",
//         "requestId": "$request_id",
//         "connection": "$connection",
//         "connectionNumber": "$connection_requests"
//     },
//     "headers": {
//         "host": "$http_host",
//         "userAgent": "$http_user_agent",
//         "xForwardedFor": "$http_x_forwarded_for",
//         "xForwardedProto": "$http_x_forwarded_proto"
//     },
//     "statusCdoe": $rspStatusCode,
//     "statusBody": "$rspStatusBody",
//     "statusReason": "$rspReason"
// }\n';