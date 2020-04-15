math.randomseed(os.time())

local log_level = none
local threads = {}
local threadCount = 0
local requestCount = {}

local pathCount = 0

local requestTypes = {}
table.insert(requestTypes,{weight = 10, type = 'VALID'})
table.insert(requestTypes,{weight = 4, type = 'DELAY'})

local paths = {'contact','about-us','careers','blog','marketing',"news"}
local files = {'home.asp', 'login.php','location.js','randomFile.me','background.jpg','background.gif'}

local methods = {}
table.insert(methods,{weight = 1, method = 'GET'})
table.insert(methods,{weight = 1, method = 'POST'})
table.insert(methods,{weight = 0, method = 'HEAD'})
table.insert(methods,{weight = 0, method = 'PUT'})
table.insert(methods,{weight = 0, method = 'DELETE'})

local delayed = {}
table.insert(delayed,{weight = 1, method = 'GET', path = '/index.html', params = {delay=900}})

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
    local delay = false
    local method = 'GET' -- DEFAULT Method should be a GET if it fails to set anywhere else
    local path = '/' -- DEFAULT URI should be a / if it fails to set anywhere else

    local requestType = weightedSearch(requestTypes).type

    if requestType == "DELAY" then
        delay = weightedSearch(delayed)
        -- print(wrk.method .. ' ' .. wrk.scheme .. '://' .. wrk.host .. wrk.path)

        wrk.method = delay.method
        if delay.path then
            path = delay.path
        end

        if delay.body and (delay.method == 'POST' or delay.method == 'PUT') then
            wrk.body = delay.body
        end
        if delay.params then
             for k,v in pairs(delay.params) do
                 if not params then
                     params = '?' .. k .. '=' .. v
                 else
                     params = '&' .. k .. '=' .. v
                 end
             end
             path = path..params
         end
         if delay.headers then
             for k,v in pairs(delay.headers) do
                 wrk.headers[k] = v
             end
         end
    else
        -- print("NOT DELAY")
        wrk.method = weightedSearch(methods).method
        if wrk.method == 'POST' or wrk.method == 'PUT' then
            wrk.body = 'foo=bar&baz=quux'
        end
    end

    if path == '/' then
        path = '/%s/%s'

        if params then
            path = path..params
        end

        path = path:format(paths[(requests % #paths)+1],files[(requests % #files)+1])
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
