
require(['tableMergeCell', 'jquery'], function (tableMergeCell) {
    return autoTableMergeCell;

    function autoTableMergeCell(table, config) {
        var defaultConfig = {
            cols: [],
            startRowIndex: 0,
            endRowIndex: 100
        }

        var $table = $(table);
        var $config = $.extend(defaultConfig, config);

        function getConfigFromAutoConfig(tableData, cfg) {
            //直接参数与结果
            var result = [];
            var cols = cfg.cols;
            var startRowIndex = cfg.startRowIndex;
            var endRowIndex = cfg.endRowIndex;

            //中间变量
            var colDatas= (function(){
                return
            })();



            result.push({
                startRowIndex: 0,
                endRowIndex: 1,
                startColIndex: 0,
                endColIndex: 0
            });
            return result;
        }

        /**
         * 在基础分组的基础上对当前列数据进行进一步分组
         * @param {Array} colData  列数据
         * @param {Array} baseGroup  基础分类组
         */
        function getGroupByColDataAndBaseGroup(colData, baseGroup) {

        }




        return {
            execute: function executeMe() {
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


