/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 94.03669724770643, "KoPercent": 5.963302752293578};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9674237895995218, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9736842105263158, 500, 1500, "Comment"], "isController": true}, {"data": [0.9891774891774892, 500, 1500, "Search By Name"], "isController": true}, {"data": [0.976, 500, 1500, "Open Random Post"], "isController": true}, {"data": [0.9637305699481865, 500, 1500, "Open Random Page"], "isController": true}, {"data": [0.975609756097561, 500, 1500, "Open Random Date"], "isController": true}, {"data": [1.0, 500, 1500, "Home page"], "isController": true}, {"data": [0.9615384615384616, 500, 1500, "Open First Post"], "isController": true}, {"data": [0.609375, 500, 1500, "Open to Home page"], "isController": false}, {"data": [1.0, 500, 1500, "Open Large Calendar"], "isController": true}, {"data": [0.9692982456140351, 500, 1500, "Open Predefined Date"], "isController": true}, {"data": [0.9318181818181818, 500, 1500, "Open Contacts"], "isController": true}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1744, 104, 5.963302752293578, 8501.416857798164, 30, 166311, 222.0, 104677.0, 164430.7, 4.1535182252283365, 120.46344581328816, 1.9980963909761007], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Comment", 152, 4, 2.6315789473684212, 2206.6315789473683, 33, 164455, 104.0, 163.0, 162499.3, 0.38665038665038665, 0.9054516989087301, 0.866088121947497], "isController": true}, {"data": ["Search By Name", 462, 4, 0.8658008658008658, 1500.8593073593074, 33, 166155, 133.39999999999998, 177.0, 60218.94000000073, 1.1011089740381386, 25.91497657164239, 0.46797038296903787], "isController": true}, {"data": ["Open Random Post", 500, 12, 2.4, 4020.8820000000005, 34, 166225, 253.30000000000024, 287.0, 162491.21, 1.2204230474451665, 30.58701471403047, 0.5095409241409442], "isController": true}, {"data": ["Open Random Page", 772, 26, 3.3678756476683938, 5553.338082901555, 37, 165590, 160.0, 241.14999999999918, 163170.06, 1.8736135987457467, 62.994962501941565, 0.773835445699183], "isController": true}, {"data": ["Open Random Date", 164, 4, 2.4390243902439024, 4005.09756097561, 30, 162986, 101.0, 160.25, 162767.6, 0.42077607528812894, 12.908115910980204, 0.17679330145013805], "isController": true}, {"data": ["Home page", 230, 0, 0.0, 89.62608695652177, 46, 323, 139.0, 145.0, 287.34999999999974, 0.9518212893453952, 29.481460111963152, 0.39318398964170137], "isController": true}, {"data": ["Open First Post", 286, 10, 3.4965034965034967, 5786.286713286714, 35, 166311, 193.0000000000001, 316.3499999999982, 164980.88, 0.7106384564733945, 17.57224313121964, 0.2932198941496565], "isController": true}, {"data": ["Open to Home page", 64, 25, 39.0625, 31272.79687499999, 46, 160653, 122879.5, 144218.75, 160653.0, 0.1524252282805958, 3.016508199256689, 0.038369125228042436], "isController": false}, {"data": ["Open Large Calendar", 172, 0, 0.0, 147.72093023255823, 85, 379, 217.0, 270.4, 379.0, 0.7255883804614235, 59.7157819954946, 0.31461058684069537], "isController": true}, {"data": ["Open Predefined Date", 456, 14, 3.0701754385964914, 5069.837719298245, 31, 165592, 144.0, 183.3499999999998, 163448.7, 1.1032160198578882, 32.924863859574636, 0.46052861375826504], "isController": true}, {"data": ["Open Contacts", 88, 6, 6.818181818181818, 11190.465909090908, 36, 165345, 261.90000000000083, 161452.95, 165345.0, 0.2376457943445702, 4.658951490889795, 0.09298862203246566], "isController": true}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 64, 61.53846153846154, 3.669724770642202], "isController": false}, {"data": ["404/Not Found", 1, 0.9615384615384616, 0.05733944954128441], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException", 39, 37.5, 2.2362385321100917], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1744, 104, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 64, "Non HTTP response code: java.net.SocketException", 39, "404/Not Found", 1, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Comment", 77, 3, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1, "404/Not Found", 1, "Non HTTP response code: java.net.SocketException", 1, null, null, null, null], "isController": false}, {"data": ["Search By Name", 233, 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2, "Non HTTP response code: java.net.SocketException", 2, null, null, null, null, null, null], "isController": false}, {"data": ["Open Random Post", 256, 12, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 6, "Non HTTP response code: java.net.SocketException", 6, null, null, null, null, null, null], "isController": false}, {"data": ["Open Random Page", 399, 26, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 13, "Non HTTP response code: java.net.SocketException", 13, null, null, null, null, null, null], "isController": false}, {"data": ["Open Random Date", 84, 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2, "Non HTTP response code: java.net.SocketException", 2, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Open First Post", 148, 10, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 5, "Non HTTP response code: java.net.SocketException", 5, null, null, null, null, null, null], "isController": false}, {"data": ["Open to Home page", 64, 25, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 25, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Open Predefined Date", 235, 14, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 7, "Non HTTP response code: java.net.SocketException", 7, null, null, null, null, null, null], "isController": false}, {"data": ["Open Contacts", 47, 6, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3, "Non HTTP response code: java.net.SocketException", 3, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
