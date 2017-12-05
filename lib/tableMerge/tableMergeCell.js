define(['jquery'], function ($) {
    return tableMergeCell;
    function tableMergeCell(table, config) {
        var defaultConfig = {
            mergeList: [
            ]
        }

        var $table = $(table);
        var $config = $.extend(defaultConfig, config);

        function executeMe() {
            $config.mergeList.forEach(function (element) {
                mergeUnit(element);
            }, this);
        }

        function configMe(opt) {
            $config = $.extend(defaultConfig, opt);
        }

        function mergeUnit(params) {
            var startRowIndex = params.startRowIndex;
            var endRowIndex = params.endRowIndex;
            var startColIndex = params.startColIndex;
            var endColIndex = params.endColIndex;

            var rowspan = endRowIndex - startRowIndex + 1;
            var colspan = endColIndex - startColIndex + 1;

            var r = 0;
            var c = 0;
            for (r = startRowIndex; r <= endRowIndex; r++) {
                var $currentRow = $("tbody tr:eq(" + r + ")", $table);
                for (c = startColIndex; c <= endColIndex; c++) {
                    var $currentCell = $("td:eq(" + c + ")", $currentRow);
                    if (r == startRowIndex && c == startColIndex) {
                        $currentCell.attr("rowspan", rowspan);
                        $currentCell.attr("colspan", colspan);
                    }
                    else {
                        $currentCell.hide();
                    }
                }
            }
        }

        return {
            execute: executeMe,
            config: configMe
        }
    }
});


