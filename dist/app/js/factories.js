

angular.module('dotApp').factory('appaudit', ['$http', function($http){
    return {
        clickDotMark: function(id){
            var o = {};
            o['user'] = 'ivan';
            o['source_id'] = id;
            o['action'] = 'click';
            // $http.defaults.headers.common['Authorization'] = 'Basic ' + localStorageService.get('token');
            return $http.post( auditUrl, JSON.stringify(o), config);
        },
        starDotMark: function(id, star){
            var o = {};
            o['user'] = 'ivan';
            o['source_id'] = id;
            o['action'] = 'star';
            o['value'] = '' + star;
            // $http.defaults.headers.common['Authorization'] = 'Basic ' + localStorageService.get('token');
            return $http.post( auditUrl, JSON.stringify(o));
        },


    };
}]);

angular.module('dotApp').factory('api', ['$http', function($http) {

    return {

        getTags: function(params){
            return  $http.get(TAGS_URL+ '?sort=[("value",-1)]');

        },

        getDotMarksEntries: function(params) {
            var dest = dotmarksUrl + '?sort=[("_updated",-1)]&d=' + Date.now();
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
            // $http.defaults.headers.common['Authorization'] = 'Basic ' + localStorageService.get('token');
            return $http.post(dotmarksUrl, JSON.stringify(entry), config);
        },

        getDotMarksByTag: function(tag){
            var config = {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "application/json",
            };
            var filter = "?sort=[(\"_updated\",-1)]&where={\"$or\":[{\"tags\":\"" + tag + "\"}]}";
            return $http.get(dotmarksUrl + filter, config);

        },
        searchDotMarks: function(query){
            // var username = localStorageService.get('username');
            var filter = "?where={\"$or\": [{\"url\":{\"$regex\":\".*" + query + ".*\"}},{\"title\":{\"$regex\":\".*" + query + ".*\",\"$options\":\"i\"}}]}";
            return $http.get(dotmarksUrl + filter);
        },
        getDotMark: function(id){
            return $http.get(dotmarksUrl + "/" + id);
        },
        updateDotMark: function(dotmark) {
            log("updating " + dotmark._id);
            var id = dotmark._id;
            var config = {
                headers: {
                    "Content-Type": "application/json",
                    "X-HTTP-Method-Override": "PATCH",
                    "If-Match": dotmark._etag
                },
                responseType: "application/json",
            };
            delete dotmark._updated;
            delete dotmark._created;
            delete dotmark._links;
            delete dotmark.array_tags;
            delete dotmark._id;
            // dotmark['etag'] = dotmark._etag;
            delete dotmark._etag;
            // $http.defaults.headers.common['Authorization'] = 'Basic ' + localStorageService.get('token');
            log(dotmarksUrl + "/" + id);
            log(dotmark);
            log(config);
            return $http.put(dotmarksUrl + "/" + id, dotmark, config);
        }
    };
}]);


