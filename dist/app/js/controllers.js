'use strict';

function log(entry){
    if(DEBUG){
        if( console && console.log ) {
            console.log(entry);
        }
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

function fixTags(string_tags){
    var tags = new Array();

    _.each(string_tags, function(el) {
      var o = {};
      o['tag'] = el;
      tags.push(o);
    });
    return tags;
}

function pad(s) { return (s < 10) ? '0' + s : s; }

Date.prototype.dateTime = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   var hh = this.getHours().toString();
   var min = this.getMinutes().toString();
   var sec = this.getSeconds().toString();
   var time = (hh[1]?hh:"0"+hh[0]) + ":" + (min[1]?min:"0"+min[0]) + ":" + (sec[1]?sec:"0"+sec[0]);
   var date = (dd[1]?dd:"0"+dd[0]) + "/" + (mm[1]?mm:"0"+mm[0]) + "/" + yyyy;
   return date + " " + time;
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
            // data: {user: localStorageService.get('username')},
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
    ['$scope', '$rootScope', '$location', 'api', 'appaudit', '$routeParams',
     function ($scope, $rootScope, $location, api, appaudit, $routeParams) {

    var callbackHandler = function(data){


        var elems = new Array();
        if(data._items.length > 0){
            var d = new Date(data._items[0]._created);
            $scope.last_entry_added = d.dateTime();
        }

        _.each(data._items, function(item){
            item['array_tags'] = fixTags(item['tags']);
            item['date'] = (new Date(item['_updated'])).dateTime();
            elems.push(item);
        });

        if(elems.length > 0){
            $scope.dotmarks = elems;
            $scope.noresults = false;
        }else{
            $scope.noresults = true;
            $scope.dotmarks = [];
        }

        if(data._meta !== undefined){
            if(data._meta.total !== undefined){
                $scope.total_links = data._meta.total;
            }
        }

        var pagination = {};
        pagination.last = data._links.last;
        pagination.next = data._links.next;
        pagination.prev = data._links.prev;

        $scope.pagination = pagination;
    };

    $scope.refreshEntries = function(){
        api.getDotMarksEntries($routeParams).success(callbackHandler);
    };

    $scope.getByTag = function(tag){
        api.getDotMarksByTag(tag).success(callbackHandler);
        $('#tagsList').modal('hide');
    };

    $scope.searchDotMarks = function(){
        if($scope.q.length > 2){
            api.searchDotMarks($scope.q).success(callbackHandler);
        }
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

    $scope.initNew = function(){
        $scope.newDotMark = {};
    }

    $scope.populate = function(entry){
        $scope.newDotMark = entry;
    }

    $scope.addDotMark = function(){
        var elem = {};
        if($scope.newDotMark.url !== undefined){
            if($scope.newDotMark._id === undefined){
                elem['url'] = $scope.newDotMark.url;
                if($scope.newDotMark.title!==undefined){
                    elem['title'] = $scope.newDotMark.title;
                }
                elem['tags'] = $scope.newDotMark.tags;
                elem['source'] = "w";
                api.saveDotMark(elem).success(function(data){
                    $scope.refreshEntries();
                });
                log("Add " + newDotMark.id);
            }else{

                // Update object
                api.updateDotMark($scope.newDotMark).success(function(data){
                    $scope.refreshEntries();
                });
            }

        }else{
            return -1
        }
    }

    var paginated_tags = api.getTags().success(function(data){
            $scope.tags = data;
            $scope.total_tags = data.total;
        });



    if($routeParams.tag !== undefined){
        $scope.getByTag($routeParams.tag);
    }else if($routeParams.id !== undefined){
        $scope.editDotMark($routeParams.id);
    }else{
        $scope.refreshEntries();
    }
  }]);

