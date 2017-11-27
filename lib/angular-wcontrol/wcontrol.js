(function () {
    angular.module('wcontrol', []);
    function isDefined(value) { return typeof value !== 'undefined'; }
    (function () {
        angular.module('wcontrol')
            .directive('ngIncludeX', ngIncludeDirective)
            .directive('ngIncludeX', ngIncludeFillContentDirective);

        /**
         * @ngdoc function
         * @name angular.isDefined
         * @module ng
         * @kind function
         *
         * @description
         * Determines if a reference is defined.
         *
         * @param {*} value Reference to check.
         * @returns {boolean} True if `value` is defined.
         */


        function ngIncludeDirective($templateRequest, $anchorScroll, $animate) {
            return {
                restrict: 'ECA',
                priority: 400,
                terminal: true,
                scope: true,
                transclude: 'element',
                controller: angular.noop,
                compile: function (element, attr) {
                    var srcExp = attr.ngIncludeX || attr.src,
                        onloadExp = attr.onload || '',
                        autoScrollExp = attr.autoscroll;

                    return function (scope, $element, $attr, ctrl, $transclude) {
                        var changeCounter = 0,
                            currentScope,
                            previousElement,
                            currentElement;

                        var cleanupLastIncludeContent = function () {
                            if (previousElement) {
                                previousElement.remove();
                                previousElement = null;
                            }
                            if (currentScope) {
                                currentScope.$destroy();
                                currentScope = null;
                            }
                            if (currentElement) {
                                $animate.leave(currentElement).then(function () {
                                    previousElement = null;
                                });
                                previousElement = currentElement;
                                currentElement = null;
                            }
                        };

                        scope.$watch(srcExp, function ngIncludeWatchAction(src) {
                            var afterAnimation = function () {
                                if (isDefined(autoScrollExp) && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                                    $anchorScroll();
                                }
                            };
                            var thisChangeId = ++changeCounter;

                            if (src) {
                                //set the 2nd param to true to ignore the template request error so that the inner
                                //contents and scope can be cleaned up.
                                $templateRequest(src, true).then(function (response) {
                                    if (thisChangeId !== changeCounter) return;
                                    var newScope = scope;
                                    ctrl.template = response;

                                    // Note: This will also link all children of ng-include that were contained in the original
                                    // html. If that content contains controllers, ... they could pollute/change the scope.
                                    // However, using ng-include on an element with additional content does not make sense...
                                    // Note: We can't remove them in the cloneAttchFn of $transclude as that
                                    // function is called before linking the content, which would apply child
                                    // directives to non existing elements.
                                    var clone = $transclude(newScope, function (clone) {
                                        cleanupLastIncludeContent();
                                        $animate.enter(clone, null, $element).then(afterAnimation);
                                    });

                                    currentScope = newScope;
                                    currentElement = clone;

                                    currentScope.$emit('$includeContentLoaded', src);
                                    scope.$eval(onloadExp);
                                }, function () {
                                    if (thisChangeId === changeCounter) {
                                        cleanupLastIncludeContent();
                                        scope.$emit('$includeContentError', src);
                                    }
                                });
                                scope.$emit('$includeContentRequested', src);
                            } else {
                                cleanupLastIncludeContent();
                                ctrl.template = null;
                            }
                        });
                    };
                }
            };
        }

        /**
         *This directive is called during the $transclude call of the first `ngIncludeX` directive.
         *It will replace and compile the content of the element with the loaded template.
         *We need this directive so that the element content is already filled when
         *the link function of another directive on the same element as ngInclude
         *is called.
         */
        function ngIncludeFillContentDirective($compile, $controller) {
            return {
                restrict: 'ECA',
                priority: -400,
                require: 'ngIncludeX',
                link: function (scope, $element, $attr, ctrl) {
                    if (/SVG/.test($element[0].toString())) {
                        // WebKit: https://bugs.webkit.org/show_bug.cgi?id=135698 --- SVG elements do not
                        // support innerHTML, so detect this here and try to generate the contents
                        // specially.
                        $element.empty();
                        $compile(jqLiteBuildFragment(ctrl.template, document).childNodes)(scope,
                            function namespaceAdaptedClone(clone) {
                                $element.append(clone);
                            }, { futureParentElement: $element });
                        return;
                    }

                    var contentCtrl = $attr.controller ? (scope.$parent.$eval($attr.controller) || angular.noop) : angular.noop;
                    var locals = {
                        $includeParams: scope.$parent.$eval($attr.includeParams),
                        $scope: scope
                    }

                    $controller(contentCtrl, locals);
                    $element.html(ctrl.template);
                    $compile($element.contents())(scope);
                }
            };
        };

    })();

    (function () {

        angular.module('wcontrol')
            .directive('multiTabPage', multiTabPageDirective)
            .factory('multiTabPageService', multiTabPageService);
        function multiTabPageDirective($templateRequest, $timeout, $document) {
            return {
                restrict: "EA",
                scope: {
                    // {
                    //     data:[{
                    //          
                    //     }]
                    // }
                    option: '=',
                    data: '=',
                    currentTab: '=',
                },
                replace: false,
                templateUrl: '/lib/angular-wcontrol/multiTabPage/multiTabPage.html',
                link: function (scope, element, attrs) {

                },
                controller: function ($scope) {
                    $scope.close = function (item) {
                        var pages = $scope.data;
                        var idx = pages.indexOf(item);
                        pages.splice(idx, 1);

                        var maptoidx = (idx - 1) >= 0 ? (idx - 1) : (pages.length > 0 ? idx : null)
                        $scope.currentTab = maptoidx == null ? null : pages[maptoidx];
                    }

                }
            }
        }


        function multiTabPageService(http, containerService, messager) {
            var KEY = 'tabview';

            var container = containerService.resolve(KEY);

            return {
                openProject: function (id) {

                }
            }

            function containerCheck() {

            }


        }
    })();
})();



