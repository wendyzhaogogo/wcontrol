(function () {
    angular.module('wcontrol', []);

    function isDefined(value) { return typeof value !== 'undefined'; }

    /**
     * 
     * @param {element} ele 
     */
    function getFullHeight(ele) {
        var jq_ele = $(ele);
        var height_content = jq_ele.height();
        var height_margin = getMarginHeight(jq_ele);
        var height_border = getBorderHeight(jq_ele);
        var result =
            height_content +
            height_margin +
            height_border;

        return result;
    }

    function isConst(exp) {
        var result = true;
        try {
            JSON.parse(exp);
            result = true;
        } catch (error) {
            result = false;
        }
        return result;
    }

    /**
     * 
     * @param {element} ele 
     */
    function getBorderHeight(ele) {
        var jq_ele = $(ele);
        var height_borderTopWidth = parseInt(jq_ele.css("borderTopWidth"));
        var height_borderBottomWidth = parseInt(jq_ele.css("borderBottomWidth"));
        return height_borderTopWidth + height_borderBottomWidth;
    }

    /**
     * 
     * @param {element} ele 
     */
    function getMarginHeight(ele) {
        var jq_ele = $(ele);
        var height_marginTop = parseInt(jq_ele.css("marginTop"));
        var height_marginBottom = parseInt(jq_ele.css("marginBottom"));
        return height_marginTop + height_marginBottom;
    }

    (function () {
        angular.module('wcontrol')
            .factory('modelParse', function ($parse) {
                return modelParse;
                function modelParse(scope, model) {
                    var parsedModel = $parse(model),
                        parsedModelAssign = parsedModel.assign,
                        modelGet = parsedModel,
                        modelSet = parsedModelAssign;

                    // 双向绑定
                    var invokeModelGetter = $parse(model + '()'),
                        invokeModelSetter = $parse(model + '($$$p)');
                    this.modelGet = function () {
                        var modelValue = parsedModel(scope);
                        if (angular.isFunction(modelValue)) {
                            modelValue = invokeModelGetter(scope);
                        }
                        return modelValue;
                    };
                    this.modelSet = function (newValue) {
                        if (angular.isFunction(parsedModel(scope))) {
                            invokeModelSetter(scope, { $$$p: newValue });
                        } else {
                            parsedModelAssign(scope, newValue);
                        }
                    };
                }
            });
    })();

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
                        }, true);
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
        function ngIncludeFillContentDirective($compile, $controller, $parse, modelParse) {


            return {
                restrict: 'ECA',
                priority: -400,
                require: 'ngIncludeX',
                link: function (scope, $element, $attr, ctrl) {
                    var isWatchOpen = scope.$eval($attr.watchOpen) === true;
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

                    var params = null;

                    //如果传的值不是scope上的则认为是固定值，不进行监视
                    if (isWatchOpen) {
                        var paramGetSet = new modelParse(scope.$parent, $attr.includeParams);
                        params = paramGetSet.modelGet();

                        scope.$parent.$watch(function () {
                            return paramGetSet.modelGet();
                        }, function (newVal, oldValue) {
                            if (newVal == oldValue) return;
                            scope.$includeParams = newVal;
                        });

                        scope.$watch('$includeParams', function (newVal, oldValue) {
                            if (newVal == oldValue) return;
                            paramGetSet.modelSet(newVal);
                        });
                    } else {
                        params = scope.$eval($attr.includeParams);
                    }

                    scope.$includeParams = params;

                    var locals = {
                        $includeParams: params,
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
                    showMore: '='
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
                        if ($scope.currentTab == item) {
                            var maptoidx = (idx - 1) >= 0 ? (idx - 1) : null
                            $scope.currentTab = maptoidx == null ? null : pages[maptoidx];
                        }
                        if (pages[pages.length - 1].tabName == '...') {
                            var shownMenu = Enumerable.From($scope.data).Where("a => a.tabName!='...' && a.IsShow==" + true + "").ToArray();
                            var firstIndex = 0,
                                lastIndex = 0;
                            if (shownMenu && shownMenu.length > 1) {
                                firstIndex = $scope.data.indexOf(shownMenu[1]);
                                lastIndex = $scope.data.indexOf(shownMenu[shownMenu.length - 1]);
                            }
                            if (lastIndex + 1 < $scope.data.length - 1 && $scope.data[lastIndex + 1])
                                $scope.data[lastIndex + 1].IsShow = true;
                            else if (firstIndex - 1 > 0 && $scope.data[firstIndex - 1])
                                $scope.data[firstIndex - 1].IsShow = true;
                            if (pages.length == $scope.$parent.maxTabPages + 2) //当前tab页签数已经减少至可全部展示时，将more页签删除掉
                                pages.splice(pages.length - 1, 1);
                        }
                    }
                    $scope.setCurrentTab = function (tab) {
                        $scope.moreMenuShow();
                        var selectMenu = Enumerable.From($scope.data).Where("a=>a.tabName=='" + tab.tabName + "' && a.IsShow==" + true + "").FirstOrDefault();
                        if (selectMenu)
                            $scope.currentTab = selectMenu;
                        else {
                            var index = $scope.data.indexOf(tab);
                            var shownMenu = Enumerable.From($scope.data).Where("a=>a.IsShow==" + true + "").ToArray();
                            var firstIndex = 0,
                                lastIndex = 0;
                            if (shownMenu && shownMenu.length > 2) {
                                firstIndex = $scope.data.indexOf(shownMenu[1]);
                                lastIndex = $scope.data.indexOf(shownMenu[shownMenu.length - 2]);
                            }
                            if (firstIndex > 0 && index < firstIndex)
                                $scope.data.forEach(function (d, ind) {
                                    if ((ind >= index && ind < index + 8 - 1) || ind == 0 || ind == $scope.data.length - 1)
                                        d.IsShow = true;
                                    else
                                        d.IsShow = false;
                                });
                            else if (lastIndex > 0 && index > lastIndex)
                                $scope.data.forEach(function (d, ind) {
                                    if ((ind >= index + 1 - 7 && ind < index + 1) || ind == 0 || ind == $scope.data.length - 1)
                                        d.IsShow = true;
                                    else
                                        d.IsShow = false;
                                });
                            $scope.currentTab = tab;
                        }
                    };
                    $scope.moreMenuShow = function () {
                        $scope.showMore = !$scope.showMore;
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

            //为优化性能，对应父元素下的直接元素不可变化
            .directive('heightFill', heightFillDirective)

            /**
             * onlyNumXCheck :true,false 可以传递scope上的值，如果开启，每次变化会检查当前值是否完全符合配置的表达式，并会修改form和当前ngmodel的$valid $invalid
             * 
             * 支持两种配置方式
             * 1.only-num-x='5' 直接写数字  则只限制小数位小于等于5
             * 2.
             * 注：.两边的*可以是0个
             * only-num-x='***.***' 限制小数位数，限制整数位
             * only-num-x='***.&' 不限制小数位数，限制整数位
             * only-num-x='&.*****' 限制小数位数，不限制整数位
             * only-num-x='&.&' 不限制小数位数，不限制整数位
             * only-num-x='***.***' 限制小数位数，限制整数位，可以输入正数
             * only-num-x='-***.***' 限制小数位数，限制整数位，可以输入负数
             * only-num-x='(-)***.***' 限制小数位数，限制整数位,可以输入正负数
             */
            .directive('onlyNumX', onlyNumXDirective)

            /**
             * ng-model的字典项text value自动转化管道
             */
            .directive('dicFormatter', dicFormatterDirective)

            /**
             * 用于ng-model的百分比转化管道
             */
            .directive('percent', percentDirective)

            /**
             * 给域上绑定域所在DOM
             */
            .directive('binddom', binddomDirective)

            /**
             * 给域上绑定域所在DOM父级部分
             */
            .directive('binddomParent', binddomParentDirective)

            /**
             * dom绑定到scope
            */
            .directive('ngKeydownEnter', ngKeydownEnterDirective)


            /**
             * dom绑定到scope
             */
            .directive('domRef', domRefDirective);





        function onlyNumXDirective() {
            return {
                restrict: "A",
                scope: false,
                require: "ngModel",
                link: function (scope, element, attrs, modelCtrl) {

                    var CONSTKEY_onlyNumXCheck = "onlyNumXCheck";
                    var CONSTKEY_onlyNumX = "onlyNumX";

                    var configCheckExp = /^((?:\-)|(?:\(\-\)))?((?:\**)|&)\.((?:\**)|&)$/;
                    var configCheckResult = [];
                    var idx_intLimit = 2;
                    var idx_tofixedLimit = 3;
                    var idx_negativeStrategy = 1;

                    var config;
                    var tofixedLimit;
                    var intLimit;
                    var negativeStrategy; //negative 只允许负值 ； positive 只允许正值；both 正负都可以； 

                    var helperObj = {
                        /**
                         * 是否开启validator检查，开启后会改变form的valid状态   true,false 默认是false
                         */
                        get isCheckExpCheck() {
                            return scope.$eval(attrs[CONSTKEY_onlyNumXCheck]);
                        }
                    }

                    var inputExpStr;
                    var inputExp;
                    var checkExpStr;
                    var checkExp;
                    var arr;


                    config = attrs[CONSTKEY_onlyNumX];



                    if (configCheckExp.test(config)) {
                        // 如果符合完全配置方式,则提取参数进行配置
                        configCheckResult = configCheckExp.exec(config);
                        negativeStrategy = getNegativeStrategyByStrKey(configCheckResult[idx_negativeStrategy]);

                        if (configCheckResult[idx_intLimit] === '&') {
                            intLimit = '';
                        } else {
                            intLimit = configCheckResult[idx_intLimit].length;
                        }

                        if (configCheckResult[idx_tofixedLimit] === '&') {
                            tofixedLimit = '';
                        } else {
                            tofixedLimit = configCheckResult[idx_tofixedLimit].length;
                        }
                    } else if (config == '') {
                        negativeStrategy = "positive"
                        intLimit = '';
                        tofixedLimit = '';

                    } else {
                        negativeStrategy = "positive"
                        // 如果不符合完全配置方式，则认为传进来的是小数位，出错则认为无限制
                        intLimit = '';
                        try {
                            tofixedLimit = parseInt(config);
                        } catch (e) {
                            tofixedLimit = '';
                        }
                    }

                    inputExpStr = getExpForInput(intLimit, tofixedLimit, negativeStrategy);
                    inputExp = new RegExp(inputExpStr);

                    checkExpStr = getExpForCheck(intLimit, tofixedLimit, negativeStrategy);
                    checkExp = new RegExp(checkExpStr);


                    scope.$watch(function () {
                        return modelCtrl.$viewValue;
                    }, function (newValue, oldValue) {
                        try {
                            var result = newValue;
                            var old = oldValue;
                            if (result && Object.prototype.toString.call(result) === "[object String]") {
                                if (inputExp.test(newValue)) {
                                } else {
                                    modelCtrl.$setViewValue(old);
                                    modelCtrl.$render();
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    });


                    scope.$watch(function () {
                        return helperObj.isCheckExpCheck;
                    }, function () {
                        modelCtrl.$validate();
                    })


                    modelCtrl.$validators[CONSTKEY_onlyNumX] = resultCheckExpCheck;
                    modelCtrl.$parsers.push(convertStringToNumber);

                    function resultCheckExpCheck(modelValue, viewValue) {
                        if (helperObj.isCheckExpCheck) {
                            if (checkExp.test(viewValue)) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                        else {
                            return true;
                        }
                    }

                    function convertStringToNumber(srcValue) {
                        var result;
                        if (typeof srcValue === "undefined" || srcValue === null || srcValue === '') {
                            result = null;
                        } else {
                            var result = parseFloat(srcValue);
                        }
                        return result;
                    }

                    function getNegativeStrategyByStrKey(key) {
                        if (key) {
                            if (key == "(-)") {
                                return "both";
                            }
                            else if (key == "-") {
                                return "negative";
                            }
                        } else {
                            return "positive";
                        }
                    }


                    function getExpForInput(limit_int, limit_tofixed, negativeStrategyStr) {
                        //通过赋值limit只能是数字或者''
                        var result = "";
                        var resultNumberPart;
                        var resultInt;
                        var resultTofixed;
                        var resultNegativeStrategyStr;


                        if (isNumber(limit_int)) {
                            if (limit_int === 0) {
                                resultInt = "(0)";
                            } else {
                                resultInt = "([1-9]\\d{0," + (limit_int - 1) + "}|0)";
                            }
                        } else if (limit_int === '') {
                            resultInt = "([1-9]\\d*|0)";
                        }

                        if (isNumber(limit_tofixed)) {
                            if (limit_tofixed === 0) {
                                resultTofixed = ''
                            } else {
                                resultTofixed = "(\\.\\d{0," + limit_tofixed + "})?";
                            }

                        } else if (limit_tofixed === '') {
                            resultTofixed = "(\\.\\d*)?";
                        }
                        resultNumberPart = resultInt + resultTofixed;


                        if (negativeStrategyStr == "positive") {
                            result = "^(" + resultNumberPart + ")?$";
                        } else if (negativeStrategyStr == "negative") {
                            result = "^(\\-)(" + resultNumberPart + ")?$";
                        }
                        else if (negativeStrategyStr == "both") {
                            result = "^(\\-)?(" + resultNumberPart + ")?$";
                        }
                        return result;
                    }

                    function getExpForCheck(limit_int, limit_tofixed, negativeStrategyStr) {
                        //通过赋值limit只能是数字或者''
                        var result = "";
                        var resultNumberPart;
                        var resultInt;
                        var resultTofixed;
                        var resultNegativeStrategyStr;

                        if (isNumber(limit_int)) {
                            if (limit_int === 0) {
                                resultInt = "(0)";
                            } else {
                                resultInt = "([1-9]\\d{" + (limit_int - 1) + "}|0)";
                            }
                        } else if (limit_int === '') {
                            resultInt = "([1-9]\\d*|0)";
                        }

                        if (isNumber(limit_tofixed)) {
                            if (limit_tofixed === 0) {
                                resultTofixed = ''
                            } else {
                                resultTofixed = "(\\.\\d{" + limit_tofixed + "})";
                            }

                        } else if (limit_tofixed === '') {
                            resultTofixed = "(\\.\\d*)?";
                        }
                        resultNumberPart = resultInt + resultTofixed;

                        if (negativeStrategyStr == "positive") {
                            result = "^(" + resultNumberPart + ")$";
                        } else if (negativeStrategyStr == "negative") {
                            result = "^(\\-)(" + resultNumberPart + ")$";
                        }
                        else if (negativeStrategyStr == "both") {
                            result = "^(\\-)?(" + resultNumberPart + ")$";
                        }
                        return result;
                    }





                    function isNumber(v) {
                        return angular.isNumber(v);
                    }
                }
            }
        }

        function heightFillDirective($templateRequest, $timeout, $document) {
            return {
                restrict: "A",
                scope: false,
                link: function (scope, element, attrs) {
                    var regex_notEle = /^(SCRIPT|STYLE)$/

                    var jqEle_parent = $(element).parent();
                    var childrens = jqEle_parent.children();
                    var otherHeight = 0;
                    scope.$watch(function () {
                        var p_height = jqEle_parent.height();
                        otherHeight = 0;
                        var a = [];
                        for (var index = 0; index < childrens.length; index++) {

                            var currentele = childrens[index];
                            if (currentele == element[0] || regex_notEle.test(currentele.tagName)) continue;
                            var currentH = getFullHeight(currentele)
                            otherHeight += currentH;
                            a.push(currentH);
                        }
                        // $.each(childrens, function (i, v) {
                        //     otherHeight += getFullHeight(v);
                        // });

                        return p_height - otherHeight;
                    }, function (newValue) {
                        var isBorderBox = element.css("boxSizing") == "border-box";
                        var meOther = 0;
                        if (isBorderBox) {
                            meOther = getMarginHeight(element);
                        } else {
                            meOther = getMarginHeight(element) + getBorderHeight(element);
                        }
                        try {
                            var result = newValue - meOther;
                            element.css("height", result + "px");
                        } catch (e) {
                            console.log("打印父元素")
                            console.log(jqEle_parent);
                            console.log("打印height函数")
                            console.log(jqEle_parent.height);
                        }

                    });
                },
            }


        }

        function dicFormatterDirective($timeout) {
            return {
                restrict: "A",
                scope: false,
                require: "ngModel",
                link: function (scope, element, attrs, modelCtrl) {
                    var myObj = {
                        dicObj: []
                    }

                    scope.$watchCollection(function () {
                        return scope.$eval(attrs.dicFormatter);
                    }, function (val_new) {
                        $timeout(function () {
                            myObj.dicObj = val_new;
                            localFormatterAndRender();
                        })
                    })

                    //从ngModelWatch copy 过来的
                    function localFormatterAndRender() {
                        var modelValue = modelCtrl.$modelValue;
                        var formatters = modelCtrl.$formatters,
                            idx = formatters.length;

                        var viewValue = modelValue;
                        while (idx--) {
                            viewValue = formatters[idx](viewValue);
                        }

                        modelCtrl.$viewValue = modelCtrl.$$lastCommittedViewValue = viewValue;
                        modelCtrl.$render();
                    }


                    var dicFormatterValue = scope.$eval(attrs.dicFormatterValue) || "value";
                    var dicFormatterText = attrs.dicFormatterText && scope.$eval(attrs.dicFormatterText) || "text";
                    modelCtrl.$parsers.push(convertTextToValue);
                    modelCtrl.$formatters.push(convertValueToText);

                    function convertTextToValue(val_text) {
                        var result = null;
                        var resultObj = myObj.dicObj.find(function (item) {
                            return item[dicFormatterText] == val_text
                        });
                        if (resultObj) {
                            result = resultObj[dicFormatterValue];
                        }
                        return result;
                    }

                    function convertValueToText(val_value) {
                        var result = null;
                        var resultObj = myObj.dicObj.find(function (item) {
                            return item[dicFormatterValue] == val_value
                        });
                        if (resultObj) {
                            result = resultObj[dicFormatterText];
                        }
                        return result;
                    }
                }
            }
        }

        function percentDirective() {
            return {
                restrict: "A",
                scope: false,
                require: "ngModel",
                link: function (scope, element, attrs, modelCtrl) {
                    limit_tofixed = 2;
                    //暂时只定义了单向
                    modelCtrl.$formatters.push(convertValueToPercentText);

                    function convertValueToPercentText(val_src) {
                        var result = null;
                        if (angular.isNumber(val_src)) {
                            result = (val_src * 100).toFixed(2) + '%';
                        }
                        else {
                            result = null;
                        }
                        return result;
                    }
                }
            }
        }

        function binddomDirective(modelParse) {
            return {
                restrict: "A",
                scope: false,
                require: '^binddomParent',
                link: function (scope, element, attrs, binddomParentCtrl) {
                    var parentElement = binddomParentCtrl.currentElement;
                    var exp = attrs.binddom;
                    var modeltoset = new modelParse(scope, exp);
                    modeltoset.modelSet({
                        element: element,
                        scrollToMe: function () {
                            var scrollEle = parentElement[0];
                            var meEle = this.element[0];
                            scrollEle.scrollBy(0,
                                meEle.getBoundingClientRect().top - scrollEle.getBoundingClientRect().top
                            );
                        }
                    });
                }
            }
        }


        function binddomParentDirective(modelParse) {
            return {
                restrict: "A",
                scope: false,
                controller: function ($scope, $element) {
                    this.currentElement = $element;
                }
            }
        }

        function domRefDirective(modelParse) {
            return {
                restrict: "A",
                scope: false,
                link: function (scope, element, attrs) {
                    var exp = attrs.domRef;
                    var modeltoset = new modelParse(scope, exp);
                    modeltoset.modelSet({
                        element: element,
                        scrollToBottom: function () {
                            var meEle = this.element[0];
                            meEle.scrollBy(0,
                                meEle.getBoundingClientRect().top
                            );
                        }
                    });
                }
            }
        }

        function ngKeydownEnterDirective($parse) {
            return {
                restrict: "A",
                scope: false,
                link: function (scope, element, attrs) {
                    var exp = attrs.ngKeydownEnter;
                    var parsedExp = $parse(exp);
                    element.on('keydown', function (e) {
                        var keycode = window.event ? e.keyCode : e.which;
                        if (keycode == 13) {
                            e.preventDefault();
                            parsedExp(scope, { $event: e });
                        }
                    })
                }
            }
        }

    })();

    (function () {

        angular.module('wcontrol')
            .directive('chatContent', chatContentDirective);

        function chatContentDirective($timeout) {
            return {
                restrict: "E",
                scope: {
                    collection: "="
                },
                replace: false,
                templateUrl: "/lib/angular-wcontrol/chatContent/chatContent.html",

                link: function (scope, element, attrs) {
                    var meEle = element;
                    var ele = meEle.find('.chatContent')[0];
                    scope.$watchCollection('collection', function () {
                        $timeout(function () {
                            ele.scrollBy(0,
                                ele.scrollHeight
                            );
                        }, 500);

                    });
                }
            }
        }
    })();

})();