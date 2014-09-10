
angular.module('dotApp').directive('a', ['appaudit', function (appaudit) {
    return {
        restrict: 'E',
        link: function(scope, elem, attrs) {
            if(scope.dotmark !== undefined){
                elem.on('click', function(e){
                    scope.dotmark.views++;
                    appaudit.clickDotMark(scope.dotmark._id);
                    // scope.refreshEntries();
                });
            }
        }
   };
}]);
