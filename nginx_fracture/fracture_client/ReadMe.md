-- Coming Soon


```bash
docker run -itd --net host --restart always \
    --name wrk_ratecalculator.acmefinancial.net \
    --add-host=ratecalculator.acmefinancial.net:10.1.10.5 \
    -e wrkScript='/usr/local/bin/loadGen.lua' \
    -e wrkEndpoint='http://ratecalculator.acmefinancial.net' \
    rteller/wrk_fracture
```

```bash
docker run -itd --net host --restart always \
    --name wrk_servicecenter.acmefinancial.net \
    --add-host=servicecenter.acmefinancial.net:10.1.10.6 \
    -e wrkScript='/usr/local/bin/loadGen.lua' \
    -e wrkEndpoint='http://servicecenter.acmefinancial.net' \
    rteller/wrk_fracture
```

```bash
docker run -itd --net host --restart always \
    --name wrk_accounts.internal.acmefinancial.net \
    --add-host=accounts.internal.acmefinancial.net:10.1.10.16 \
    -e wrkScript='/usr/local/bin/loadGen_Accounts-Internal.lua' \
    -e wrkEndpoint='https://accounts.internal.acmefinancial.net' \
    rteller/wrk_fracture
```

```bash
docker run -itd --net host --restart always \
    --name wrk_ticketprocessing.internal.acmefinancial.net \
    --add-host=ticketprocessing.internal.acmefinancial.net:10.1.10.17 \
    -e wrkScript='/usr/local/bin/loadGen.lua' \
    -e wrkEndpoint='https://ticketprocessing.internal.acmefinancial.net' \
    rteller/wrk_fracture
```

```bash
docker run -itd --net host --restart always \
    --name wrk_merch.dev.acmefinancial.net \
    --add-host=merch.dev.acmefinancial.net:10.1.20.8 \
    -e wrkScript='/usr/local/bin/loadGen.lua' \
    -e wrkEndpoint='https://merch.dev.acmefinancial.net' \
    rteller/wrk_fracture
```

```bash
docker run -itd --net host --restart always \
    --name wrk_www.dev.acmefinancial.net \
    --add-host=www.dev.acmefinancial.net:10.1.20.8 \
    -e wrkScript='/usr/local/bin/loadGen_WWW.lua' \
    -e wrkEndpoint='https://www.dev.acmefinancial.net' \
    rteller/wrk_fracture
```

```bash
docker run -itd --net host --restart always \
    --name wrk_tradingdev.acmefinancial.net \
    --add-host=trading.dev.acmefinancial.net:10.1.20.8 \
    -e wrkEndpoint='https://trading.dev.acmefinancial.net' \
    rteller/wrk_fracture
```

```bash

docker run --rm -it --entrypoint /bin/bash \
    -e wrkScript='/usr/local/bin/loadGen_A.lua' \
    --add-host=accounts.internal.acmefinancial.net:10.1.10.16 \
    -e wrkEndpoint='https://accounts.internal.acmefinancial.net' \
    -v /home/ubuntu/entrypoint.sh:/usr/local/bin/entrypoint.sh \
    rteller/wrk_fracture
```