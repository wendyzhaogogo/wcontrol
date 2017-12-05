define(['testPageModule', 'autoTableMergeCell', 'jquery'], function (app, autoTableMergeCell, $) {

    app.directive('autoTableMergeCell', function ($timeout) {
        return {
            restrict: "A",
            scope: false,
            priority: -400,
            //transclude: true,
            //replace: true,
            link: function (scope, element, attr) {
                var autoTableCellMerge = attr.autoTableMergeCell;
                var arr = autoTableCellMerge.split(',');

                var cfg = {
                    cols: arr
                }
                var mergeHelper = new autoTableMergeCell($(element), cfg);
                scope.$watch(function () {
                    return element.html();
                }, function (newValue, oldValue) {
                    if (newValue == oldValue) return;
                    mergeHelper.execute();
                })
            }
            //template: "<ng-transclude></ng-transclude>"
        }
    });





})