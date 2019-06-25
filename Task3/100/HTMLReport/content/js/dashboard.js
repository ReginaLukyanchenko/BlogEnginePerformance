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

    var data = {"OkPercent": 97.73832170788417, "KoPercent": 2.261678292115832};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8606002959205242, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8798543689320388, 500, 1500, "Comment"], "isController": false}, {"data": [0.8786472148541115, 500, 1500, "Open Random Page"], "isController": false}, {"data": [0.8674334140435835, 500, 1500, "Open post"], "isController": false}, {"data": [0.8732394366197183, 500, 1500, "Open Search by name"], "isController": false}, {"data": [0.875, 500, 1500, "Open Random Date"], "isController": false}, {"data": [0.8092783505154639, 500, 1500, "Open to Home page"], "isController": false}, {"data": [0.8412887828162291, 500, 1500, "Open Large Calendar"], "isController": false}, {"data": [0.8576470588235294, 500, 1500, "Open Predefined Date"], "isController": false}, {"data": [0.8617710583153347, 500, 1500, "Open Contacts"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4731, 107, 2.261678292115832, 4038.810188120905, 24, 204013, 1274.8000000000002, 4570.7999999999665, 189535.1200000001, 7.169278935109767, 165.98537504650332, 4.129598869012531], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Comment", 412, 9, 2.1844660194174756, 2488.055825242719, 28, 201164, 985.6999999999991, 3296.749999999992, 167848.56000000075, 0.6441495740326422, 1.5105958549678473, 1.444501083582316], "isController": false}, {"data": ["Open Random Page", 754, 10, 1.3262599469496021, 3098.4323607427054, 27, 196524, 1119.5, 3177.25, 188294.30000000002, 1.1527659502904082, 30.262854871601903, 0.49073953127221637], "isController": false}, {"data": ["Open post", 826, 12, 1.4527845036319613, 3322.054479418886, 31, 195085, 1180.3000000000015, 3783.499999999998, 187615.74000000005, 1.2816315511000154, 32.210599381915344, 0.5389185031288257], "isController": false}, {"data": ["Open Search by name", 426, 8, 1.8779342723004695, 4121.638497652582, 25, 193719, 1143.000000000001, 4675.599999999978, 189555.57, 0.6528175359662619, 16.661158379031836, 0.2746142428772396], "isController": false}, {"data": ["Open Random Date", 424, 5, 1.179245283018868, 2327.6415094339623, 24, 196734, 1070.5, 2663.75, 147015.5, 0.6448551509326065, 17.263947927471285, 0.27444098691354685], "isController": false}, {"data": ["Open to Home page", 582, 43, 7.3883161512027495, 9473.405498281787, 29, 201112, 3415.1000000000004, 85857.80000000022, 192955.23, 0.8819531473755832, 24.065411844748212, 0.33740514883717054], "isController": false}, {"data": ["Open Large Calendar", 419, 6, 1.431980906921241, 3496.6897374701675, 34, 203911, 1792.0, 4187.0, 193883.2, 0.6695461946925281, 17.3755536315091, 0.2861538466147968], "isController": false}, {"data": ["Open Predefined Date", 425, 5, 1.1764705882352942, 2968.3505882352943, 26, 196281, 1493.800000000003, 5857.499999999994, 190560.84, 0.6769380737050175, 15.241932690056338, 0.2881031020488128], "isController": false}, {"data": ["Open Contacts", 463, 9, 1.9438444924406046, 4361.501079913608, 24, 204013, 1179.4000000000015, 5431.1999999999825, 193069.56000000003, 0.7255449814382715, 14.834437672277758, 0.2987498550477089], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain \/editor3\/", 3, 2.803738317757009, 0.06341154090044387], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 10.17.175.58:80 [\/10.17.175.58] failed: Connection timed out: connect", 3, 2.803738317757009, 0.06341154090044387], "isController": false}, {"data": ["Test failed: text expected to contain \/editor1\/", 1, 0.9345794392523364, 0.02113718030014796], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 100, 93.45794392523365, 2.113718030014796], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4731, 107, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 100, "Test failed: text expected to contain \/editor3\/", 3, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 10.17.175.58:80 [\/10.17.175.58] failed: Connection timed out: connect", 3, "Test failed: text expected to contain \/editor1\/", 1, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Comment", 412, 9, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 4, "Test failed: text expected to contain \/editor3\/", 3, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 10.17.175.58:80 [\/10.17.175.58] failed: Connection timed out: connect", 1, "Test failed: text expected to contain \/editor1\/", 1, null, null], "isController": false}, {"data": ["Open Random Page", 754, 10, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 10, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open post", 826, 12, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 12, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open Search by name", 426, 8, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 8, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open Random Date", 424, 5, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 4, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 10.17.175.58:80 [\/10.17.175.58] failed: Connection timed out: connect", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Open to Home page", 582, 43, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 42, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 10.17.175.58:80 [\/10.17.175.58] failed: Connection timed out: connect", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Open Large Calendar", 419, 6, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 6, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open Predefined Date", 425, 5, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 5, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open Contacts", 463, 9, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 9, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
