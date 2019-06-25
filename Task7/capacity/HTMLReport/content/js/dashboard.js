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

    var data = {"OkPercent": 92.23766171538092, "KoPercent": 7.76233828461907};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9335274753102051, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9810756972111554, 500, 1500, "Search By Name"], "isController": true}, {"data": [0.0, 500, 1500, "Edit post - Get JSON"], "isController": false}, {"data": [0.9434571890145396, 500, 1500, "Home page"], "isController": true}, {"data": [0.0, 500, 1500, "Edit post"], "isController": true}, {"data": [0.9166666666666666, 500, 1500, " Login page - Log in"], "isController": false}, {"data": [1.0, 500, 1500, "Edit post - Save changes"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "Login"], "isController": true}, {"data": [0.9821428571428571, 500, 1500, "Users"], "isController": false}, {"data": [0.8793103448275862, 500, 1500, "Admin Page"], "isController": true}, {"data": [0.9665461121157324, 500, 1500, "Open Predefined Date"], "isController": true}, {"data": [0.967032967032967, 500, 1500, "Open Contacts"], "isController": true}, {"data": [0.9848484848484849, 500, 1500, "Edit post - Open page"], "isController": false}, {"data": [1.0, 500, 1500, " Login page - Open"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [1.0, 500, 1500, " Log Out"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": true}, {"data": [0.9662921348314607, 500, 1500, "Open Random Date"], "isController": true}, {"data": [0.0, 500, 1500, "Open Random Editor Post"], "isController": true}, {"data": [0.9137931034482759, 500, 1500, "Admin page"], "isController": false}, {"data": [0.9682080924855492, 500, 1500, "Open Large Calendar"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2087, 162, 7.76233828461907, 1209.5864877815047, 0, 28939, 408.4000000000001, 948.1999999999985, 26471.799999999996, 7.01034252258123, 177.50944313628014, 3.782683449402593], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Search By Name", 1004, 14, 1.3944223107569722, 460.38247011952194, 30, 28332, 376.0, 432.25, 23865.40000000009, 3.4809259817840785, 80.3495373861505, 1.608931487471787], "isController": true}, {"data": ["Edit post - Get JSON", 33, 33, 100.0, 74.54545454545452, 10, 405, 280.80000000000007, 345.4999999999998, 405.0, 0.13634560719243738, 0.037947752001801414, 0.18907300997388773], "isController": false}, {"data": ["Home page", 619, 22, 3.5541195476575123, 915.3424878836831, 0, 28472, 402.0, 588.0, 26049.999999999905, 2.061677119380764, 63.375650727249116, 0.8994857464503516], "isController": true}, {"data": ["Edit post", 33, 33, 100.0, 264.6060606060606, 52, 1182, 553.4000000000002, 857.8999999999987, 1182.0, 0.13630731102850063, 2.7341329770755887, 0.6313531017657993], "isController": true}, {"data": [" Login page - Log in", 6, 0, 0.0, 276.1666666666667, 74, 766, 766.0, 766.0, 766.0, 0.03096726244238799, 1.0211938653853103, 0.05433383612124716], "isController": false}, {"data": ["Edit post - Save changes", 33, 0, 0.0, 108.21212121212123, 11, 388, 365.0, 373.99999999999994, 388.0, 0.1377100077618368, 0.024475802160795215, 0.27434415608803425], "isController": false}, {"data": ["Login", 6, 0, 0.0, 469.83333333333337, 92, 1114, 1114.0, 1114.0, 1114.0, 0.03126123450615065, 1.175898662800694, 0.07005284451182976], "isController": true}, {"data": ["Users", 28, 0, 0.0, 139.89285714285717, 14, 1273, 425.70000000000005, 906.6999999999977, 1273.0, 0.11090865879743327, 0.8152436277033985, 0.1402604620533946], "isController": false}, {"data": ["Admin Page", 29, 1, 3.4482758620689653, 1155.3103448275863, 32, 22149, 873.0, 13617.0, 22149.0, 0.10175367190405682, 2.073902661209395, 0.24359752299983858], "isController": true}, {"data": ["Open Predefined Date", 1106, 34, 3.0741410488245933, 846.1835443037974, 23, 28091, 358.9000000000002, 451.0, 25333.83, 3.8013665672216344, 60.27385853743625, 1.910967552621087], "isController": true}, {"data": ["Open Contacts", 182, 6, 3.2967032967032965, 928.1923076923076, 29, 28601, 360.80000000000007, 415.0, 27327.77999999998, 0.6816938969668367, 13.805735264924225, 0.30321566622468926], "isController": true}, {"data": ["Edit post - Open page", 33, 0, 0.0, 81.84848484848484, 18, 886, 246.20000000000002, 514.9999999999985, 886.0, 0.1364403135646479, 2.674576576350759, 0.17095011943695632], "isController": false}, {"data": [" Login page - Open", 6, 0, 0.0, 193.66666666666666, 18, 363, 363.0, 363.0, 363.0, 0.031285358973423084, 0.14512251476929655, 0.015214949969496776], "isController": false}, {"data": ["Debug Sampler", 28, 0, 0.0, 0.6071428571428572, 0, 3, 1.0, 2.0999999999999943, 3.0, 0.11101199325998612, 0.5178365670532263, 0.0], "isController": false}, {"data": [" Log Out", 2, 0, 0.0, 179.5, 46, 313, 313.0, 313.0, 313.0, 0.02539553546486528, 0.11799995873225486, 0.03253802981435863], "isController": false}, {"data": ["Logout", 2, 0, 0.0, 179.5, 46, 313, 313.0, 313.0, 313.0, 0.025264328032035165, 0.11739030544572591, 0.03236992029104506], "isController": true}, {"data": ["Open Random Date", 356, 10, 2.808988764044944, 828.744382022472, 30, 28939, 417.0, 470.0, 25675.27, 1.2756838883991601, 39.25545670647804, 0.5836013030967585], "isController": true}, {"data": ["Open Random Editor Post", 68, 68, 100.0, 819.0735294117646, 32, 26150, 400.1, 453.0, 26150.0, 0.24471875337387988, 0.34409357343362, 0.2904067099722892], "isController": true}, {"data": ["Admin page", 29, 1, 3.4482758620689653, 961.7931034482758, 14, 20471, 520.0, 12140.0, 20471.0, 0.10241704219582139, 0.8992875724865445, 0.12013033451524954], "isController": false}, {"data": ["Open Large Calendar", 346, 6, 1.7341040462427746, 603.5375722543353, 76, 28263, 422.1000000000002, 495.0, 24471.759999999966, 1.2523844168630305, 101.34385304571926, 0.5828841625855584], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 33, 20.37037037037037, 1.5812170579779588], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 48, 29.62962962962963, 2.2999520843315766], "isController": false}, {"data": ["404/Not Found", 33, 20.37037037037037, 1.5812170579779588], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException", 48, 29.62962962962963, 2.2999520843315766], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2087, 162, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 48, "Non HTTP response code: java.net.SocketException", 48, "500/Internal Server Error", 33, "404/Not Found", 33, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Search By Name", 509, 14, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 7, "Non HTTP response code: java.net.SocketException", 7, null, null, null, null, null, null], "isController": false}, {"data": ["Edit post - Get JSON", 33, 33, "500/Internal Server Error", 33, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Home page", 321, 22, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 11, "Non HTTP response code: java.net.SocketException", 11, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Admin Page", 1, 1, "Non HTTP response code: java.net.SocketException", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open Predefined Date", 570, 34, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 17, "Non HTTP response code: java.net.SocketException", 17, null, null, null, null, null, null], "isController": false}, {"data": ["Open Contacts", 94, 6, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3, "Non HTTP response code: java.net.SocketException", 3, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Open Random Date", 183, 10, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 5, "Non HTTP response code: java.net.SocketException", 5, null, null, null, null, null, null], "isController": false}, {"data": ["Open Random Editor Post", 35, 35, "404/Not Found", 33, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1, "Non HTTP response code: java.net.SocketException", 1, null, null, null, null], "isController": false}, {"data": ["Admin page", 29, 1, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Open Large Calendar", 176, 6, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 3, "Non HTTP response code: java.net.SocketException", 3, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
