/**
* data-controller.js
* 
* Data controllers that defines UI behavior on AGOP visualization.
*
* This code is a modified version of Dr. Crenshaw's code from
* the project: The Librarians
*/

var agop = angular.module('agop', []);

// ButtonController:
// Data controller that defines button behavior
agop.controller('ButtonController', ['$scope', function($scope) {

    // Create the chart that will be used to animate year-by-year information.
    $scope.chart= new google.visualization.AreaChart(document.getElementById('visualization_div'));

    // State the options here, since they are a bit cumbersome
    // to have inline in the JavaScript function.  This
    // variable shouldn't be exposed to other controllers, so
    // I'm not adding it to the scope.
    var options = { "titleTextStyle": { color: "black",
                    fontName: "Open Sans",
                    fontSize: 16,
                    bold: false,
                    italic: false },
            "title":"Visualization of Video Game Releases Across Time by Platform",
            "titleFontSize": 12,
            "animation": {
            startup: true,
            duration: 850,
            easing: 'in'
            },
            "bar": {"groupWidth": "95%"},
            "vAxis": {"title": "Number of Releases",
                  "viewWindow" : {max : 3000},
                  "textStyle" : { color: "black",
                          fontName: "Open Sans",
                          fontSize: 12,
                          bold: false,
                          italic: false },
                  "titleTextStyle" : { color: "black",
                           fontName: "Open Sans",
                           fontSize: 16,
                           bold: false,
                           italic: false }},
            "hAxis": {"title": "Years",
                  "textStyle" : { color: "black",
                          fontName: "Open Sans",
                          fontSize: 12,
                          bold: false,
                          italic: false },
                  "titleTextStyle" : { color: "black",
                           fontName: "Open Sans",
                           fontSize: 16,
                           bold: false,
                           italic: false }},
            "legend": { "position": "none" }
    };

    // The table id for the google fusion table that holds the data we want to query
    var tableId = '1fRrYNiGRZ8CiaihVL_jR37FRwbPdlYeJKuhJB92U';

    // Make the initial query to get the whole Fusion table.
    var query = "SELECT * FROM " + tableId;
    var opts = {sendMethod: 'auto'};
    var queryObj = new google.visualization.Query('https://www.google.com/fusiontables/gvizdata?tq=', opts);


    // Define the variables to hold the entire fusion table,
    // and a collection of views, one for each year.
    var data;
    var views = {};

    // Send the query and handle the response by creating and
    // drawing the data for 2014.
    queryObj.setQuery(query);
    queryObj.send(function(e) {

        data = e.getDataTable();

        // Create a view for 2014 that is the first two columns of
        // the data, just the rows that have 2014 for the value.
        var thisYear = $scope.year;
                views[thisYear] = new google.visualization.DataView(data);
                views[thisYear].setRows(views[thisYear].getFilteredRows([{column: 8, value: thisYear}]));
        views[thisYear].setColumns([0, 1, 2, 3, 4, 5, 6, 7]);

        // Draw the chart for 2014.
        $scope.chart.draw(views[thisYear].toDataTable(), options);
    });

  // At the beginning of execution,
  // the default start and end year is 2005 and 2015, respectively.
  $scope.startYear = 2005;
  $scope.endYear = 2014;

    // get()
    //    Get a new chart.
    $scope.get = function() {

    // If the view of data for the selected year hasn't been created
    // yet, create it.
    if (views[thisYear] === undefined) {

        var thisYear = $scope.year;
                views[thisYear] = new google.visualization.DataView(data);
                views[thisYear].setRows(views[thisYear].getFilteredRows([{column: 8, value: thisYear}]));
                views[thisYear].setColumns([0, 1, 2, 3, 4, 5, 6, 7]);

    }
    // Draw the chart for selected year.
    $scope.chart.draw(views[thisYear].toDataTable(), options);

    };

  // minusStart():
  // decrements start year
  $scope.minusStart = function(){
    $scope.startYear = $scope.startYear - 1;
  };

  // plusStart():
  // increments start year
  $scope.plusStart = function(){
    $scope.startYear = $scope.startYear + 1;
  };

  // minusEnd():
  // decrements end year
  $scope.minusEnd = function(){
    $scope.endYear = $scope.endYear - 1;
  };

  // plusEnd():
  // increments end year
  $scope.plusEnd = function(){
    $scope.endYear = $scope.endYear + 1;
  };

}]);