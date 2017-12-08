define(function () {
    return function moduleSet(module) {
        module.config(['$routeProvider', '$locationProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
            function ($routeProvider, $locationProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
                module.controller = $controllerProvider.register;
                module.directive = $compileProvider.directive;
                module.filter = $filterProvider.register;
                module.factory = $provide.factory;
                module.service = $provide.service;
            }
        ]);
    }
});