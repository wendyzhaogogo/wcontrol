require.config({
    baseUrl: '',
    paths: {
        'angular': 'lib/angular/angular',
        'jquery': "lib/jquery-1.11.1.min",
        'linq': 'lib/linq',

        'tableMergeCell': ["lib/tableMerge/tableMergeCell"],
        'autoTableMergeCell': ["lib/tableMerge/autoTableMergeCell"],

        'testPageModule': 'js/test/testPageModule',
        'testPageModule_Load': 'js/test/testPageModule_Load',
        'testPageController': 'js/test/testPageController',
        'testDirective': 'js/test/testDirective',
    },
    shim: {
        // 'autoTableMergeCell': ['tableMergeCell'],
        //'tableMergeCell': ['jquery'],
              
    }
});