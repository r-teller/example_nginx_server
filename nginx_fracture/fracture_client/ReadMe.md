-- Coming Soon


```bash
# Launches container that will randomly resets 50% of requests proxied by weight
docker run --itd --net host --restart always \
	--name wrk_ratecalculator.acmefinancial.net \
	--add-host=ratecalculator.acmefinancial.net:10.1.10.7 \
	--add-host=ratecalculator.acmefinancial.net:10.1.10.8 \
    -e wrkScript='/usr/local/bin/loadGen_A.lua'
	rteller/wrk_fracture
```