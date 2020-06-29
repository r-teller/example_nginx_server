This example is a proof of concept built around extending NGINX+ API stats using NJS to include information for AppProtect.

The nginx.conf uses the keyval store to track incoming requests and NJS to increment the appropriate field. All stats are tracked based on the policy name and version.

This is not meant to be a long lived solution but a POC

App Protect access_log documentation can be found --> https://docs.nginx.com/nginx-app-protect/troubleshooting/#access-logs

*Note: to flush app_protect stats use query param flush=true, to flush for a specific policy name use query param policy_name=<policy-name>

```bash
root@curl 127.0.0.1/api/6/http/app_protect  -s  | jq
{
  "app_protect_default_policy": {
    "OUTCOME": {
      "PASSED": 13,
      "REJECTED": 17
    },
    "REASON": {
      "SECURITY_WAF_OK": 0,
      "SECURITY_WAF_VIOLATION": 17,
      "SECURITY_WAF_FLAGGED": 13,
      "SECURITY_WAF_BYPASS": 0
    }
  }
}

root@curl "127.0.0.1/api/6/http/app_protect?flush=true&policy_name=app_protect_default_policy"  -s  | jq
{
  "app_protect_default_policy": {
    "OUTCOME": {
      "PASSED": 0,
      "REJECTED": 0
    },
    "REASON": {
      "SECURITY_WAF_OK": 0,
      "SECURITY_WAF_VIOLATION": 0,
      "SECURITY_WAF_FLAGGED": 0,
      "SECURITY_WAF_BYPASS": 0
    }
  }
}
```