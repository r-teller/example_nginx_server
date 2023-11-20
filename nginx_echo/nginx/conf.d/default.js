// Utility to perform a weighted random selection from an object
function weightedSearch(obj) {
    const totalWeight = Object.values(obj).reduce((a, b) => a + b, 0);
    let random = Math.floor(Math.random() * totalWeight);

    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let weight = obj[key];

        random -= weight;
        if (random < 0) {
            return key;
        }
    }
}

// Generates a random integer within a specified range
function randomIntInRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

// Generates HTML content from JSON data
function generateHTML(jsonData) {
    return `<html>
        <head>
            <title>NGINX Echo Response</title>
            <link rel="stylesheet" href="./index.css">
            <script src="./index.js"></script>
        </head>
        <body>
            <div class="text-center">
                <h1 class="text-center mb-5">Response Echo</h1>
                <div id="tableContainer"></div>
            </div>
            <script>
                renderTable(${jsonData});
            </script>
        </body>
    </html>`;
}

// Handles delayed response based on JSON data and response type
function delayResponse(obj, jsonData, responseType) {
    const delayInfo = jsonData.response.addedDelay;
    if (delayInfo.status === "ENABLED") {
        const delayDuration = randomIntInRange(delayInfo.min, delayInfo.max);
        delayInfo.timeStamp = new Date().toISOString();
        delayInfo.actual = delayDuration;

        setTimeout(() => {
            sendResponse(obj, jsonData, responseType);
        }, delayDuration);
    } else {
        sendResponse(obj, jsonData, responseType);
    }
}

