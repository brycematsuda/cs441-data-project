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
  // the default start and interval for now is 2010 and 1
  $scope.startYear = 2010;
  $scope.interval = 1;

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

  // minusInterval():
  // decrements end interval
  $scope.minusInterval = function(){
    $scope.interval = $scope.interval - 1;
  };

  // plusInterval():
  // increments end interval
  $scope.plusInterval = function(){
    $scope.interval = $scope.interval + 1;
  };

}]);