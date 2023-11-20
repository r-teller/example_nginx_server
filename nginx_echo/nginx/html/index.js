function renderTable(jsonData) {
    function renderSubTable(data, level = 1) {
        var indent = ' '.repeat(level * 4);
        var table = '<table class="table table-bordered table-sm ml-4">';
        for (var key in data) {
            if (typeof data[key] === 'object') {
                table += `${indent}<tr><td class="font-weight-bold bg-light text-uppercase" width="20%">${key}</td><td class="l2-value" width="80%">`;
                table += renderSubTable(data[key], level + 1);
                table += `${indent}</td></tr>`;
            } else {
                table += `${indent}<tr><td class="font-weight-bold bg-light text-uppercase" width="20%">${key}</td><td class="l3-value" width="80%">${data[key]}</td></tr>`;
            }
        }
        table += '</table>';
        return table;
    }

    var tableContainer = document.getElementById("tableContainer");
    tableContainer.innerHTML = "";
    var table = '<table class="table table-bordered table-condensed table-sm">';
    for (var key in jsonData) {
        table += `<tr><td class="font-weight-bold bg-light text-uppercase"  width="20%" class-id="l1-key">${key}</td><td class-id="l1-value" width="80%">`;
        table += renderSubTable(jsonData[key]);
        table += '</td></tr>';
    }
    table += '</table>';
    tableContainer.innerHTML = table;
}