define(['requireLoadModule',
], function (app) {
    app.run(['$rootScope', '$state', '$stateParams', '$location', function ($rootScope, $state, $stateParams, $location) {
        
        
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            // var isComplete = toParams.isComplete;            
            // if (isComplete != true) {
            //     event.preventDefault();
            //     switch (toState.name) {
            //         case 'subpage1':
            //             var promise = loads(['subcontroller1-1', 'subcontroller1-2']);
            //             $state.go('subpage1', { isComplete: true, modules: promise });

            //             break;
            //         case 'subpage2':
            //             $state.go('subpage2', { isComplete: function(){
            //                 return "123";
            //             }, modules: loads(['subcontroller2-1', 'subcontroller2-2']) });

            //             break;
            //         case 'subpage3':
            //             $state.go('subpage3', { isComplete: true, modules: loads(['subcontroller3-1', 'subcontroller3-2']) });

            //             break;

            //         default:
            //             break;
            //     }
            // }
        })
        // $rootScope.$on('$locationChangeStart', function (event) {       
        //     event.preventDefault();
        //     var next = $location.url();
        //     switch (next) {
        //         case '/subpage1':
        //             require(['subcontroller1-1', 'subcontroller1-2']);
        //             break;
        //         case '/subpage2':
        //             require(['subcontroller2-1', 'subcontroller2-2']);
        //             break;
        //         case '/subpage3':
        //             require(['subcontroller3-1', 'subcontroller3-2']);
        //             break;

        //         default:
        //             break;
        //     }

        // })


    }])


    app.controller("requireLoadController", function ($scope, $state, $timeout, $location) {
        define('routeStateHelper', [], function () {
            return $state;
        })


        $scope.click1 = function () {
            // require(['subcontroller1-1', 'subcontroller1-2'], function () {
            //     // app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            //     //     
            //     //     $stateProvider.state("subpage1", {
            //     //         url: "/subpage1",
            //     //         template: "<div>subpage1</div>",
            //     //         controller: "subcontroller1",
            //     //     })
            //     // }]);
            //     // $timeout(function () {
            //     //console.log(1);

            $state.go('subpage1');

            // $timeout(
            //     function () {
            //         $location.url('/subpage1/true').replace();
            //     }
            // )

            // })
            // });
        }
        $scope.click2 = function () {
            //require(['subcontroller2-1', 'subcontroller2-2'], function () {
                // app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
                //     $stateProvider.state("subpage2", {
                //         url: "/subpage2",
                //         template: "<div>subpage2</div>",
                //         controller: "subcontroller2",
                //     })
                // }]);
                // $timeout(function () {
                $state.go('subpage2');
                // $timeout(
                //     function () {
                //         $location.url('/subpage2').replace();
                //     }
                // )

                // })
            //});
        }
        $scope.click3 = function () {
            // require(['subcontroller3-1', 'subcontroller3-2'], function () {
            // app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            //     $stateProvider.state("subpage3", {
            //         url: "/subpage3",
            //         template: "<div>subpage3</div>",
            //         controller: "subcontroller3",
            //     })
            // }]);
            // $timeout(function () {
            $state.go('subpage3');

            // $timeout(
            //     function () {
            //         $location.url('/subpage3').replace();
            //     }
            // )

            // })
            // });
        }




    });




})