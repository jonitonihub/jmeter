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

    var data = {"OkPercent": 85.3125, "KoPercent": 14.6875};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1936125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.24175, 500, 1500, "delete_character"], "isController": false}, {"data": [0.1626875, 500, 1500, "get_character/id"], "isController": false}, {"data": [0.05125, 500, 1500, "get_characters"], "isController": false}, {"data": [0.256375, 500, 1500, "put_character"], "isController": false}, {"data": [0.256, 500, 1500, "post_character"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 40000, 5875, 14.6875, 3007.69087499999, 0, 108331, 1786.0, 5945.0, 7769.0, 20285.99, 304.95475233862174, 1090.4933274470714, 49.46847786362042], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["delete_character", 8000, 426, 5.325, 2009.9172499999995, 0, 11944, 1725.0, 3302.0, 5202.149999999979, 7953.0, 63.49458311837772, 21.697126808107463, 10.855620510734553], "isController": false}, {"data": ["get_character/id", 8000, 3177, 39.7125, 1467.7262500000024, 0, 7586, 1345.0, 2976.0, 3770.0, 6299.0, 62.11951795254069, 61.244961282069205, 5.9583931476347995], "isController": false}, {"data": ["get_characters", 8000, 1223, 15.2875, 5784.9516249999915, 0, 41918, 3794.5, 13327.800000000001, 19966.95, 24271.98, 61.00862509437272, 961.2250120825677, 8.12577243830503], "isController": false}, {"data": ["put_character", 8000, 318, 3.975, 2079.3803750000066, 0, 13296, 1598.0, 4337.40000000002, 5944.95, 8553.0, 62.83232408912766, 20.342110653122376, 13.396070856699104], "isController": false}, {"data": ["post_character", 8000, 731, 9.1375, 3696.4788749999984, 6, 108331, 1770.5, 5846.0, 6465.0, 56579.92, 62.36844156856631, 29.478011469946203, 12.336320907558274], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1853, 31.540425531914895, 4.6325], "isController": false}, {"data": ["500/Internal Server Error", 153, 2.6042553191489364, 0.3825], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 3737, 63.60851063829787, 9.3425], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 132, 2.246808510638298, 0.33], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 40000, 5875, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 3737, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1853, "500/Internal Server Error", 153, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 132, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["delete_character", 8000, 426, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 387, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 39, "", "", "", "", "", ""], "isController": false}, {"data": ["get_character/id", 8000, 3177, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 2894, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 283, "", "", "", "", "", ""], "isController": false}, {"data": ["get_characters", 8000, 1223, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 854, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 369, "", "", "", "", "", ""], "isController": false}, {"data": ["put_character", 8000, 318, "500/Internal Server Error", 153, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 129, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 36, "", "", "", ""], "isController": false}, {"data": ["post_character", 8000, 731, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 548, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 132, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 51, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
