-- Coming Soon


```bash
# Launches container that will randomly resets 50% of requests proxied by weight
docker run -itd --net host --restart always \
	--name wrk_ratecalculator.acmefinancial.net \
	--add-host=ratecalculator.acmefinancial.net:10.1.10.5 \
	--add-host=ratecalculator.acmefinancial.net:10.1.10.6 \
    -e wrkScript='/usr/local/bin/loadGen_A.lua' \
    -e wrkEndpoint='http://ratecalculator.acmefinancial.net' \
	rteller/wrk_fracture
```

```bash

docker run --rm -it --entrypoint /bin/bash \
    -e wrkScript='/usr/local/bin/loadGen_A.lua' \
    -e wrkEndpoint='http://ratecalculator.acmefinancial.net' \
    rteller/wrk_fracture
```