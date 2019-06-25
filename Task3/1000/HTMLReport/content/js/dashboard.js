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

    var data = {"OkPercent": 97.65027322404372, "KoPercent": 2.349726775956284};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9743169398907103, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9771986970684039, 500, 1500, "Comment"], "isController": false}, {"data": [0.9789473684210527, 500, 1500, "Open Random Page"], "isController": false}, {"data": [0.9859375, 500, 1500, "Open post"], "isController": false}, {"data": [0.9763313609467456, 500, 1500, "Open Search by name"], "isController": false}, {"data": [0.9733542319749217, 500, 1500, "Open Random Date"], "isController": false}, {"data": [0.9254859611231101, 500, 1500, "Open to Home page"], "isController": false}, {"data": [0.9891304347826086, 500, 1500, "Open Large Calendar"], "isController": false}, {"data": [0.9894259818731118, 500, 1500, "Open Predefined Date"], "isController": false}, {"data": [0.9783783783783784, 500, 1500, "Open Contacts"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3660, 86, 2.349726775956284, 3066.670765027322, 22, 157490, 180.0, 244.0, 155529.13999999998, 6.771770966124493, 205.0976443609511, 3.866687292660769], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Comment", 307, 7, 2.2801302931596092, 1102.299674267101, 28, 157178, 141.39999999999998, 194.7999999999999, 282.64000000000027, 0.6037234199456846, 1.4118637397961893, 1.361542572333735], "isController": false}, {"data": ["Open Random Page", 570, 10, 1.7543859649122806, 2817.9087719298245, 33, 157490, 141.0, 201.3499999999998, 155557.28, 1.0847824059712514, 33.221437022077225, 0.4601441487883742], "isController": false}, {"data": ["Open post", 640, 8, 1.25, 2064.19375, 32, 157470, 221.89999999999998, 272.89999999999986, 156102.49, 1.249543623715557, 31.73828220332613, 0.5275992795355993], "isController": false}, {"data": ["Open Search by name", 338, 8, 2.366863905325444, 3770.275147928994, 35, 156950, 153.20000000000005, 231.20000000000005, 156025.47, 0.6688222001480115, 17.82293519696616, 0.27994485061321894], "isController": false}, {"data": ["Open Random Date", 319, 8, 2.5078369905956115, 4008.141065830721, 33, 157415, 154.0, 205.0, 157313.6, 0.6038693067807519, 18.704944948983456, 0.2535428074007118], "isController": false}, {"data": ["Open to Home page", 463, 33, 7.1274298056155505, 7416.421166306694, 37, 157381, 230.60000000000002, 71649.59999999963, 155765.88, 0.8566475293212132, 24.780218102831004, 0.3286472797740522], "isController": false}, {"data": ["Open Large Calendar", 322, 1, 0.3105590062111801, 638.2484472049689, 79, 155545, 227.09999999999997, 286.39999999999986, 686.9699999999989, 0.6348017230332482, 52.08969685507004, 0.2743912581691293], "isController": false}, {"data": ["Open Predefined Date", 331, 3, 0.9063444108761329, 1488.821752265861, 32, 155552, 140.8, 189.39999999999998, 104740.04000000104, 0.6376973538449683, 19.527434472262094, 0.27214420918785104], "isController": false}, {"data": ["Open Contacts", 370, 8, 2.1621621621621623, 3441.2108108108105, 22, 157057, 144.0, 194.94999999999987, 156515.36000000002, 0.7004524544232626, 14.352518153195577, 0.2877756256744221], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain \/editor3\/", 2, 2.3255813953488373, 0.0546448087431694], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 81, 94.18604651162791, 2.2131147540983607], "isController": false}, {"data": ["404/Not Found", 3, 3.488372093023256, 0.08196721311475409], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3660, 86, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 81, "404/Not Found", 3, "Test failed: text expected to contain \/editor3\/", 2, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Comment", 307, 7, "404/Not Found", 3, "Test failed: text expected to contain \/editor3\/", 2, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2, null, null, null, null], "isController": false}, {"data": ["Open Random Page", 570, 10, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 10, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open post", 640, 8, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 8, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open Search by name", 338, 8, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 8, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open Random Date", 319, 8, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 8, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open to Home page", 463, 33, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 33, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open Large Calendar", 322, 1, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open Predefined Date", 331, 3, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open Contacts", 370, 8, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 8, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
