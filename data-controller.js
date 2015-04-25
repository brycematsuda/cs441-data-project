/**
* data-controller.js
*
* Data controllers that defines UI behavior on AGOP visualization.
*
*/

var agop = angular.module('agop', []);

// ButtonController:
// Data controller that defines button behavior
agop.controller('ButtonController', ['$scope', function($scope) {

  // At the beginning of execution,
  // the default start and end year is 2005 and 2015, respectively.
  $scope.startYear = 2005;
  $scope.endYear = 2014;

  // minusStart():
  // decrements start year
  $scope.minusStart = function(){
    $scope.startYear = $scope.startYear - 1;
  };

  // plusStart():
  // increments start year
  $scope.plusStart = function(){
    if($scope.endYear > $scope.startYear){
      $scope.startYear = $scope.startYear + 1;
    }
  };

  // minusEnd():
  // decrements end year
  $scope.minusEnd = function(){
    if($scope.startYear < $scope.endYear){
      $scope.endYear = $scope.endYear - 1;
    }
  };

  // plusEnd():
  // increments end year
  $scope.plusEnd = function(){
    $scope.endYear = $scope.endYear + 1;
  };

}]);
