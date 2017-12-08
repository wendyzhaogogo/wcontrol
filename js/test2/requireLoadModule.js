define(['needLoadModuleSet', 'needLoadWrapper'], function (needLoadModuleSet, needLoadWrapper) {
    var app = angular.module('requireLoadModule', ['ngRoute', 'ngCookies', 'ngMessages', 'ngAnimate', 'ngLocale', 'ngSanitize',
        'ui.tree', 'ui.router']);

    needLoadModuleSet(app);

    app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', '$controllerProvider', function ($routeProvider, $stateProvider, $urlRouterProvider, $controllerProvider) {

        var config = [
            {
                key: 'subpage1',
                dependModules: ["subcontroller1"]
            }, {
                key: 'subpage2',
                dependModules: ["subcontroller2"]
            }, {
                key: 'subpage3',
                dependModules: ["subcontroller3"]
            }
        ]

        needLoadWrapper.config(config);

        $urlRouterProvider.when("", "");
        $stateProvider
            .state("subpage1", needLoadWrapper('subpage1', {
                url: "/subpage1",
                templateUrl: "page/test2/sub1.html",
                controller: "subcontroller1"
            }))
            .state("subpage2", needLoadWrapper('subpage2', {
                url: "/subpage2",
                templateUrl: "page/test2/sub2.html",
                controller: "subcontroller2"
            }))
            .state("subpage3", needLoadWrapper('subpage3', {
                url: "/subpage3",
                templateUrl: "page/test2/sub3.html",
                controller: "subcontroller3"
            }));

        // $routeProvider
        //     .when("/subpage1/:isComplete", { controller: "subcontroller1", template: "<div >subpage1 <div ng-controller='subcontroller1-1'></div></div>" })
        //     .when("/subpage2/:isComplete", { controller: "subcontroller2", template: "<div>subpage2</div>" })
        //     .when("/subpage3/:isComplete", { controller: "subcontroller3", template: "<div>subpage3</div>" })




    }]);
    return app;
});