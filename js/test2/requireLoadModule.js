define(function () {
    var app = angular.module('requireLoadModule', ['ngRoute', 'ngCookies', 'ngMessages', 'ngAnimate', 'ngLocale', 'ngSanitize',
        'ui.tree', 'ui.router']);

    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        // $routeProvider
        //     .when("/satelliteGraph", { controller: 'monitorSpotController', templateUrl: '/page/monitorSpot/list.html' })
        //     .when("/satelliteReport", { controller: 'satelliteReportController', templateUrl: '/page/satelliteReport/list.html' })
        //     .otherwise({ redirectTo: '/' });

        $urlRouterProvider.when("", "");
        $stateProvider
            .state("subpage1", {
                url: "/subpage1",
                template: "<div>subpage1</div>",
                controller: "subcontroller1",
            })
            .state("subpage2", {
                url: "/subpage2",
                template: "<div>subpage2</div>",
                controller: "subcontroller2",
            })
            .state("subpage3", {
                url: "/subpage3",
                template: "<div>subpage3</div>",
                controller: "subcontroller3",
            })


    }]);
    return app;
});