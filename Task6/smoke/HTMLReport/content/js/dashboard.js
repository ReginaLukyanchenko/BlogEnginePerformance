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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9986899563318777, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Comment"], "isController": true}, {"data": [1.0, 500, 1500, "Open Random Post"], "isController": true}, {"data": [1.0, 500, 1500, "Search By Name"], "isController": true}, {"data": [0.998, 500, 1500, "Open Random Page"], "isController": true}, {"data": [1.0, 500, 1500, "Open Random Date"], "isController": true}, {"data": [1.0, 500, 1500, "Open First Post"], "isController": true}, {"data": [0.9981818181818182, 500, 1500, "Open Home page"], "isController": false}, {"data": [1.0, 500, 1500, "Open Large Calendar"], "isController": true}, {"data": [0.99375, 500, 1500, "Open Predefined Date"], "isController": true}, {"data": [1.0, 500, 1500, "Open Contacts"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1150, 0, 0.0, 52.10260869565207, 19, 6984, 61.0, 74.45000000000005, 149.3900000000001, 2.642001856293478, 65.73709617217007, 1.3921931860474732], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Comment", 130, 0, 0.0, 74.56923076923078, 25, 170, 141.0, 149.84999999999985, 170.0, 0.32901646853969835, 0.7737769366415517, 0.7469652580754561], "isController": true}, {"data": ["Open Random Post", 422, 0, 0.0, 45.62085308056873, 22, 331, 61.0, 67.0, 108.15999999999985, 0.9904824494490149, 25.127945262348756, 0.4226732024034456], "isController": true}, {"data": ["Search By Name", 160, 0, 0.0, 41.699999999999996, 19, 155, 52.900000000000006, 75.79999999999995, 155.0, 0.405501643548849, 9.205733753640011, 0.1738429897636179], "isController": true}, {"data": ["Open Random Page", 500, 0, 0.0, 41.91999999999998, 20, 625, 54.0, 58.0, 78.0, 1.1968623057791692, 31.56000136292695, 0.503617217103641], "isController": true}, {"data": ["Open Random Date", 60, 0, 0.0, 35.633333333333326, 22, 56, 50.8, 53.0, 56.0, 0.17573765882290915, 4.673580570590889, 0.07568389408291303], "isController": true}, {"data": ["Open First Post", 228, 0, 0.0, 50.84210526315789, 27, 125, 72.0, 76.0, 115.43000000000026, 0.5757386752455096, 14.65407227793027, 0.24565658987204966], "isController": true}, {"data": ["Open Home page", 550, 0, 0.0, 54.28181818181815, 24, 6984, 54.0, 60.899999999999864, 126.37000000000012, 1.2898777430422823, 37.9373656621646, 0.5328303567450052], "isController": false}, {"data": ["Open Large Calendar", 60, 0, 0.0, 41.83333333333332, 28, 82, 55.599999999999994, 60.0, 82.0, 0.17297047970479704, 4.538785927410055, 0.07499891893450185], "isController": true}, {"data": ["Open Predefined Date", 160, 0, 0.0, 53.375, 20, 1061, 47.80000000000001, 77.54999999999967, 1061.0, 0.4037712232249207, 8.935409853027274, 0.1738897553146387], "isController": true}, {"data": ["Open Contacts", 20, 0, 0.0, 66.60000000000001, 24, 324, 297.40000000000055, 324.0, 324.0, 0.19886843858445444, 4.12652010062743, 0.08350920760870646], "isController": true}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1150, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
