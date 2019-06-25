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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9937530033637674, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9886363636363636, 500, 1500, "Comment"], "isController": true}, {"data": [0.9961832061068703, 500, 1500, "Search By Name"], "isController": true}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9964912280701754, 500, 1500, "Open Random Post"], "isController": true}, {"data": [1.0, 500, 1500, "Open Random Page"], "isController": true}, {"data": [1.0, 500, 1500, "Open Random Date"], "isController": true}, {"data": [1.0, 500, 1500, "Open First Post"], "isController": true}, {"data": [0.9466666666666667, 500, 1500, "Open Home page"], "isController": true}, {"data": [1.0, 500, 1500, "Open Large Calendar"], "isController": true}, {"data": [1.0, 500, 1500, "Open Predefined Date"], "isController": true}, {"data": [0.95, 500, 1500, "Open Contacts"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1256, 0, 0.0, 114.89171974522289, 0, 36155, 85.59999999999991, 172.14999999999986, 232.30000000000064, 2.9374826054722307, 60.47126955714994, 1.0119111221487591], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Comment", 88, 0, 0.0, 55.36363636363637, 24, 758, 52.000000000000085, 78.04999999999991, 758.0, 0.23823059638864072, 0.5603093106202117, 0.5408251187769025], "isController": true}, {"data": ["Search By Name", 262, 0, 0.0, 60.07633587786257, 0, 948, 73.0, 91.0, 454.71000000000356, 0.669354303028445, 15.642639010773538, 0.2847689801544113], "isController": true}, {"data": ["Debug Sampler", 427, 0, 0.0, 0.1756440281030446, 0, 2, 1.0, 1.0, 1.0, 1.1010603185081278, 3.960453388822562, 0.0], "isController": false}, {"data": ["Open Random Post", 285, 0, 0.0, 104.78596491228073, 0, 670, 195.0, 207.7, 340.6199999999948, 0.7459034199017501, 19.056099502534764, 0.31784216520059566], "isController": true}, {"data": ["Open Random Page", 233, 0, 0.0, 63.407725321888385, 0, 498, 77.0, 85.0, 421.83999999999924, 0.6150678422469774, 19.01876220896468, 0.2571719418193337], "isController": true}, {"data": ["Open Random Date", 90, 0, 0.0, 49.39999999999999, 31, 76, 66.0, 71.15000000000002, 76.0, 0.25130819879036986, 7.868711666773706, 0.10822940983061828], "isController": true}, {"data": ["Open First Post", 160, 0, 0.0, 62.40000000000001, 31, 220, 74.70000000000002, 184.69999999999993, 220.0, 0.4287613085795138, 10.937071866759743, 0.18339071644674784], "isController": true}, {"data": ["Open Home page", 150, 0, 0.0, 1203.9999999999986, 33, 36155, 90.0, 7337.0, 36155.0, 0.3591403616304015, 11.150536638003276, 0.14835583297818342], "isController": true}, {"data": ["Open Large Calendar", 92, 0, 0.0, 107.58695652173911, 76, 216, 130.0, 175.04999999999998, 216.0, 0.2511163760631503, 20.682864668062365, 0.10888249118363158], "isController": true}, {"data": ["Open Predefined Date", 254, 0, 0.0, 53.1023622047244, 31, 160, 68.0, 79.25, 147.89999999999975, 0.6561578085362514, 20.2402897443697, 0.28258358746531925], "isController": true}, {"data": ["Open Contacts", 40, 0, 0.0, 119.8, 26, 1560, 70.89999999999998, 1485.5999999999935, 1560.0, 0.1481245579407724, 3.1690844143340136, 0.062200742104035284], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1256, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
