math.randomseed(os.time())

local log_level = none
local threads = {}
local threadCount = 0
local requestCount = {}

local pathCount = 30

local requestTypes = {}
table.insert(requestTypes,{weight = 10, type = 'VALID'})


local paths = {'','careers','blog'}
local files = {'index.html', 'home.asp', 'login.php','location.js','randomFile.me','background.jpg','background.gif'}

local methods = {}
table.insert(methods,{weight = 1, method = 'GET'})
table.insert(methods,{weight = 1, method = 'POST'})
table.insert(methods,{weight = 0, method = 'HEAD'})
table.insert(methods,{weight = 0, method = 'PUT'})
table.insert(methods,{weight = 0, method = 'DELETE'})


function weightedFilter(obj)
    local weights = 0;
    local newObj = {}
    for k,v in pairs(obj) do
      if v.weight > 0 then
        table.insert(newObj,v)
      end
    end
    return newObj
end

function weightedSearch(obj)
    if #obj > 0 then
        obj = weightedFilter(obj)
        local weights = 0
        for k,v in pairs(obj) do
          weights = weights + v.weight
        end

        local random = math.random(weights)

        for k,v in pairs(obj) do
            random = random - v.weight
            if random <= 0 then
                return(v)
            end
        end
    else
        for k,v in pairs(obj) do
            return(v)
        end
    end
end

function getEndpoint(host)
    if not host.port then
        if host.scheme == 'http' then
            host.port = 80
        elseif host.scheme == 'https' then
            host.port = 443
        else
            host.port = 80
        end
    end
    if not host.addr then
        host.addr = wrk.lookup(host.address,host.port)
    end
    return host
end

function setup(thread)
    thread:set("id", threadCount)
    table.insert(threads, thread)

    threadCount = threadCount + 1
end

function init(args)
    for k,v in pairs(args) do
        local index = string.find(v,'=')
        if index then
            local left = string.sub(v,0,index-1)
            local right = string.sub(v,index+1)
            if left == 'log_level' then log_level = right end
        end
    end
    requests = 0
end

function request()
    -- Cleanup WRK Values so that everything is fresh
    wrk.method  = "GET"
    wrk.path    = "/"
    wrk.headers = {}
    wrk.headers['Host'] = wrk.host
    wrk.body    = nil

    local params = false
    local headers = false
    local method = 'GET' -- DEFAULT Method should be a GET if it fails to set anywhere else
    local path = '/' -- DEFAULT URI should be a / if it fails to set anywhere else

    wrk.method = weightedSearch(methods).method
    if wrk.method == 'POST' or wrk.method == 'PUT' then
        wrk.body = 'foo=bar&baz=quux'
    end

    if path == '/' then
        if paths[(requests % #paths)+1] == '' then
            path = '/%d/%s'
            if files[(requests % #files)+1] == 'index.html' then
                path = path..?delay=900
            elseif params then
                path = path..params
            end
            path = path:format((requests % pathCount)+1,files[(requests % #files)+1])
        else
            path = '/%s/%d/%s'
            if params then
                path = path..params
            end
            path = path:format(paths[(requests % #paths)+1],(requests % pathCount)+1,files[(requests % #files)+1])
    end

    wrk.path = path

    requests = requests + 1

    if log_level == 'request' then
        print(wrk.method .. ' ' .. wrk.scheme .. '://' .. wrk.host .. wrk.path)
    end
    return wrk.format(nil,path)
end

function response(status, headers, body)
    if log_level == 'response' then
        print('('.. status .. ') ' .. wrk.method .. ' ' .. wrk.scheme .. '://' .. wrk.host .. wrk.path..'\r\n'..body)
    end
end
