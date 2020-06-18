function app_protect_stats(r) {

    if (r.variables.ap_data === undefined ) {
        var app_protect_stats = {};
    } else {
        var app_protect_stats = JSON.parse(r.variables.ap_data);
    }

     if (app_protect_stats[r.variables.app_protect_policy_name] === undefined ){
        app_protect_stats[r.variables.app_protect_policy_name] = {};
    }

    if (app_protect_stats[r.variables.app_protect_policy_name][r.variables.app_protect_version] === undefined ){
       app_protect_stats[r.variables.app_protect_policy_name][r.variables.app_protect_version] = {
           "OUTCOME":{
               "PASSED": 0,
               "REJECTED": 0
            },
           "REASON":{
               "SECURITY_WAF_OK": 0,
               "SECURITY_WAF_VIOLATION": 0,
               "SECURITY_WAF_FLAGGED": 0,
               "SECURITY_WAF_BYPASS": 0
           }
       };
   }

   app_protect_stats[r.variables.app_protect_policy_name][r.variables.app_protect_version].OUTCOME[r.variables.app_protect_outcome] += 1;
   app_protect_stats[r.variables.app_protect_policy_name][r.variables.app_protect_version].REASON[r.variables.app_protect_outcome_reason] += 1;

    r.variables.ap_data = JSON.stringify(app_protect_stats);

    return '200'
}

function app_protect_stats_json(r){
    if (r.variables.ap_data === undefined ) {
        var app_protect_stats = {};
    } else {
        var app_protect_stats = r.variables.ap_data;
    }

    r.return(200,app_protect_stats+'\n');
}
export default {app_protect_stats, app_protect_stats_json};
