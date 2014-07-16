

angular.module('dotApp').factory('appaudit', ['$http', 'localStorageService', function($http, localStorageService){
    return {
        clickDotMark: function(id){
            var o = {};
            o['user'] = 'ivan';
            o['source_id'] = id;
            o['action'] = 'click';
            $http.defaults.headers.common['Authorization'] = 'Basic ' + localStorageService.get('token');
            return $http.post( auditUrl, JSON.stringify(o), config);
        },
        starDotMark: function(id, star){
            var o = {};
            o['user'] = 'ivan';
            o['source_id'] = id;
            o['action'] = 'star';
            o['value'] = '' + star;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + localStorageService.get('token');
            return $http.post( auditUrl, JSON.stringify(o));
        },


    };
}]);

angular.module('dotApp').factory('api', ['$http', 'localStorageService', function($http, localStorageService) {



    return {
        getDotMarksEntries: function(params) {
            var username = localStorageService.get('username');
            var dest = dotmarksUrl + '?sort=[("views",-1),("_updated",-1)]&d=' + Date.now();
            if(params.page !== undefined){
                return $http.get(dest + "&page=" + params.page);
            }else{
                return $http.get(dest);
            }


        },
        saveDotMark: function(entry) {
            var config = {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "application/json",
            };
            $http.defaults.headers.common['Authorization'] = 'Basic ' + localStorageService.get('token');
            return $http.post(dotmarksUrl, entry, config);
        },

        getDotMarksByTag: function(tag){
            var config = {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "application/json",
            };
            var filter = "?where={\"$or\":[{\"tags\":\"" + tag + "\"},{\"atags\":\"" +  tag + "\"}]}";
            return $http.get(dotmarksUrl + filter, config);

        },
        searchDotMarks: function(query){
            var username = localStorageService.get('username');
            var filter = "?where={\"$or\": [{\"url\":{\"$regex\":\".*" + query + ".*\"}},{\"title\":{\"$regex\":\".*" + query + ".*\",\"$options\":\"i\"}}]}";
            return $http.get(dotmarksUrl + filter);
        },
        getDotMark: function(id){
            return $http.get(dotmarksUrl + "/" + id);
        },
        updateDotMark: function(dotmark) {
            log("updating " + dotmark._id);
            log(dotmark);
            var config = {
                headers: {
                    "Content-Type": "application/json",
                    "X-HTTP-Method-Override": "PATCH",
                },
                responseType: "application/json",
            };
            $http.defaults.headers.common['Authorization'] = 'Basic ' + localStorageService.get('token');
            return $http.post(dotmarksUrl + "/" + dotmark._id, dotmark, config);
        }
    };
}]);


