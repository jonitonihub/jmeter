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

    var data = {"OkPercent": 83.22755098208586, "KoPercent": 16.77244901791415};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.05430577984752319, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.09531485063399957, 500, 1500, "delete_character"], "isController": false}, {"data": [0.03460111317254174, 500, 1500, "get_character/id"], "isController": false}, {"data": [0.004533884823417118, 500, 1500, "get_characters"], "isController": false}, {"data": [0.09050683829444892, 500, 1500, "put_character"], "isController": false}, {"data": [0.06336838152459633, 500, 1500, "post_character"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 26627, 4466, 16.77244901791415, 4797.671386186947, 0, 161374, 2499.0, 13337.800000000105, 19896.450000000023, 28907.960000000006, 161.7482687401288, 779.4884442674796, 25.35558336054246], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["delete_character", 4653, 286, 6.1465721040189125, 2432.3397807865895, 0, 15577, 2126.0, 4195.4000000000015, 6713.0, 8571.880000000001, 83.55030435797525, 29.65908568036128, 14.16098918025354], "isController": false}, {"data": ["get_character/id", 5390, 3064, 56.84601113172542, 1327.0454545454581, 0, 12519, 824.0, 3339.0, 5004.999999999985, 5708.0, 87.66650944163428, 112.77882453279769, 6.019321397784754], "isController": false}, {"data": ["get_characters", 6286, 464, 7.381482659879096, 12056.514317531059, 0, 161374, 8153.5, 25028.0, 28413.65, 157084.52, 38.18491070343822, 702.3917238849319, 5.560521485086866], "isController": false}, {"data": ["put_character", 4972, 141, 2.835880933226066, 3000.1617055510887, 0, 58376, 2063.0, 4591.299999999953, 13508.94999999999, 16503.0, 71.70154161198678, 22.54487261241221, 15.166314326968836], "isController": false}, {"data": ["post_character", 5326, 511, 9.594442358242583, 3487.249530604577, 0, 111891, 3542.5, 5802.0, 6615.0, 9625.0, 38.64208548273585, 18.447557469309796, 7.605509476416429], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 798, 17.86833855799373, 2.996957974987794], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 3599, 80.58665472458576, 13.51635557892365], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 69, 1.5450067174205104, 0.25913546400270404], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 26627, 4466, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 3599, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 798, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 69, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["delete_character", 4653, 286, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 277, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 9, "", "", "", "", "", ""], "isController": false}, {"data": ["get_character/id", 5390, 3064, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 2943, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 121, "", "", "", "", "", ""], "isController": false}, {"data": ["get_characters", 6286, 464, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 252, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 145, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 67, "", "", "", ""], "isController": false}, {"data": ["put_character", 4972, 141, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 94, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 47, "", "", "", "", "", ""], "isController": false}, {"data": ["post_character", 5326, 511, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 476, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 10.0.107.201:3001 failed to respond", 33, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 2, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
