'use strict';


// Declare app level module which depends on filters, and services
angular.module('dotApp', ['ngRoute','ui.bootstrap', 'angularFileUpload'])
.config(['$routeProvider', '$httpProvider' ,function ($routeProvider, $httpProvider) {
	  $routeProvider
          .when('/dotmarks', {templateUrl: 'partials/dotmarks.html', controller: 'dotMarkController'})
          .when('/bulk_import', {templateUrl: 'partials/bulk_import.html', controller: 'terminalCtl'})
          .when('/upload_html', {templateUrl: 'partials/upload_html.html', controller: 'terminalCtl'})
		.otherwise({redirectTo: '/dotmarks'});

}]);

