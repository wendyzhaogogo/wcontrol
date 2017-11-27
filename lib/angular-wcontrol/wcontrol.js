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

    (function () {

        angular.module('wcontrol')

            //适用于日期控件选择年，但是保存为年份字符串的情况
            .directive('dateinputyear', function () {
                return {
                    restrict: "A",
                    scope: false,
                    require: "ngModel",
                    link: function (scope, element, attrs, modelCtrl) {
                        modelCtrl.$parsers.push(convertDateToYearStr);
                        modelCtrl.$formatters.push(convertYearStrToDate);
                        function convertDateToYearStr(srcValue) {
                            var result = null;
                            if (Object.prototype.toString.call(srcValue) == "[object Date]") {
                                result = srcValue.getFullYear().toString();
                            }
                            return result;
                        }
                        function convertYearStrToDate(srcValue) {
                            var result = null;
                            if (Object.prototype.toString.call(srcValue) == "[object String]") {
                                result = new Date(parseInt(srcValue), 0, 1);
                            }
                            else if ((Object.prototype.toString.call(srcValue) == "[object Number]")) {
                                result = new Date(srcValue, 0, 1);
                            }
                            return result;
                        }
                    }
                }
            })

            /**
             * 支持两种配置方式
             * 1.only-num='5' 直接写数字  则只限制小数位小于等于5
             * 2.
             * 注：.两边的*可以是0个
             * only-num='***.***' 限制小数位数，限制整数位
             * only-num='***.&' 不限制小数位数，限制整数位
             * only-num='&.*****' 限制小数位数，不限制整数位
             * only-num='&.&' 不限制小数位数，不限制整数位
             */
            .directive('onlyNum', function () {
                return {
                    restrict: "A",
                    scope: false,
                    require: "ngModel",
                    link: function (scope, element, attrs, modelCtrl) {

                        var configCheckExp = /^((?:\**)|&)\.((?:\**)|&)$/;
                        var configCheckResult = [];

                        var config = attrs.onlyNum;
                        var tofixedLimit;
                        var intLimit;
                        var exp;
                        var arr;

                        if (configCheckExp.test(config)) {
                            // 如果符合完全配置方式,则提取参数进行配置

                            configCheckResult = configCheckExp.exec(config);

                            if (configCheckResult[1] === '&') {
                                intLimit = '';
                            }
                            else {
                                intLimit = configCheckResult[1].length;
                            }

                            if (configCheckResult[2] === '&') {
                                tofixedLimit = '';
                            }
                            else {
                                tofixedLimit = configCheckResult[2].length;
                            }
                        }
                        else if (config == '') {
                            intLimit = '';
                            tofixedLimit = '';
                        }
                        else {
                            // 如果不符合完全配置方式，则认为传进来的是小数位，出错则认为无限制

                            intLimit = '';
                            try {
                                tofixedLimit = parseInt(config);
                            }
                            catch (e) {
                                tofixedLimit = '';
                            }
                        }
                        exp = getExpBylimit(intLimit, tofixedLimit);

                        scope.$watch(function () {
                            return modelCtrl.$viewValue;
                        }, function (newValue, oldValue) {
                            try {
                                var result = newValue;
                                var old = oldValue;
                                if (result && Object.prototype.toString.call(result) === "[object String]") {
                                    var tofixedLimit = attrs.onlyNum;
                                    var reg = new RegExp(exp);
                                    if (reg.test(newValue)) {

                                    }
                                    else {
                                        modelCtrl.$setViewValue(old);
                                        modelCtrl.$render();
                                    }
                                }
                            }
                            catch (e) {
                                console.log(e);
                            }
                        });
                        modelCtrl.$parsers.push(convertStringToNumber);

                        function convertStringToNumber(srcValue) {
                            var result;
                            if (typeof srcValue === "undefined" || srcValue === null || srcValue === '') {
                                result = null;
                            }
                            else {
                                var result = parseFloat(srcValue);
                            }
                            return result;
                        }

                        function getExpBylimit(limit_int, limit_tofixed) {
                            //通过赋值limit只能是数字或者''

                            var result = '*';
                            var resultInt;
                            var resultTofixed;


                            if (isNumber(limit_int)) {
                                if (limit_int === 0) {
                                    resultInt = "(0)";
                                }
                                else {
                                    resultInt = "([1-9]\\d{0," + (limit_int - 1) + "}|0)";
                                }
                            }
                            else if (limit_int === '') {
                                resultInt = "([1-9]\\d*|0)";
                            }

                            if (isNumber(limit_tofixed)) {
                                if (limit_tofixed === 0) {
                                    resultTofixed = ''
                                }
                                else {
                                    resultTofixed = "(\\.\\d{0," + limit_tofixed + "})?";
                                }

                            }
                            else if (limit_tofixed === '') {
                                resultTofixed = "(\\.\\d*)?";
                            }

                            result = resultInt + resultTofixed;
                            result = "^(\-)?(" + result + ")?$"; //临时增加支持负数
                            return result;
                        }

                        function isNumber(v) {
                            return angular.isNumber(v);
                        }
                    }
                }

            })

            .directive("radioControl", function () {
                // [
                //     {
                //         value:"存储值",
                //         text:"展示值"
                //     },
                // ]
                return {
                    restrict: "EA",
                    scope: {
                        config: "=",   //配置对象
                        name: "@",     //radio的标识，将绑定给radio的name
                        model: "=",    //用来绑定ng-model的
                        height: "@",   //高度
                        width: "@",    //宽度
                        direction: "@",  //方向
                        change: "&"
                    },
                    replace: true,
                    templateUrl: '/page/common/radioControl.html',
                    link: function (scope, element, attrs) {
                        var rootEle = element[0];
                        var h = scope.height;
                        var w = scope.width;
                        var d = scope.direction;

                        var change = scope.change;
                        scope.$watch('model', function (v) {
                            change();
                        });

                        if (h != undefined) {
                            rootEle.style.height = h;
                        }
                        else {
                            rootEle.style.height = "auto";
                        }

                        if (w != undefined) {
                            rootEle.style.width = w;
                        }
                        else {
                            rootEle.style.width = "auto";
                        }

                        if (d != undefined) {
                            rootEle.style["flex-direction"] = getFlexDirectionKeyByCondition(d);
                            rootEle.style["align-items"] = getAlignItemsByCondition(d);
                        }

                        function getAlignItemsByCondition(key) {
                            var result = "";
                            switch (key) {
                                case "column":
                                    result = "flex-start";
                                    break;
                                case "row":
                                    result = "center";
                                    break;
                            }
                            return result;
                        }
                        function getFlexDirectionKeyByCondition(key) {
                            var result = "";
                            switch (key) {
                                case "column":
                                    result = "column";
                                    break;
                                case "row":
                                    result = "row";
                                    break;
                            }
                            return result;
                        }
                    }
                }
            })

            /**
             * 固定表头指令
             * 注意事项：
             * 1.table border-collapse必须是seperate的
             * 2.table必须包含thead
             * 3.此指令用在table上层的div
             */
            .directive("fixTableDiv", function () {
                return {
                    restrict: "A",
                    scope: false,
                    link: function (scope, element, attrs) {
                        element.bind('scroll', function (event) {
                            var parentEle = element[0];
                            var theadEle = element.find('thead')[0];
                            var scrolltop = parentEle.scrollTop;
                            theadEle.style.transform = 'translateY(' + scrolltop + 'px)';
                        });
                    }
                }
            })


    })();


})();



