define(['testPageModule'], function (app) {

    app.controller("testPageController", function ($scope) {

        $scope.checkedAll = false;
        $scope.changeMe = function () {
            var c = $scope.checkedAll;
            angular.forEach($scope.list, function (v, i) {
                v.checked = $scope.checkedAll;
            });
        }

        $scope.list =
            [
                { x: 1, y: "a", z: 1 },
                { x: 1, y: "a", z: 1 },
                { x: 1, y: "a", z: 1 },
                { x: 1, y: "b", z: 1 },
                { x: 2, y: "c", z: 1 },
                { x: 2, y: "c", z: 1 },
                { x: 2, y: "d", z: 1 },
                { x: 2, y: "d", z: 1 },
                { x: 2, y: "d", z: 1 }
            ]

        $scope.diclist = Enumerable.From($scope.list).GroupBy("$.x", null, function (key, g) {
            var result = {
                Key: key,
                Value: Enumerable.From(g.source).GroupBy("$.y", null, function (key2, g2) {
                    var result = {
                        Key: key2,
                        Value: g2.source
                    }
                    return result;
                }).ToArray()
            }
            return result;
        }).ToArray();
    });

    app.directive('divFix', function ($timeout) {
        return {
            restrict: "A",
            scope: false,
            priority: -500,
            //transclude: true,
            //replace: true,
            link: function (scope, element, attr) {
                $(element).hide();
                $timeout(function () {
                    var newDom = $($(element)[0].outerHTML.replace(/x\-/g, ''));
                    newDom.show();
                    newDom.insertBefore(element);
                    element.remove();
                })
            }
            //template: "<ng-transclude></ng-transclude>"
        }
    });

    app.directive('divReplace', function ($timeout) {
        return {
            restrict: "EA",
            scope: false,
            priority: -400,
            //transclude: true,
            //replace: true,
            link: function (scope, element, attr) {
                $timeout(function () {
                    $($(element)[0].html()).insertBefore(element);
                    element.remove();
                })
            }
            //template: "<ng-transclude></ng-transclude>"
        }
    });

    // app.directive('divTest', function () {
    //     return {
    //         restrict: "A",
    //         scope: false,
    //         template:"<a>aaa</a>",
    //         priority: -500,
    //         //transclude: true,
    //         replace: true,
    //         link: function (scope, element, attr) {
    //             //    $(element).context.outerHTML.replace(/x\-/g,'').insertBefore(element);
    //             //    element.remove();
    //         }
    //         //template: "<ng-transclude></ng-transclude>"
    //     }
    // });


})