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

    var data = {"OkPercent": 74.293059125964, "KoPercent": 25.70694087403599};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.649390243902439, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9583333333333334, 500, 1500, "Search By Name"], "isController": true}, {"data": [0.0, 500, 1500, "Edit post - Get JSON"], "isController": false}, {"data": [0.9027777777777778, 500, 1500, "Home page"], "isController": true}, {"data": [0.0, 500, 1500, "Edit post"], "isController": true}, {"data": [1.0, 500, 1500, " Login page - Log in"], "isController": false}, {"data": [0.905, 500, 1500, "Edit post - Save changes"], "isController": false}, {"data": [0.75, 500, 1500, "Login"], "isController": true}, {"data": [0.95, 500, 1500, "Users"], "isController": false}, {"data": [0.9, 500, 1500, "Admin Page"], "isController": true}, {"data": [0.934375, 500, 1500, "Open Predefined Date"], "isController": true}, {"data": [0.95, 500, 1500, "Open Contacts"], "isController": true}, {"data": [0.915, 500, 1500, "Edit post - Open page"], "isController": false}, {"data": [1.0, 500, 1500, " Login page - Open"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [1.0, 500, 1500, " Log Out"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": true}, {"data": [1.0, 500, 1500, "Open Random Date"], "isController": true}, {"data": [0.0, 500, 1500, "Open Random Editor Post"], "isController": true}, {"data": [0.95, 500, 1500, "Admin page"], "isController": false}, {"data": [0.925, 500, 1500, "Open Large Calendar"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 778, 200, 25.70694087403599, 254.82390745501306, 0, 4365, 576.8000000000002, 1129.2999999999997, 2261.2500000000045, 0.8952263035438534, 12.051320225066567, 0.9996546891792685], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Search By Name", 120, 0, 0.0, 207.80000000000013, 31, 1785, 452.20000000000005, 594.6999999999995, 1785.0, 0.35665564006312805, 8.57728950629943, 0.16718233127959128], "isController": true}, {"data": ["Edit post - Get JSON", 100, 100, 100.0, 237.27999999999992, 13, 1913, 683.8000000000009, 1115.5499999999993, 1912.92, 0.12026892130804478, 0.033473283762492936, 0.16677916822014022], "isController": false}, {"data": ["Home page", 72, 0, 0.0, 436.13888888888874, 42, 4365, 771.0, 3753.0, 4365.0, 0.20923906725873573, 6.660913197754168, 0.09481145235161463], "isController": true}, {"data": ["Edit post", 100, 100, 100.0, 805.3500000000003, 54, 5513, 1714.6000000000001, 2769.099999999995, 5494.4399999999905, 0.12004801920768308, 2.4079944477791115, 0.5569946728691476], "isController": true}, {"data": [" Login page - Log in", 4, 0, 0.0, 388.0, 270, 471, 471.0, 471.0, 471.0, 0.7121239095602635, 23.483398611358375, 1.2514325930211856], "isController": false}, {"data": ["Edit post - Save changes", 100, 0, 0.0, 309.3499999999999, 9, 2479, 756.2000000000003, 1344.0499999999995, 2477.8099999999995, 0.12003577065965657, 0.0213344826758374, 0.24008560801118733], "isController": false}, {"data": ["Login", 4, 0, 0.0, 496.0, 292, 641, 641.0, 641.0, 641.0, 0.6631299734748011, 24.943789373342174, 1.4878331191976126], "isController": true}, {"data": ["Users", 20, 0, 0.0, 239.60000000000002, 16, 1431, 1229.2000000000019, 1425.3999999999999, 1431.0, 0.10843517203240043, 0.7970620506717558, 0.1371323708808189], "isController": false}, {"data": ["Admin Page", 20, 0, 0.0, 454.84999999999997, 41, 3941, 1725.3000000000031, 3837.3499999999985, 3941.0, 0.1066427786842414, 2.241477075801687, 0.26441993660086804], "isController": true}, {"data": ["Open Predefined Date", 320, 0, 0.0, 233.2687499999999, 31, 2235, 509.5000000000005, 1051.5999999999974, 1895.0, 0.3778017839327985, 6.308118384779311, 0.3563106180010744], "isController": true}, {"data": ["Open Contacts", 20, 0, 0.0, 271.0, 52, 1010, 952.4000000000012, 1010.0, 1010.0, 0.07164863509350147, 1.4944058089130903, 0.03295557336820234], "isController": true}, {"data": ["Edit post - Open page", 100, 0, 0.0, 258.7199999999999, 14, 2008, 828.1000000000003, 1284.8999999999992, 2007.81, 0.11984860723933527, 2.34933700499529, 0.1501618780156906], "isController": false}, {"data": [" Login page - Open", 4, 0, 0.0, 108.0, 22, 277, 277.0, 277.0, 277.0, 0.7367839381101492, 3.4176989316632898, 0.3583187511512249], "isController": false}, {"data": ["Debug Sampler", 20, 0, 0.0, 0.6000000000000001, 0, 3, 1.0, 2.8999999999999986, 3.0, 0.1092472319482605, 0.509482574383709, 0.0], "isController": false}, {"data": [" Log Out", 4, 0, 0.0, 26.0, 21, 31, 31.0, 31.0, 31.0, 0.005303000172347506, 0.024640307441434993, 0.006794468970820242], "isController": false}, {"data": ["Logout", 4, 0, 0.0, 26.0, 21, 31, 31.0, 31.0, 31.0, 0.005291474244410549, 0.02458675239736855, 0.006779701375651016], "isController": true}, {"data": ["Open Random Date", 40, 0, 0.0, 147.74999999999997, 38, 466, 393.9, 462.4499999999997, 466.0, 0.12973618147497062, 4.057613101570457, 0.061067226045835796], "isController": true}, {"data": ["Open Random Editor Post", 200, 200, 100.0, 302.53999999999996, 27, 2777, 969.0000000000009, 1150.75, 2766.710000000009, 0.23901858967081166, 0.3281837276144152, 0.2922375725272033], "isController": true}, {"data": ["Admin page", 20, 0, 0.0, 214.64999999999995, 15, 2619, 426.1000000000002, 2509.8499999999985, 2619.0, 0.1060113750205397, 0.9545682454852407, 0.1287872563726088], "isController": false}, {"data": ["Open Large Calendar", 40, 0, 0.0, 256.1000000000001, 98, 534, 513.9, 533.05, 534.0, 0.12904016697797607, 10.62061061807014, 0.061117657211248434], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 100, 50.0, 12.853470437017995], "isController": false}, {"data": ["404/Not Found", 100, 50.0, 12.853470437017995], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 778, 200, "500/Internal Server Error", 100, "404/Not Found", 100, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["Edit post - Get JSON", 100, 100, "500/Internal Server Error", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Open Random Editor Post", 100, 100, "404/Not Found", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
