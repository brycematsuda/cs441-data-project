    google.load('visualization', '1', {packages: ['corechart']});

    function initialize() {
      console.log("Script Start =========================================================");

      chart = new google.visualization.AreaChart(document.getElementById('visualization_div'));

      var requestedPlatforms = ["Xbox One", "PC", "Nintendo 3DS", "PlayStation 3", "PlayStation 4", "Xbox 360"];

      //var tableId = '1nUHwHAw-JkDrJiqhT_1-hPOW1V66y57gLql8gbFa';  // Alternate table
      var tableId = '1ytXlre-hC1hF5w_1sJQFO16N0Kp5zLViP_NReDi5';    // The table id for the google fusion table that holds the data we want to query
      var apiKey = '&key=AIzaSyBVKrRUJ_r7q80MIpTSQuu3jGo-i6iZFmI';  // The api key that allows us access to the data in the fusion table

      var responses = [];  // This will hold the response for each query for each platform in requestedPlatforms

      // Go through the list of requested platforms and generate a query for each platform
      requestedPlatforms.forEach(function (platform) {
        var queryText = encodeURIComponent(
          "SELECT 'Release Date',  COUNT() As '" + platform + " Releases'" +
          ' FROM ' + tableId +
          " WHERE 'Platforms' CONTAINS IGNORING CASE '" + platform + "' AND 'Release Date' >= '2014-07-01' AND 'Release Date' <= '2014-10-27' " +
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
          // Add the latest response to our array of responses
          responses.push(response);

          // Print to the console the platform for the response we received
          console.log("Got a response for platform: " + platform);

          // If we are at the last platform then it is time to merge them
          // once they are merged, convert the merged response to a data table and graph it
          if (responses.length == requestedPlatforms.length) {
            console.log("Merging all responses...");
            mergeResponses(responses, function(mergedResponses)
            {
              console.log("Responses have been merged!");
              // Sort the arrays contained in mergedResponses.q.Lf by date
              mergedResponses.q.Lf.sort(function(arr1,arr2)
              {
                // note that the dates are stored in the 0th element of each array
                return arr1.c[0].v.getTime() - arr2.c[0].v.getTime();
              });

              // log the mergedResponses for an in-depth view of the data
              console.log("Merged Responses:");
              console.log(mergedResponses);

              // Convert the single, merged response to a data table and graph it
              convertToDataTableAndGraph(mergedResponses, requestedPlatforms);
            });
          }
        });
      });
    }

    /**************************************************************************
     *
     * Response Merging and Conversion *
     *
     *************************************************************************/

    /**
     * Given two google fusion table responses, merge the second one into the first
     *
     * Note that the second response represents a single platform's set of dates
     * and release number counts, whereas the first holds the combination of all
     * mergings already processed.
     *
     * Also note that since not all platforms release games on the same dates,
     * zeros are padded to ensure that if any new dates are added or any
     * pre-existing dates do not have data for the new platform being merged,
     * that the areas in the area chart are connected (no missing values, just 0
     * if no count) for that platform on that date.
     *
     */
    function mergeResponses(responses, callback) {
      setTimeout(function() {
        var mergedResponses = null;  // This will hold a single response that holds the values of all responses so it can be converted into a single data table with multiple series
        responses.forEach(function merge(response)
        {
          // Check if we have any reponse at all stored in mergedResponses
          // If we do not, store response in mergedResponses
          if (mergedResponses === null) mergedResponses = response;
          else  // once we have at least one response in mergedResponses, we can merge any new responses into mergedResponses
          {
            // Bail out if the response doesn't have the fields we need
            if (response.q === undefined || response.q.If === undefined || response.q.Lf === undefined) return;

             // The platform's release count is stored at .q.If[1]
             // when graphing, it acts as a series label so we want to add
             // a new series for every response (platform) for our area chart overlay
            mergedResponses.q.If.push(response.q.If[1]);

            // Merge the date - quantity pairs from the latest response (platform)
            // into the current collection of merged responses
            mergeArrays(mergedResponses.q.Lf, response.q.Lf);
          }
        });// end responses.forEach

        // If we were given a callback function then run the function
        // and give it the mergedResponses
        if (callback) {
          callback(mergedResponses);
        }
      }, 2000);
    }

    /**
     * This function handles the merging of two arrays extracted from google
     * fusion table responses.
     *
     * Each array contains other arrays which contain a date (@ 0) and a count
     * of the number of releases on any given platform for that date.
     *
     * Note that arr2 contains a single platform's date,count pair and arr1
     * contains the current collection of merged platform pairs, stored as follows
     *   date (@ 0),
     *   platform 1 releases count (@ 1),
     *   platform 2 releases count (@ 2),
     *   ...
     *   platform n releases count (@ n)
     *
     */
    function mergeArrays(arr1, arr2) {
      // Used to hold the resulting array of arr1 and arr2 merged
      var merger = [];
      // Calculate the number of platforms based on the length of one of the
      // arrays contained in arr1 (any array will do)
      var numPlatforms = arr1[0].c.length-1;

      // go through and store all of the first array into merger
      for (var i = 0; i < arr1.length; i++)
      {
        merger[i] = arr1[i];
      }

      // go through the second array and add values to merger that aren't there
      for (var i = 0; i < arr2.length; i++)
      {
        // arr2[i][0] holds the date value, check if the date is already in merger
        var dateIdx = getDateIndex(arr2[i].c[0].v.getTime(), merger);
        if (dateIdx < 0)
        {
          // if the date doesn't exist in merger yet, add a new array to merger
          // and fill in the new date (@ [0]) and value (@ [1])
          merger[merger.length] = arr2[i];

          // because this is a new platform we just merged, we need to pad zeros directly after the date (@ [0])
          padZeros(merger, numPlatforms);
        }
        else
        {
          // if the date is already there, simply add the value to the end of the merger[dateIdx] array
          merger[dateIdx].c[merger[dateIdx].c.length] = arr2[i].c[1];
        }
      }

      // go through and add a zero at the end of any array whose dates (@ 0) did not have values
      // for the latest merged platform
      for (var i = 0; i < arr1.length; i++) {
        if (merger[i].c.length == numPlatforms+1) {
         merger[i].c[merger[i].c.length] = deepCopy(merger[i].c[1]);  // copy the structure
         merger[i].c[merger[i].c.length-1].v = 0;  // set the value to 0
        }
      }
    }

    /**
     * Given a collection of responses merged into a single response and a list
     * of platform names, convert the merged response into a data table and
     * draw the graph using the data table and the platform names (for the title)
     */
    function convertToDataTableAndGraph(mergedResponses, requestedPlatforms) {
      console.log("Converting the merged response into a data table for graphing...")

      // Take the mergedResponses and create a data table from them
      var mergedData = mergedResponses.getDataTable();

      // This may not be needed - was originally intended to be used for a yearly
      // scope instead of a monthly format the dates so that they are grouped by year
      //var dateFormatter = new google.visualization.DateFormat({pattern: 'yyyy'});
      //dateFormatter.format(mergedData,0);

      console.log("Conversion complete!")
      console.log("Drawing graph...");

      // Draw the graph using the data table and our list of requested platforms (for the graph title)
      drawGraph(mergedData, requestedPlatforms); // this is where it should be ran, after all responses have been merged
      console.log("Graph complete!");
    }

    /**************************************************************************
     *
     * HELPER METHODS *
     *
     *************************************************************************/

    /**
     * Used to create a copy of an object so that it's data
     * can be stored in a new location without the new
     * location simply referencing the original data
     *
     * source: http://james.padolsey.com/javascript/deep-copying-of-objects-and-arrays/
     */
    function deepCopy(obj) {
      if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++ ) {
          out[i] = arguments.callee(obj[i]);
        }
        return out;
      }
      if (typeof obj === 'object') {
        var out = {}, i;
        for ( i in obj ) {
          out[i] = arguments.callee(obj[i]);
        }
        return out;
      }
      return obj;
    }

    /**
     * Given a specific type of array (part of a fusion table query response),
     * pad zeros directly after the date element in the array at the end of arr
     *
     */
    function padZeros(arr, numZeros) {
      // now we need to add the largestLen - 2 zeros to arr directly after the date (@ 0)
      // to maintain the proper structure, simply copy what arr[1] looks like and set it's contained value to zero
      var sampleElement = deepCopy(arr[arr.length - 1].c[1]);
      sampleElement.v = 0;
      for (var count = 0; count < numZeros; count++) {
        // the array that needs padding is the last element
        // use splice to insert each sample direclty after the date (@ 0)
        arr[arr.length - 1].c.splice(1, 0, sampleElement);
      }
    }

    /**
     * This function simply uses the getDateIndex function
     * with the date and array parameters to determine
     * whether the date exists in the array or not given that
     * getDateIndex will return -1 ( < 0) if the date was not found
     *
     */
    function dateExists(date, array) {
      return getDateIndex(date, array) > 0 ? true : false;
    }

    /**
     * Given a date and a specific type of array ((part of a fusion table query response), return
     * the index of the date's location in the array or -1 if the date was not found in the array
     *
     */
    function getDateIndex(date, array) {
      // Go through the array and look for the date
      for (var i = 0; i < array.length; i++) {
        if (array[i].c[0].v.getTime() == date) {
          return i;  // Date found
        }
      }
      return -1;  // Date not found
    }

    /**************************************************************************
     *
     * Graphing (Visualization) *
     *
     *************************************************************************/

    /**
     * Given a data table and a list of platform nammes, draw a google chart
     * using the data table and with the title containing the platform names
     *
     */
    function drawGraph(dataTable, platforms)
    {
      // Part of the title for the graph (will contain platform names)
      var title = "";

      // If there are only two platforms, don't use commas
      if (platforms.length == 2)
      {
        title += platforms[0] + " and " + platforms[1];
      }
      else if (platforms.length > 2)
      {
        // otherwise use commas
        for (var i = 0; i < platforms.length-1; i++)
        {
          title += platforms[i] + ', ';
        }
        // and at the end make sure the last platform has 'and' preceeding it
        title += "and " + platforms[platforms.length-1];
      }

      // The options for the google chart
      var options =
      {
        width: 600,
        height: 360,
        //is3D: true,
        hAxis: {
            //format: 'yyyy',
            title: 'Year'
        },
        vAxis: {
            //format: 'yyyy',
            title: 'Number of Releases'
        },
        title: 'Number of ' + title + ' Releases'
      };

      // Draw the chart using the data table and the options just created
      chart.draw(dataTable, options);
    }
    google.setOnLoadCallback(initialize);
