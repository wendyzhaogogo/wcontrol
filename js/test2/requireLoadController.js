define(['requireLoadModule',
            'subcontroller1',
        'subcontroller2',
        'subcontroller3'
], function (app) {
 
    app.controller("requireLoadController", function ($scope, $state, $timeout) {
        define('routeStateHelper', [], function () {
            return $state;
        })


        $scope.click1 = function () {
            require(['subcontroller1-1','subcontroller1-2'], function () {
                // app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
                //     
                //     $stateProvider.state("subpage1", {
                //         url: "/subpage1",
                //         template: "<div>subpage1</div>",
                //         controller: "subcontroller1",
                //     })
                // }]);
                // $timeout(function () {
                    //console.log(1);
                    $state.go('subpage1');
                // })
            });
        }
        $scope.click2 = function () {
            require(['subcontroller2-1','subcontroller2-2'], function () {
                // app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
                //     $stateProvider.state("subpage2", {
                //         url: "/subpage2",
                //         template: "<div>subpage2</div>",
                //         controller: "subcontroller2",
                //     })
                // }]);
                // $timeout(function () {
                    $state.go('subpage2');
                // })
            });
        }
        $scope.click3 = function () {
            require(['subcontroller3-1','subcontroller3-2'], function () {
                // app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
                //     $stateProvider.state("subpage3", {
                //         url: "/subpage3",
                //         template: "<div>subpage3</div>",
                //         controller: "subcontroller3",
                //     })
                // }]);
                // $timeout(function () {
                    $state.go('subpage3');
                // })
            });
        }
    });




})