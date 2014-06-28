'use strict';


// Declare app level module which depends on filters, and services
angular.module('dotApp', ['ngRoute','ui.bootstrap', 'LocalStorageModule', 'angularFileUpload'])
.config(['$routeProvider', '$httpProvider' ,function ($routeProvider, $httpProvider) {
	  $routeProvider
          .when('/dotmarks', {templateUrl: 'partials/dotmarks.html', controller: 'dotMarkController'})
          .when('/bulk_import', {templateUrl: 'partials/bulk_import.html', controller: 'terminalCtl'})
          .when('/upload_html', {templateUrl: 'partials/upload_html.html', controller: 'terminalCtl'})
          .when('/home', {templateUrl: 'partials/dotmarks.html', controller: 'dotMarkController'})
          .when('/edit', {templateUrl: 'partials/editDotMark.html', controller: 'dotMarkController'})
          .when('/applications', {templateUrl: 'partials/applications.html', controller: 'appsCtl'})
          .when('/settings', {templateUrl: 'partials/settings.html', controller: 'settingsCtl'})
		.otherwise({redirectTo: '/home'});

}]);

