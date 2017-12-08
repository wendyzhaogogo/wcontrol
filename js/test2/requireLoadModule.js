define(function () {
    var app = angular.module('requireLoadModule', ['ngRoute', 'ngCookies', 'ngMessages', 'ngAnimate', 'ngLocale', 'ngSanitize',
        'ui.tree', 'ui.router']);

    app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', '$controllerProvider', function ($routeProvider, $stateProvider, $urlRouterProvider, $controllerProvider) {
        app.controller = $controllerProvider.register;
        // $routeProvider
        //     .when("/satelliteGraph", { controller: 'monitorSpotController', templateUrl: '/page/monitorSpot/list.html' })
        //     .when("/satelliteReport", { controller: 'satelliteReportController', templateUrl: '/page/satelliteReport/list.html' })
        //     .otherwise({ redirectTo: '/' });

        function loads(dependencies) {
            // 返回路由的 resolve 定义， 
            var definition = {
                // resolver 是一个函数， 返回一个 promise 对象；
                resolver: ['$q', '$rootScope', function ($q, $rootScope) {
                    // 创建一个延迟执行的 promise 对象
                    var defered = $q.defer();
                    // 使用 requirejs 的 require 方法加载的脚本
                    require(dependencies, function () {
                        $rootScope.$apply(function () {
                            // 加载完脚本之后， 完成 promise 对象；
                            defered.resolve();
                        });
                    });
                    //返回延迟执行的 promise 对象， route 会等待 promise 对象完成
                    return defered.promise;
                }]
            };
            return definition.resolver;
        }

        $urlRouterProvider.when("", "");
        $stateProvider
            .state("subpage1", {
                url: "/subpage1",
                templateUrl: "page/test2/sub1.html",
                controller: "subcontroller1",
                resolve: {
                    modules: loads(["subcontroller1"])
                }
            })
            .state("subpage2", {
                url: "/subpage2",
                templateUrl: "page/test2/sub2.html",
                controller: "subcontroller2",
                resolve: {
                    modules: loads(["subcontroller2"])
                }
            })
            .state("subpage3", {
                url: "/subpage3",
                templateUrl: "page/test2/sub3.html",
                controller: "subcontroller3",
                resolve: {
                    modules: loads(["subcontroller3"])
                }
            })

        // $routeProvider
        //     .when("/subpage1/:isComplete", { controller: "subcontroller1", template: "<div >subpage1 <div ng-controller='subcontroller1-1'></div></div>" })
        //     .when("/subpage2/:isComplete", { controller: "subcontroller2", template: "<div>subpage2</div>" })
        //     .when("/subpage3/:isComplete", { controller: "subcontroller3", template: "<div>subpage3</div>" })




    }]);
    return app;
});