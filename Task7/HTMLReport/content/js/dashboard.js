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

    var data = {"OkPercent": 99.97207093981288, "KoPercent": 0.027929060187124703};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.990146574093555, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9915397631133672, 500, 1500, "Search By Name"], "isController": true}, {"data": [0.9929925803792251, 500, 1500, "Home page"], "isController": true}, {"data": [1.0, 500, 1500, " Login page - Log in"], "isController": false}, {"data": [0.5, 500, 1500, "Login"], "isController": true}, {"data": [0.9894509709901702, 500, 1500, "Open Predefined Date"], "isController": true}, {"data": [0.9888111888111888, 500, 1500, "Open Contacts"], "isController": true}, {"data": [0.0, 500, 1500, "Add user"], "isController": true}, {"data": [1.0, 500, 1500, " Login page - Open"], "isController": false}, {"data": [0.0, 500, 1500, "Delete user"], "isController": true}, {"data": [1.0, 500, 1500, " Log Out"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": true}, {"data": [0.9936215450035436, 500, 1500, "Open Random Date"], "isController": true}, {"data": [0.983453237410072, 500, 1500, "Open Large Calendar"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7161, 2, 0.027929060187124703, 133.96844016198872, 0, 3232, 322.8000000000002, 411.89999999999964, 560.7600000000002, 10.3787722873301, 353.8458623436698, 4.798199804863573], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Search By Name", 4137, 0, 0.0, 125.72830553541183, 0, 1006, 306.0, 406.0999999999999, 541.0, 6.034306718399019, 148.24751487791357, 2.8151830612401176], "isController": true}, {"data": ["Home page", 2426, 0, 0.0, 125.64550700741962, 0, 897, 289.3000000000002, 387.0, 547.2200000000003, 3.5090764446373037, 110.95014509655023, 1.5813913674332827], "isController": true}, {"data": [" Login page - Log in", 1, 0, 0.0, 277.0, 277, 277, 277.0, 277.0, 277.0, 3.6101083032490977, 17.7896547833935, 4.403344990974729], "isController": false}, {"data": ["Login", 1, 0, 0.0, 687.0, 687, 687, 687.0, 687.0, 687.0, 1.455604075691412, 13.924899927219796, 2.4819186681222707], "isController": true}, {"data": ["Open Predefined Date", 4171, 0, 0.0, 130.17070246943186, 0, 3232, 321.0, 413.0, 594.0, 6.051838911684648, 195.37105022202894, 2.831123283728374], "isController": true}, {"data": ["Open Contacts", 715, 0, 0.0, 138.4587412587411, 0, 992, 364.0, 424.0, 613.0, 1.0790465755740075, 23.524830616097866, 0.49457283903945237], "isController": true}, {"data": ["Add user", 2, 2, 100.0, 1965.0, 1965, 1965, 1965.0, 1965.0, 1965.0, 0.5050505050505051, 0.0946969696969697, 0.3787878787878788], "isController": true}, {"data": [" Login page - Open", 1, 0, 0.0, 410.0, 410, 410, 410.0, 410.0, 410.0, 2.4390243902439024, 11.313833841463415, 1.1837842987804879], "isController": false}, {"data": ["Delete user", 2, 2, 100.0, 848.0, 848, 848, 848.0, 848.0, 848.0, 0.6664445184938355, 0.12886329556814397, 0.3957014328557148], "isController": true}, {"data": [" Log Out", 1, 0, 0.0, 319.0, 319, 319, 319.0, 319.0, 319.0, 3.134796238244514, 14.565781739811912, 1.6439312304075235], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 319.0, 319, 319, 319.0, 319.0, 319.0, 3.134796238244514, 14.565781739811912, 1.6439312304075235], "isController": true}, {"data": ["Open Random Date", 1411, 0, 0.0, 131.76754075123986, 0, 1148, 327.0, 396.1999999999996, 543.0799999999981, 2.081824096929494, 65.8239270020774, 0.9716506616910432], "isController": true}, {"data": ["Open Large Calendar", 1390, 0, 0.0, 182.2877697841725, 0, 1007, 384.0, 475.0, 615.0, 2.063870097937318, 170.64757323119653, 0.9670795087395248], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["417/Expectation Failed", 1, 50.0, 0.013964530093562352], "isController": false}, {"data": ["401/Unauthorized", 1, 50.0, 0.013964530093562352], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7161, 2, "417/Expectation Failed", 1, "401/Unauthorized", 1, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Add user", 1, 1, "401/Unauthorized", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Delete user", 1, 1, "417/Expectation Failed", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
