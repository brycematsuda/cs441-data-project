/**
* data-controller.js
*
* Data controllers that defines UI behavior on AGOP visualization.
*
* This code is a modified version of Dr. Crenshaw's code from
* the project: The Librarians
*/

google.load('visualization', '1', {packages: ['corechart']});
google.setOnLoadCallback(function() {
  angular.bootstrap(document.body, ['agop']);
    });

var agop = angular.module('agop', []);

// ButtonController:
// Data controller that defines button and checkbox behavior
agop.controller('ButtonController',  ['$scope', function($scope) {

  // At the beginning of execution,
  // the default start and end year is 2005 and 2014, respectively.
  $scope.startYear = 2005;
  $scope.endYear = 2014;

  // List of consoles that we will be using in the simulation
  $scope.consoles = {"PC": true, "PlayStation 4": true, "PlayStation 3": true, "Xbox One": true, "Xbox 360": true, "Wii U": true, "Wii": true, "Nintendo 3DS": true};

    // Create the chart that will be used to animate year-by-year information.
    $scope.chart = new google.visualization.AreaChart(document.getElementById('visualization_div'));

    // State the options here, since they are a bit cumbersome
    // to have inline in the JavaScript function.  This
    // variable shouldn't be exposed to other controllers, so
    // I'm not adding it to the scope.
    var options = { "titleTextStyle": { color: "black",
    fontName: "Open Sans",
    fontSize: 16,
    bold: false,
    italic: false },
    "title":"Video Game Releases Across Time by Platform",
    "titleFontSize": 12,
    "animation": {
      startup: true,
      duration: 850,
      easing: 'in'
    },
    "vAxis": {"title": "Number of Releases",
              "textStyle" : { color: "black",
                  fontName: "Open Sans",
                  fontSize: 12,
                  bold: false,
                  italic: false },
              "titleTextStyle" : { color: "black",
                  fontName: "Open Sans",
                  fontSize: 14,
                  bold: false,
                  italic: false }},
    "hAxis": {"title": "Years",
              "format": '####',
                  gridlines : { count : -1 },
              "textStyle" : { color: "black",
                  fontName: "Open Sans",
                  fontSize: 12,
                  bold: false,
                  italic: false },
              "titleTextStyle" : { color: "black",
                  fontName: "Open Sans",
                  fontSize: 14,
                  bold: false,
                  italic: false }},
    "legend": { "position": "right" }
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

      var data2 = data.Lf.sort(function(arr1, arr2){
        return arr1.c[0].v - arr2.c[0].v;
      });

        // Create a view for 2014 that is the first two columns of
        // the data, just the rows that have 2014 for the value.
        var thisYear = $scope.startYear;
        var endYear = $scope.endYear;

        views[thisYear + "," + endYear] = new google.visualization.DataView(data2);
        views[thisYear + "," + endYear].setRows(views[thisYear + "," + endYear].getFilteredRows([{column: 0, minValue: thisYear, maxValue: endYear}]));
        views[thisYear + "," + endYear].setColumns([0, 1, 2, 3, 4, 5, 6, 7, 8]);

        // Draw the chart for 2014.
        $scope.chart.draw(views[thisYear + "," + endYear].toDataTable(), options);

        data = data2;

      });

    // get()
    // Get a new chart.
    $scope.get = function() {

      // Convert new console array to respective
      // column numbers on Google fusion table
      var consoleArray = []
      var num = 0;

      for (var x in $scope.consoles) {
        if ($scope.consoles[x]){
          consoleArray.push(num + 1);
        }
        num++;
      }

      // If the view of data for the selected year hasn't been created
      // yet, create it.
      if (views[thisYear + "," + endYear] === undefined) {
        var thisYear = $scope.startYear;
        var endYear = $scope.endYear;
        views[thisYear + "," + endYear] = new google.visualization.DataView(data);
        views[thisYear + "," + endYear].setRows(views[thisYear + "," + endYear].getFilteredRows([{column: 0, minValue: thisYear, maxValue: endYear}]));
        views[thisYear + "," + endYear].setColumns([0].concat(consoleArray));

      }

      // Draw the chart for selected year.
      if($scope.endYear - $scope.startYear <=0 ){
          options.hAxis.gridlines.count = -1;
          options.hAxis.ticks = [$scope.startYear];
      }
      else{
          options.hAxis.gridlines.count = $scope.endYear - $scope.startYear +1;
          options.hAxis.ticks = null;
      }
      $scope.chart.draw(views[thisYear + "," + endYear].toDataTable(), options);
  };

  // minusStart():
  // decrements start year and gets new graph
  $scope.minusStart = function(){
    $scope.startYear = $scope.startYear - 1;
    $scope.get();
  };

  // plusStart():
  // increments start year and gets new graph
  $scope.plusStart = function(){
    // Bounds checking
    if ($scope.startYear < $scope.endYear) {
      $scope.startYear = $scope.startYear + 1;
    }
    $scope.get();
  };

  // minusEnd():
  // decrements end year and gets new graph
  $scope.minusEnd = function(){
    // Bounds checking
    if ($scope.endYear > $scope.startYear){
      $scope.endYear = $scope.endYear - 1;
    }
    $scope.get();

  };

  // plusEnd():
  // increments end year and gets new graph
  $scope.plusEnd = function(){
    $scope.endYear = $scope.endYear + 1;
    $scope.get();

  };

}]);


