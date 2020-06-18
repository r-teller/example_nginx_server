This example is a proof of concept built around extending NGINX+ API stats using NJS to include information for AppProtect.

The nginx.conf uses the keyval store to track incoming requests and NJS to incrmenet the appropriate field. All stats are tracked based on the policy name and version.

This is not meant to be a long lived solution but a POC

```bash
root@curl 127.0.0.1/api/6/http/app_protect  -s  | jq
{
  "app_protect_default_policy": {
    "2.52.5": {
      "OUTCOME": {
        "PASSED": 7,
        "REJECTED": 4
      },
      "REASON": {
        "SECURITY_WAF_OK": 0,
        "SECURITY_WAF_VIOLATION": 1,
        "SECURITY_WAF_FLAGGED": 3,
        "SECURITY_WAF_BYPASS": 0
      }
    }
  }
}
```