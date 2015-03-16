    google.load('visualization', '1', {packages: ['corechart']});
    
    function initialize() {
      console.log("Program Start =========================================================");
      
      chart = new google.visualization.ColumnChart(document.getElementById('visualization_div'));
      
      var requestedPlatforms = ["Arcade"];
      
      var tableId = '1ytXlre-hC1hF5w_1sJQFO16N0Kp5zLViP_NReDi5';
      var apiKey = '&key=AIzaSyBVKrRUJ_r7q80MIpTSQuu3jGo-i6iZFmI';
      
      var mergedData = null;
      var responses = [];
      var mergedResponses = null;
      
      requestedPlatforms.forEach(function (platform) {
        var queryText = encodeURIComponent(
          "SELECT 'Release Date',  COUNT() As '" + platform + " Releases'" +
          ' FROM ' + tableId +
          " WHERE 'Platforms' CONTAINS IGNORING CASE '" + platform + "' " +
          " GROUP BY 'Release Date'" );
        var query = new google.visualization.Query(
          'http://www.google.com/fusiontables/gvizdata?tq='  + queryText + apiKey);
        
        // Send the query with a callback function.
        query.send(function handleResponse(response) {
         if (response.isError()) {
          console.log("Query error========================================");
          console.log('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
          return;
        }
        responses.push(response);
        
        if (requestedPlatforms[requestedPlatforms.length-1] == platform) {
          var mergedResponses = null;
          responses.forEach(function mergeResponses(response){
              // Check if we have any reponse at all stored in mergedResponses
              // If we do not, store response in mergedResponses
              if (mergedResponses == null) {
                mergedResponses = response;
              }
              else {
                // If we have a response already, we need to add the column label of the new response to our labels
                // this will eventually end up as a series in the graph, each new label added is a new series
                mergedResponses.q.If.push(response.q.If[1]);
                // Now go through all of the (release date, quantity) pairs and add them to the total list
                response.q.Lf.forEach(function (row) {
                  // we need to have each pair store the quantities for each series, so each array "pair" has to be expanded
                  // as we add a new series. This is done by checking if the date already exists in the current set of responses
                  // and if it does, we just tack on the quantity from the newest response, otherwise we have to create a new
                  // date and add a 0 quantity for every response already merged, and then our quantity for the latest response
                  for (mRowIdx = 0; mRowIdx < mergedResponses.q.Lf.length; ++mRowIdx) {
                    var mRow = mergedResponses.q.Lf[mRowIdx];
                    if (mRow.c[0].v.getTime() == row.c[0].v.getTime()) {
                      mRow.c.push(row.c[1]);
                      break;
                    } else if (mRow.c[0].v.getTime() > row.c[0].v.getTime()) {
                      mergedResponses.q.Lf.splice(mRowIdx, 0, row);
                      for (numPlatforms = 0; numPlatforms < requestedPlatforms.length - 1; ++numPlatforms) {
                        var empty = JSON.parse(JSON.stringify(row.c[1]));
                        mergedResponses.q.Lf[mRowIdx].c.splice(1, 0, empty);
                        mergedResponses.q.Lf[mRowIdx].c[1].v = 0;
                      }
                      break;
                    }
                  }
                });
  }
});
    console.log("merged responses:====================");
    console.log(mergedResponses);
    mergedData = mergedResponses.getDataTable();
    
            // format the dates so that they are grouped by year
            var dateFormatter = new google.visualization.DateFormat({pattern: 'yyyy'});
            dateFormatter.format(mergedData,0);
            
            drawGraph(mergedData); // this is where it should be ran, after all responses have been merged
            console.log("graph complete=======================");
          }
        });    
  });
  }
  Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
      if (this[i] === obj) {
        return true;
      }
    }
    return false;
  }
  
  function drawGraph(dataTable) {
   var options = {
    width: 600,
    height: 360,
    is3D: true,
    hAxis: {
      title: 'Year'
    },
    vAxis: {
      title: 'Amount of Releases'
    },
    title: 'Amount of Arcade Releases'
  };
  
  chart.draw(dataTable, options);
}

google.setOnLoadCallback(initialize);

function transposeDataTable(dataTable) {
            //step 1: let us get what the columns would be
            var rows = [];//the row tip becomes the column header and the rest become
            for (var rowIdx=0; rowIdx < dataTable.getNumberOfRows(); rowIdx++) {
              var rowData = [];
              for( var colIdx = 0; colIdx < dataTable.getNumberOfColumns(); colIdx++) {
                rowData.push(dataTable.getValue(rowIdx, colIdx));
              }
              rows.push( rowData);
            }
            var newTB = new google.visualization.DataTable();
            newTB.addColumn('string', dataTable.getColumnLabel(0));
            newTB.addRows(dataTable.getNumberOfColumns()-1);
            var colIdx = 1;
            for(var idx=0; idx < (dataTable.getNumberOfColumns() -1);idx++) {
              var colLabel = dataTable.getColumnLabel(colIdx);
              newTB.setValue(idx, 0, colLabel);
              colIdx++;
            }
            for (var i=0; i< rows.length; i++) {
              var rowData = rows[i];
              console.log(rowData[0]);
                newTB.addColumn('number',rowData[0]); //assuming the first one is always a header
                var localRowIdx = 0;

                for(var j=1; j< rowData.length; j++) {
                  newTB.setValue(localRowIdx, (i+1), rowData[j]);
                  localRowIdx++;
                }
              }
              return newTB;
            }