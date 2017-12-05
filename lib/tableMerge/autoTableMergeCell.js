define(['tableMergeCell', 'jquery'], function (tableMergeCell) {
    return autoTableMergeCell;

    function autoTableMergeCell(table, config) {
        var defaultConfig = {
            cols: [],
        }

        //基本信息
        var $table = $(table);
        var $config = $.extend(defaultConfig, config);

        //优化性能的公共属性，避免重复计算
        var rows = [];
        var rowCount = 0;

        function getConfigFromAutoConfig(tableData, cfg) {
            //直接参数与结果
            var result = {
                mergeList: []
            };
            var cols = cfg.cols.map(t => parseInt(t));

            //中间变量
            var colDatas = getColDatas($table, $config);

            var basegroup = [groupObjConstructor(0, rowCount - 1)];
            colDatas.forEach(function (v, i) {
                var colData = v;
                var currentColDataResult = getGroupByColDataAndBaseGroup(colData, basegroup);
                var currentColDataFullResult = getTableMergeUnitConfig(currentColDataResult, cols[i])
                result.mergeList = result.mergeList.concat(currentColDataFullResult);

                //准备下一个
                basegroup = currentColDataResult;
            });

            return result;

            function groupArrayConstructor(startRowIndex, endRowIndex, currentColIndex) {
                return {
                    startRowIndex: startRowIndex,
                    endRowIndex: endRowIndex,
                    startColIndex: currentColIndex,
                    endColIndex: currentColIndex
                }
            }

            function getTableMergeUnitConfig(groupArray, currentColIndex) {
                var result = [];
                groupArray.forEach(function (v, i) {
                    result.push({
                        startRowIndex: v.startIndex,
                        endRowIndex: v.endIndex,
                        startColIndex: currentColIndex,
                        endColIndex: currentColIndex
                    })
                });

                return result;
            }
        }

        function getColDatas($table, $config) {
            var rr = [];
            for (var index = 0; index < $config.cols.length; index++) {
                var r = rows.map((i, v) => $(v).children("td:eq(" + index + ")").html());
                rr.push(r);
            }
            return rr;
        }

        /**
         * 在基础分组的基础上对当前列数据进行进一步分组
         * @param {Array} colData  列数据
         * @param {Array} baseGroupArray  基础分类组
         */
        function getGroupByColDataAndBaseGroup(colData, baseGroupArray) {
            var result = [];
            baseGroupArray.forEach(function (v, i) {
                var startIndex = v.startIndex;
                var endIndex = v.endIndex;
                var calcResultGroupArray = colData.slice(startIndex, endIndex + 1);

                var relativeGroupArray = getGroupByData(calcResultGroupArray);
                var absoluteGroupArray = getAbsoluteByRelative(relativeGroupArray, startIndex);
                result = result.concat(absoluteGroupArray);
            });
            return result;

            function getAbsoluteByRelative(relative, baseIndex) {
                var result = [];
                relative.forEach(function (v) {
                    this.push(absoluteGroupObjConstructor(v.startIndex, v.endIndex, baseIndex));
                }, result);
                return result;
            }


        }

        /**
        * 对指定数据进行分组
        * @param {Array} data  数组数据      
        */
        function getGroupByData(data) {
            var result = [];

            var startIndex = 0;
            var endIndex = 0;

            var length = data.length;
            var lastIndex = length - 1;

            if (length == 1) {
                result.push(groupObjConstructor(0, 0));
            }
            else {
                startIndex = 0;
                for (var index = 0; index <= length; index++) {
                    if (data[index] != data[startIndex]) {
                        endIndex = index - 1;
                        result.push(groupObjConstructor(startIndex, endIndex))

                        //准备下一次循环
                        startIndex = index;
                    }
                    else {
                        continue;
                    }
                }
            }

            return result;


        }

        /**
         * 绝对定位group对象构造器
         * @param {number} startIndex 相对起始索引
         * @param {number} endIndex 相对结束索引
         * @param {number} baseIndex 基础索引
         */
        function absoluteGroupObjConstructor(startIndex, endIndex, baseIndex) {
            return {
                startIndex: startIndex + baseIndex,
                endIndex: endIndex + baseIndex,
            }
        }

        /**
        * 相对定位group对象构造器
        * @param {number} startIndex 起始索引
        * @param {number} endIndex 结束索引
        */
        function groupObjConstructor(startIndex, endIndex) {
            return {
                startIndex: startIndex,
                endIndex: endIndex,
            }
        }


        return {
            execute: function executeMe() {
                rows = $("tbody tr", $table);
                rowCount = rows.length;

                if (rowCount <= 1) return;
                var tableMergeCellConfig = getConfigFromAutoConfig($table, $config);
                var $tableMerger = new tableMergeCell($table, tableMergeCellConfig);
                $tableMerger.execute();
            },
            config: function configMe(cfg) {
                $config = $.extend(defaultConfig, cfg);
            }
        }
    }
});