// Sends response based on the type (JSON or HTML)
function sendResponse(obj, jsonData, responseType) {
    const jsonString = JSON.stringify(jsonData);
    switch (responseType) {
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

function constructResponseBody(r) {
    let _headers = {};
    for (let h in r.headersIn) {
        _headers[h] = r.headersIn[h];
    }


    let _args = {}
    for (let a in r.args) {
        _args[a.toLowerCase()] = r.args[a];
    }

    let _responseBody = {
        request: {
            uri: {
                headers: _headers,
                method: r.variables.request_method,
                scheme: r.variables.scheme,
                path: r.uri,
                fullPath: r.variables.request_uri,
                queryString: Object.keys(_args).length ? _args : undefined,
                body: r.requestBody !== 'undefined' ? r.requestBody : undefined
            },
            network: {
                clientPort: r.variables.remote_port,
                clientAddress: r.variables.remote_addr,
                serverPort: r.variables.server_port,
                serverAddress: r.variables.server_addr
            },
            ssl: {
                isHttps: r.variables.https === 'on',
                sslProtocol: r.variables.sslProtocol,
                sslCipher: r.variables.sslCipher
            },
            session: {
                httpConnection: r.variables.http_connection,
                requestId: r.variables.request_id,
                connection: r.variables.connection,
                connectionNumber: r.variables.connection_requests,
                connectionsActive: r.variables.connections_active,
                connectionsWaiting: r.variables.connections_waiting
            }
        },
        environment: {
            metaData: constructMetaData(),
            variables: constructVariables(),
            hostname: r.variables.hostname,
        },
        response: constructResponse(_args, r)
    };

    _responseBody.response.timeStamp = r.variables.time_iso8601;
    return _responseBody
}

function constructVariables() {
    _variables = undefined;

    if (metadata.environment != undefined) {
        _variables = metadata.environment;
    }

    return _variables;
}

function constructResponse(_args, r) {
    const _response = {
        statusCode: parseInt(_args.status, 10) ?? 200,
        statusReason: 'DEFAULT',
        statusBody: 'HEALTHY',
        addedDelay: {
            status: 'DISABLED'
        },
        body: 'Default Body',
        bodySize: _args["filesize"] ?? _args["bodysize"]
    };

    // Logic to update the response body based on the URI
    if (/.js$|.json$/i.test(r.uri)) {
        const _fileSizeWeight = {
            "1k": 50,
            "2k": 40,
            "3k": 30,
            "4k": 20,
            "5k": 10
        };
        const _responseB64 = b64blobs["1kb-file"];
        _response.bodySize = _response.bodySize ?? weightedSearch(_fileSizeWeight);

        _response.body = _responseB64.repeat(parseInt(_response.bodySize));
    } else if (/.jpeg$|.jpg$|.png$|.gif$/i.test(r.uri)) {
        const _fileSizeWeight = {
            "10k": 50,
            "20k": 40,
            "30k": 30,
            "40k": 20,
            "50k": 10
        };
        const _responseB64 = b64blobs["10kb-file"];
        _response.bodySize = _response.bodySize ?? weightedSearch(_fileSizeWeight);

        _response.body = _responseB64.repeat(parseInt(_response.bodySize) / 10);
    }

    // Logic for adding delay based on server port or other conditions
    handleResponseDelay(_response, r, _args);

    // Logic for adding http status based on server port or other conditions
    handleResponseStatus(_response, r, _args)

    return _response;
}

function constructMetaData() {
    // var metadata is passed in from nginx and is set from /tmp/metadata.json
    const _metaData = {
        cloudProvider: metadata.cloudProvider ?? "unknown"
    }

    if (typeof (metadata) != 'undefined') {
        if (metadata.instance != undefined) {
            _metaData.zone = metadata.instance.zone.split("/").slice(-1)[0] ?? undefined;
            _metaData.image = metadata.instance.image.split("/").slice(-1)[0] ?? undefined;
            _metaData.region = metadata.instance.zone.split("/").slice(-1)[0].slice(0, -2) ?? undefined;
            _metaData.tags = metadata.project.tags ?? undefined;
            _metaData.machineName = metadata.instance.name ?? undefined;
            _metaData.instanceId = metadata.instance.id ?? undefined;
            _metaData.machineType = metadata.instance.machineType.split("/").slice(-1)[0] ?? undefined;

            if (metadata.instance.attributes != undefined) {
                _metaData.clusterName = metadata.instance.attributes['cluster-name'] ?? undefined;
                _metaData.clusterUID = metadata.instance.attributes['cluster-uid'] ?? undefined;
            }
        }

        if (metadata.kubernetes != undefined) {
            _metaData.serviceName = metadata.kubernetes.service != undefined ? metadata.kubernetes.service : undefined;
            _metaData.revision = metadata.kubernetes.revision != undefined ? metadata.kubernetes.revision : undefined;
        }


        _metaData.projectId = metadata.project.projectId ?? undefined;
    }
    return _metaData;
}

function handleResponseDelay(response, r, _args) {
    // Function to parse and validate delay values
    function isValidDelay(value) {
        return /^[-+]?\d*$/i.test(value) && parseInt(value, 10) >= 0;
    }

    // Setting delay based on HTTP delay parameters
    if ((isValidDelay(r.variables.http_delay_min) && isValidDelay(r.variables.http_delay_max)) ||
        (isValidDelay(_args.mindelay) && isValidDelay(_args.maxdelay))
    ) {
        var minDelay = parseInt(r.variables.http_delay_min ?? _args.mindelay, 10);
        var maxDelay = parseInt(r.variables.http_delay_max ?? _args.maxdelay, 10);
        if (minDelay < maxDelay) {
            response.addedDelay = {
                status: 'ENABLED',
                min: minDelay,
                max: maxDelay
            };
            return; // Exit function after setting the delay
        }
    }

    // Setting delay based on server port and optional delay argument
    const portPattern = /^([4,8][2-9])\d\d$/i;
    const delayPattern = /^([2-9])\d\d$/i;

    // const delayPattern = _args.delay !== undefined ? new RegExp("^" + _args.delay + "\\d{2}$", "i") : null;
    if (portPattern.test(r.variables.server_port) || delayPattern.test(_args.delay)) {
        const delayRange = (portPattern.test(r.variables.server_port)
            ? Math.floor((r.variables.server_port % 1000) / 100)
            : Math.floor((_args.delay % 1000) / 100)) * 100;

        response.addedDelay = {
            status: 'ENABLED',
            min: delayRange,
            max: delayRange + 100
        };
        return;
    }
}

function handleResponseStatus(response, r, _args) {
    const _serverPort = r.variables.server_port;
    const parsedFailRate = parseInt(_args.randomfailrate);
    const randomFailRate = (!isNaN(parsedFailRate) && parsedFailRate <= 100) ? parsedFailRate : 50;
    const _status = parseInt(_args.status, 10)

    if (_serverPort >= 5000 && _serverPort < 6000) {
        // Captures requests received on TCP port 5000-5999
        response.statusCode = 500;
        response.statusReason = 'UNHEALTHY_SERVER_PORT_RANGE';
        response.statusBody = 'UNHEALTHY';
    } else if ((_serverPort >= 6000 && _serverPort < 7000) || !isNaN(parsedFailRate)) {
        // Checks if randomFailRate status param was provided and that it is between 0 and 100, if not assume the rate of failure should be 50%
        const _isHealthy = JSON.parse(weightedSearch({ false: randomFailRate, true: 100 - randomFailRate }));

        if (_isHealthy) {
            // response.statusCode = 200;
            response.statusBody = 'HEALTHY';
        } else {
            response.statusCode = 500;
            response.statusBody = 'UNHEALTHY';
        }

        if (_serverPort >= 6000 && _serverPort < 7000) {
            response.statusReason = 'RANDOM_SERVER_PORT_RANGE';
        } else {
            response.statusReason = 'QUERY_PARAM_RANDOM_FAIL_RATE';
        }
    } else if ((/^[1-9][0-9]{2}$/i).test(_status)) {
        switch (Math.floor((_status % 1000) / 100)) {
            case 2:
                response.statusReason = 'QUERY_PARAM_STATUS';
                response.statusBody = 'HEALTHY';
                break;
            case 3:
                response.statusReason = 'QUERY_PARAM_STATUS';
                response.statusBody = 'REDIRECT';
                break;
            case 4:
                response.statusReason = 'QUERY_PARAM_STATUS';
                response.statusBody = 'UNAUTHORIZED';
                break;
            case 5:
                response.statusReason = 'QUERY_PARAM_STATUS';
                response.statusBody = 'UNHEALTHY';
                break;
            default:
                response.statusReason = 'QUERY_PARAM_STATUS';
                response.statusBody = 'UNKNOWN_QUERY_PARAM_STATUS - ' + _args.status;
                break;
        }
    }
}

function echoJSON(r) {
    const _responseBody = constructResponseBody(r);
    delayResponse(r, _responseBody, "json");
}

function echoHTML(r) {
    const _responseBody = constructResponseBody(r);
    delayResponse(r, _responseBody, "html");
}

export default { echoHTML, echoJSON };
