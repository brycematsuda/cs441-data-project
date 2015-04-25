google.load('visualization', '1', {packages: ['corechart']});
    function drawVisualization() {

    // The table id for the google fusion table that holds the data we want to query
    var tableId = '1fRrYNiGRZ8CiaihVL_jR37FRwbPdlYeJKuhJB92U';

    var queryString = "SELECT * FROM " + tableId + " WHERE Year > 2004 AND Year < 2015";
    var queryText = encodeURIComponent(queryString);

      google.visualization.drawChart({
        "containerId": "visualization_div",
        "dataSourceUrl": 'https://www.google.com/fusiontables/gvizdata?tq=',
	    "query": queryString,
        "refreshInterval": 500,
        "chartType": "AreaChart",
        "options": {
          "titleTextStyle": { color: "black",
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
          "legend": { "position": "right" }}
    })};

    google.setOnLoadCallback(drawVisualization);