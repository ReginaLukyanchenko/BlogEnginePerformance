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

    var data = {"OkPercent": 98.48088004190676, "KoPercent": 1.5191199580932426};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8878994237820849, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8985294117647059, 500, 1500, "Comment"], "isController": false}, {"data": [0.89296875, 500, 1500, "Open Random Page"], "isController": false}, {"data": [0.9010263929618768, 500, 1500, "Open post"], "isController": false}, {"data": [0.8873873873873874, 500, 1500, "Open Search by name"], "isController": false}, {"data": [0.8711484593837535, 500, 1500, "Open Random Date"], "isController": false}, {"data": [0.8723897911832946, 500, 1500, "Open to Home page"], "isController": false}, {"data": [0.8719135802469136, 500, 1500, "Open Large Calendar"], "isController": false}, {"data": [0.8785529715762274, 500, 1500, "Open Predefined Date"], "isController": false}, {"data": [0.9058641975308642, 500, 1500, "Open Contacts"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3818, 58, 1.5191199580932426, 995.6335777894182, 29, 46823, 918.1999999999998, 3092.0, 41950.01999999999, 6.9556155938416016, 206.32175668576213, 4.056736721159609], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Comment", 340, 6, 1.7647058823529411, 835.4323529411763, 29, 44176, 650.5000000000011, 3085.6499999999996, 41768.879999999976, 0.650437610598307, 1.5284536563202449, 1.4594997220096608], "isController": false}, {"data": ["Open Random Page", 640, 8, 1.25, 866.7468750000005, 38, 44439, 849.699999999999, 2291.749999999994, 41567.180000000015, 1.2022301369039567, 35.51997891635859, 0.513127143820537], "isController": false}, {"data": ["Open post", 682, 6, 0.8797653958944281, 773.5014662756595, 41, 44619, 769.5000000000011, 1996.8500000000017, 16452.96999999877, 1.2917694210524322, 32.81449249395786, 0.5475122577222052], "isController": false}, {"data": ["Open Search by name", 333, 6, 1.8018018018018018, 1140.2852852852857, 41, 44228, 990.2000000000012, 3118.700000000001, 43486.800000000025, 0.615048178774004, 16.39587185561236, 0.2589269285131164], "isController": false}, {"data": ["Open Random Date", 357, 5, 1.4005602240896358, 1070.848739495798, 41, 46823, 1245.199999999997, 3281.699999999996, 43285.32000000001, 0.668012671657738, 20.345565867078573, 0.2836597925605468], "isController": false}, {"data": ["Open to Home page", 431, 11, 2.5522041763341066, 1320.1693735498836, 44, 44361, 1544.4000000000005, 3696.399999999997, 43455.840000000004, 0.785195333279894, 22.21730213954342, 0.3160749957187725], "isController": false}, {"data": ["Open Large Calendar", 324, 3, 0.9259259259259259, 928.1790123456796, 101, 44506, 1166.0, 3303.5, 34815.25, 0.6107676066958226, 49.73624454798013, 0.2623729334753431], "isController": false}, {"data": ["Open Predefined Date", 387, 8, 2.0671834625322996, 1305.9767441860463, 41, 46161, 1199.7999999999995, 3425.1999999999966, 43558.76, 0.7177299703264095, 20.826785486600517, 0.3027108302809718], "isController": false}, {"data": ["Open Contacts", 324, 5, 1.5432098765432098, 919.4197530864199, 35, 42758, 651.0, 1925.75, 41437.75, 0.6177358835911045, 12.698055088241855, 0.2553977115650072], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 55, 94.82758620689656, 1.4405447878470403], "isController": false}, {"data": ["404/Not Found", 2, 3.4482758620689653, 0.05238344683080147], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: connect", 1, 1.7241379310344827, 0.026191723415400735], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3818, 58, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 55, "404/Not Found", 2, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: connect", 1, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Comment", 340, 6, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 4, "404/Not Found", 2, null, null, null, null, null, null], "isController": false}, {"data": ["Open Random Page", 640, 8, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 8, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open post", 682, 6, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 6, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open Search by name", 333, 6, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 6, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open Random Date", 357, 5, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 5, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open to Home page", 431, 11, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 10, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: connect", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Open Large Calendar", 324, 3, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open Predefined Date", 387, 8, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 8, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open Contacts", 324, 5, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 5, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
