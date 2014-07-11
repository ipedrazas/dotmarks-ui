'use strict';

function log(entry){
    if( console && console.log ) {
            console.log(entry);
    }
}

function reduce(arr) {
    var tags = [], a = [], b = [], prev;

    arr.sort();
    for ( var i = 0; i < arr.length; i++ ) {
        if ( arr[i] !== prev ) {
            a.push(arr[i]);
            b.push(1);
        } else {
            b[b.length-1]++;
        }
        prev = arr[i];
    }

    for ( var i = 0; i < a.length; i++ ) {
        tags.push({label: a[i], count: b[i]});
    }
    return tags

}


Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return yyyy + "/" + (mm[1]?mm:"0"+mm[0]) + "/" + (dd[1]?dd:"0"+dd[0]); // padding
  };



/* Controllers */

angular.module('dotApp').controller('terminalCtl', [
    '$scope', 'api', '$routeParams', '$upload', '$http',
    function ($scope, api, $routeParams, $upload, $http){

    var parseResponse = function(element, count){
        if(element._status === 'OK'){
            $scope.terminal = $scope.terminal + count + " [OK] - " + element._links.self.href + "\n";
        }
        if(element._status === 'ERR'){
            $scope.terminal = $scope.terminal + count + " [FAILED] - " + element._issues.url + "\n";
        }
    };

    $scope.execute = function(){
      log($scope.terminal);
    };

    $scope.bulkImport = function(){
        var username = 'anonymous';
        if($scope.username){
            username = $scope.username;
        }

        var params = new Array();
        var data = $scope.terminal;
        var urls = data.split("\n");
        _.each(urls, function(el) {
          var o = {};
          o['username'] = username;
          o['url'] = el;
          params.push(o);
        });
        api.saveDotMark(JSON.stringify(params)).success(function(data){
            $scope.terminal = $scope.terminal + "\n\nResults:\n"
            var count = 0;
            if(data instanceof Array){
                _.each(data, function(element){
                    parseResponse(element, count++);
                });
            }else{
                parseResponse(data, count++);
            }
        });
    };

    $scope.onFileSelect = function($files) {
        //$files: an array of files selected, each file has name, size, and type.
        for (var i = 0; i < $files.length; i++) {
            var file = $files[i];
            $scope.upload = $upload.upload({
            url: mediaUrl, //upload.php script, node.js route, or servlet url
            method: 'POST',
            // headers: {'header-key': 'header-value'},
            // withCredentials: true,
            data: {user: localStorageService.get('username')},
            file: file, // or list of files: $files for html5 only
            /* set the file formData name ('Content-Desposition'). Default is 'file' */
            //fileFormDataName: myFile, //or a list of names for multiple files (html5).
            /* customize how data is added to formData. See #40#issuecomment-28612000 for sample code */
            //formDataAppender: function(formData, key, val){}
            }).progress(function(evt) {
            }).success(function(data, status, headers, config) {
            // file is uploaded successfully
            console.log(data);
            });
            //.error(...)
            //.then(success, error, progress);
            //.xhr(function(xhr){xhr.upload.addEventListener(...)})// access and attach any event listener to XMLHttpRequest.
        }
            /* alternative way of uploading, send the file binary with the file's content-type.
            Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed.
            It could also be used to monitor the progress of a normal http post/put request with large data*/
            // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
    };

}]);

angular.module('dotApp').controller('dotMarkController',
    ['$scope', '$rootScope', '$location', 'api', 'appaudit', '$routeParams', 'localStorageService',
     function ($scope, $rootScope, $location, api, appaudit, $routeParams, localStorageService) {

    var token = localStorageService.get('token');
    var username = localStorageService.get('username');

    var callbackHandler = function(data){
        var elems = new Array();
        var etags = new Array();
        var atags = new Array();
        _.each(data._items, function(item){
            elems.push(item);
            atags.push.apply(atags, item.atags);
            _.each(item.tags, function(tag) {
                etags.push(tag.toLowerCase());
            });
        });

        $scope.dotmarks = elems;
        $scope.tags = reduce(etags);
        $scope.atags = reduce(atags);

        var pagination = {};
        pagination.last = data._links.last;
        pagination.next = data._links.next;
        pagination.prev = data._links.prev;

        $scope.pagination = pagination;
    };

    $scope.refreshEntries = function(){
        api.getDotMarksEntries($routeParams).success(callbackHandler);
    };

    $scope.getTags = function(){
        api.getDotMarksByTag($routeParams.tag).success(callbackHandler);
    };

    $scope.searchDotMarks = function(query){
        api.searchDotMarks(query).success(callbackHandler);
    };

    $scope.starDotMark = function(id, star){
        _.each($scope.dotmarks, function(item) {
             if(id == item._id){
                item.star = star;
                appaudit.starDotMark(id, star);
             }
        });
    };

    $scope.editDotMark = function(oid){
        api.getDotMark(oid).success(function(data){
            $scope.dotmark = data;
            $location.path("/edit");
        });
    }

    $scope.updateDotMark = function(){
        log("updateDotMark");
        api.updateDotMark($scope.dotmark).success(function(data){
            log(data);
        });
    }



    if($routeParams.tag !== undefined){
        $scope.getTags();
    }else if($routeParams.id !== undefined){
        $scope.editDotMark($routeParams.id);
    }else{
        $scope.refreshEntries();
    }


  }]);

