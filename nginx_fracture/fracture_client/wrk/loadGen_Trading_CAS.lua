math.randomseed(os.time())

local log_level = none
local threads = {}
local threadCount = 0
local requestCount = {}

local requestTypes = {}
table.insert(requestTypes,{weight = 2, type = 'mainPage'})
table.insert(requestTypes,{weight = 4, type = 'loginPage'})
table.insert(requestTypes,{weight = 1, type = 'casAttacks'})
table.insert(requestTypes,{weight = 10, type = 'tradingPage'})

local casAttacks = {}
table.insert(casAttacks,{weight = 1, method = 'GET', path = '/?v=<script>'})
table.insert(casAttacks,{weight = 1, method = 'GET', path = '/?v=SELECT FROM DUAL'})
table.insert(casAttacks,{weight = 10, method = 'GET', path = '/wp-admin/admin-post.php?do_reset_wordpress'})
table.insert(casAttacks,{weight = 1, method = 'GET', path = '/one/../object.html'})
table.insert(casAttacks,{weight = 4, method = 'POST', path = '/trading/login.php', body = '{ "name" : }}"String.fromCharCode" }'})
table.insert(casAttacks,{weight = 1, method = 'POST', path = '/xml_profile', body = '<?xml version="1.0"?><envelope><subject>Your order <num>1032</num></subject><letter>Dear Mr.<name>John Smith</>.Your order <orderid>1032</orderid>will be &lt;sCript shipped on <shipdate>2001-07-13</shipdate>. </letter><logo>image.gif</logo></envelope>'})

local mainPage = {}
table.insert(mainPage,{weight = 1, method = 'GET', path = '/favicon.ico'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/images/slider/slide-img-3.jpg'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/images/section-1-bg.jpg'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/images/thumb-img1.jpg'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/images/foot-brand.png'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/images/image7.jpg'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/images/image6.jpg'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/images/image5.jpg'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/images/image4.jpg'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/images/image3.jpg'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/images/image2.jpg'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/js/plugins/shuffle/jquery.shuffle.modernizr.min.js'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/js/custom.js'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/js/plugins/magnific-popup/jquery.magnific-popup.min.js'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/js/plugins/owl-carousel/owl.carousel.js'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/js/plugins/backstretch/jquery.backstretch.min.js'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/js/bootstrap.min.js'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/js/jquery-3.3.1.min.js'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/js/popper.min.js'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/css/style.css'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/js/plugins/owl-carousel/owl.theme.css'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/images/logo0.png'})
table.insert(mainPage,{weight = 1, method = 'GET', path = '/css/responsive.css'})

local loginPage = {}
table.insert(loginPage,{weight = 1, method = 'GET', path = '/trading/favicon.png'})
table.insert(loginPage,{weight = 1, method = 'GET', path = '/trading/img/bg-pattern2.png'})
table.insert(loginPage,{weight = 1, method = 'GET', path = '/trading/css/main.css', params = { version = '4.4.0' }})
table.insert(loginPage,{weight = 1, method = 'GET', path = '/trading/img/logo10.png'})
table.insert(loginPage,{weight = 1, method = 'GET', path = '/trading/login.php'})
table.insert(loginPage,{weight = 1, method = 'POST', path = '/trading/login.php', body = 'username=admin&password=iloveblue'})


local tradingPage = {}
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/img/cta-pattern-light.png'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/api/side_bar_accounts.php'})
table.insert(tradingPage,{weight = 5, method = 'GET', path = '/api/side_bar.php'})
table.insert(tradingPage,{weight = 5, method = 'GET', path = '/api/lower_bar.php'})
table.insert(tradingPage,{weight = 5, method = 'GET', path = '/app3/index.php'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/js/main.js', params = { version = '4.4.0' }})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/js/plugins/countdown/jquery.downCount.js'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/js/demo_customizer.js', params = { version = '4.4.0' }})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/bower_components/bootstrap/js/dist/tab.js'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/bower_components/bootstrap/js/dist/modal.js'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/bower_components/bootstrap/js/dist/collapse.js'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/bower_components/bootstrap/js/dist/button.js'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/bower_components/bootstrap/js/dist/alert.js'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/bower_components/bootstrap/js/dist/util.js'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/bower_components/perfect-scrollbar/js/perfect-scrollbar.jquery.min.js'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/bower_components/dropzone/dist/dropzone.js'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/bower_components/bootstrap-daterangepicker/daterangepicker.js'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/bower_components/bootstrap-validator/dist/validator.min.js'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/bower_components/chart.js/dist/Chart.min.js'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/img/cta-pattern-light.png'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/img/email_sent.png'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/img/loading.gif'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/img/failed.png'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/bower_components/jquery/dist/jquery.min.js'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/img/question_mark.png'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/img/Bart.jpg'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/img/Or.jpg'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/img/Alfredo.jpg'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/img/card1.png'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/img/card2.png'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/img/card3.png'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/img/Vincent.jpg'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/img/Phillipe.jpg'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/img/logo9.png'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/icon_fonts_assets/picons-thin/style.css'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/css/additional.css'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/css/main.css', params = { version = '4.4.0' }})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/bower_components/perfect-scrollbar/css/perfect-scrollbar.min.css'})
table.insert(tradingPage,{weight = 1, method = 'GET', path = '/trading/bower_components/bootstrap-daterangepicker/daterangepicker.css'})
table.insert(tradingPage,{weight = 5, method = 'GET', path = '/trading/index.php'})


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
    local request = false

    local method = 'GET' -- DEFAULT Method should be a GET if it fails to set anywhere else
    local path = '/' -- DEFAULT URI should be a / if it fails to set anywhere else

    local requestType = weightedSearch(requestTypes).type

    if requestType == 'mainPage' then
        request = weightedSearch(mainPage)
    elseif requestType == 'loginPage' then
        request = weightedSearch(loginPage)
    elseif requestType == 'tradingPage' then
        request = weightedSearch(tradingPage)
    elseif requestType == 'casAttacks' then
        request = weightedSearch(casAttacks)
    end

    wrk.method = request.method
    if request.path then
        path = request.path
    end

    if request.body and (request.method == 'POST' or request.method == 'PUT') then
        wrk.body = request.body
    end
    if request.params then
         for k,v in pairs(request.params) do
             if not params then
                 params = '?' .. k .. '=' .. v
             else
                 params = '&' .. k .. '=' .. v
             end
         end
         path = path..params
     end
     if request.headers then
         for k,v in pairs(request.headers) do
             wrk.headers[k] = v
         end
     end

    wrk.path = path

    requests = requests + 1

    if log_level == 'request' then
        print(requestType .. ' ' .. wrk.method .. ' ' .. wrk.scheme .. '://' .. wrk.host .. wrk.path)
    end

    return wrk.format(nil,path)
end

function response(status, headers, body)
    if log_level == 'response' then
        print('('.. status .. ') ' .. wrk.method .. ' ' .. wrk.scheme .. '://' .. wrk.host .. wrk.path..'\r\n'..body)
    end
end
