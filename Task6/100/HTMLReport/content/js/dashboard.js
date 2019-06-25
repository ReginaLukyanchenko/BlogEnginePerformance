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

    var data = {"OkPercent": 95.81621217781098, "KoPercent": 4.183787822189018};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9620570107858244, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9676258992805755, 500, 1500, "Comment"], "isController": true}, {"data": [0.9586056644880174, 500, 1500, "Open Random Post"], "isController": true}, {"data": [0.972972972972973, 500, 1500, "Search By Name"], "isController": true}, {"data": [0.9636524822695035, 500, 1500, "Open Random Page"], "isController": true}, {"data": [0.946969696969697, 500, 1500, "Open Random Date"], "isController": true}, {"data": [0.9509803921568627, 500, 1500, "Open First Post"], "isController": true}, {"data": [0.9605678233438486, 500, 1500, "Open Home page"], "isController": false}, {"data": [0.9533333333333334, 500, 1500, "Open Large Calendar"], "isController": true}, {"data": [0.9863387978142076, 500, 1500, "Open Predefined Date"], "isController": true}, {"data": [0.9305555555555556, 500, 1500, "Open Contacts"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2677, 112, 4.183787822189018, 3364.2368322749353, 49, 85687, 346.0, 716.1999999999998, 82217.53999999996, 6.527341930796033, 156.9385139347595, 3.2541106199450893], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Comment", 278, 6, 2.158273381294964, 1894.607913669065, 88, 82866, 233.0, 498.0, 80917.34999999996, 0.7269551301328131, 1.7118604331135907, 1.6139020852890955], "isController": true}, {"data": ["Open Random Post", 918, 16, 1.7429193899782136, 1588.1427015250547, 54, 84167, 278.0, 540.0, 80542.78, 2.2842184887331793, 57.000386884841056, 0.9574048771050642], "isController": true}, {"data": ["Search By Name", 370, 2, 0.5405405405405406, 614.2729729729729, 54, 82183, 209.0, 490.89999999999907, 823.0, 0.9348651646499688, 21.045776967701673, 0.3986205053830547], "isController": true}, {"data": ["Open Random Page", 1128, 24, 2.127659574468085, 1902.7269503546102, 109, 85687, 275.1, 529.9999999999991, 80698.55, 2.8112569907587406, 73.1299681428258, 1.1578249456689693], "isController": true}, {"data": ["Open Random Date", 132, 6, 4.545454545454546, 3874.666666666667, 49, 84262, 192.0, 28377.59999999955, 84135.61, 0.36721749290602573, 9.14519565807044, 0.15095886016524787], "isController": true}, {"data": ["Open First Post", 510, 16, 3.1372549019607843, 2716.529411764706, 68, 84076, 354.0, 648.0, 82266.40999999999, 1.3160373341728446, 32.58305227764775, 0.543848194770945], "isController": true}, {"data": ["Open Home page", 1268, 32, 2.5236593059936907, 1815.519716088328, 63, 84095, 301.0, 519.55, 80052.15999999999, 3.0917704774932275, 89.00604943419138, 1.2449355647479647], "isController": false}, {"data": ["Open Large Calendar", 150, 4, 2.6666666666666665, 2305.866666666667, 55, 81945, 230.0, 896.0, 81346.77, 0.3995737879595098, 10.231908880527438, 0.16863262519978692], "isController": true}, {"data": ["Open Predefined Date", 366, 2, 0.546448087431694, 599.7349726775956, 60, 80899, 201.3, 331.99999999999955, 884.0, 0.9293231937232598, 20.466107713255553, 0.39803907410463774], "isController": true}, {"data": ["Open Contacts", 72, 4, 5.555555555555555, 4715.027777777777, 76, 84020, 470.0, 79588.2, 84020.0, 0.22672880715455346, 4.474695726791787, 0.08991903104925053], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 62, 55.357142857142854, 2.3160254015689206], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException", 50, 44.642857142857146, 1.8677624206200971], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2677, 112, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 62, "Non HTTP response code: java.net.SocketException", 50, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Comment", 142, 6, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3, "Non HTTP response code: java.net.SocketException", 3, null, null, null, null, null, null], "isController": false}, {"data": ["Open Random Post", 467, 16, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 8, "Non HTTP response code: java.net.SocketException", 8, null, null, null, null, null, null], "isController": false}, {"data": ["Search By Name", 186, 2, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1, "Non HTTP response code: java.net.SocketException", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Open Random Page", 576, 24, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 12, "Non HTTP response code: java.net.SocketException", 12, null, null, null, null, null, null], "isController": false}, {"data": ["Open Random Date", 69, 6, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3, "Non HTTP response code: java.net.SocketException", 3, null, null, null, null, null, null], "isController": false}, {"data": ["Open First Post", 263, 16, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 8, "Non HTTP response code: java.net.SocketException", 8, null, null, null, null, null, null], "isController": false}, {"data": ["Open Home page", 675, 32, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 22, "Non HTTP response code: java.net.SocketException", 10, null, null, null, null, null, null], "isController": false}, {"data": ["Open Large Calendar", 77, 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2, "Non HTTP response code: java.net.SocketException", 2, null, null, null, null, null, null], "isController": false}, {"data": ["Open Predefined Date", 184, 2, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1, "Non HTTP response code: java.net.SocketException", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Open Contacts", 38, 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2, "Non HTTP response code: java.net.SocketException", 2, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
