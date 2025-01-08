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
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
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

    var data = {"OkPercent": 61.01539589442815, "KoPercent": 38.98460410557185};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "delete_character"], "isController": false}, {"data": [0.0, 500, 1500, "get_character/id"], "isController": false}, {"data": [0.0, 500, 1500, "get_characters"], "isController": false}, {"data": [0.0, 500, 1500, "put_character"], "isController": false}, {"data": [0.0, 500, 1500, "post_character"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5456, 2127, 38.98460410557185, 13742.552236070365, 0, 61274, 10105.0, 40338.3, 48102.3, 60851.880000000005, 83.33333333333333, 1402.1335277389571, 9.242082970582846], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["delete_character", 562, 75, 13.345195729537366, 5608.537366548048, 2173, 13960, 3142.0, 12789.0, 12829.7, 13589.1, 20.543188215082065, 10.723553672277662, 3.214799342946961], "isController": false}, {"data": ["get_character/id", 1233, 878, 71.20843471208434, 4245.158150851587, 0, 13461, 2828.0, 10751.0, 11982.0, 13423.54, 25.460477409762948, 39.92041019658049, 1.1661158059387131], "isController": false}, {"data": ["get_characters", 1786, 451, 25.251959686450167, 29017.291713325867, 2389, 61274, 22437.0, 54232.6, 54619.7, 61183.26, 27.278836754643205, 1338.8646518263533, 3.2059118544950516], "isController": false}, {"data": ["put_character", 724, 237, 32.73480662983425, 7789.1588397790065, 2585, 13960, 6274.0, 13572.0, 13609.0, 13644.0, 19.580797836375933, 17.458269945909397, 2.866960361730899], "isController": false}, {"data": ["post_character", 1151, 486, 42.2241529105126, 7931.236316246734, 2074, 14133, 7226.0, 13390.0, 13564.599999999999, 13643.0, 25.88203548379843, 28.562218742270247, 3.2554791676036072], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 760, 35.731076633756466, 13.929618768328446], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 1367, 64.26892336624354, 25.0549853372434], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5456, 2127, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 1367, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 760, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["delete_character", 562, 75, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 41, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 34, "", "", "", "", "", ""], "isController": false}, {"data": ["get_character/id", 1233, 878, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 792, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 86, "", "", "", "", "", ""], "isController": false}, {"data": ["get_characters", 1786, 451, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 369, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 82, "", "", "", "", "", ""], "isController": false}, {"data": ["put_character", 724, 237, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 171, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 66, "", "", "", "", "", ""], "isController": false}, {"data": ["post_character", 1151, 486, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 288, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 198, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
