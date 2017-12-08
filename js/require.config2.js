require.config({
    baseUrl: '',
    paths: {

        'angular': 'lib/angular/angular',
        'angular-cookies': 'lib/angular/angular-cookies.min',
        'angular-route': 'lib/angular/angular-route.min',
        'angular-animate': 'lib/angular/angular-animate.min',
        'angular-locale_zh-cn': 'lib/angular/i18n/angular-locale_zh-cn',
        'angular-messages': 'lib/angular/angular-messages.min',
        'angular-sanitize': 'lib/angular/angular-sanitize.min',
        'angular-ui-tree': 'lib/angular/angular-ui-tree.min',
        'angular-ui-router': 'lib/angular/angular-ui-router',

        'jquery': "lib/jquery-1.11.1.min",
        'linq': 'lib/linq',

        'needLoadModuleSet': 'lib/needLoad/needLoad-moduleSet',
        'needLoadWrapper': 'lib/needLoad/needLoad-wrapper',

        'requireLoadModule': 'js/test2/requireLoadModule',
        'subcontroller1': 'js/test2/subcontroller1',
        'subcontroller2': 'js/test2/subcontroller2',
        'subcontroller3': 'js/test2/subcontroller3',
        'subcontroller1-1': 'js/test2/subcontroller1-1',
        'subcontroller2-1': 'js/test2/subcontroller2-1',
        'subcontroller3-1': 'js/test2/subcontroller3-1',
        'subcontroller1-2': 'js/test2/subcontroller1-2',
        'subcontroller2-2': 'js/test2/subcontroller2-2',
        'subcontroller3-2': 'js/test2/subcontroller3-2',
        'requireLoadController': 'js/test2/requireLoadController',

    },
    shim: {
        'angular-sanitize': ['angular'],
        'angular-cookies': ['angular'],
        'angular-route': ['angular'],
        'angular-animate': ['angular'],
        'angular-ui-tree': ['angular'],
        'angular-locale_zh-cn': ['angular'],
        'angular-messages': ['angular'],
        'angular-ui-router': ['angular'],

        'requireLoadModule': ['angular', 'angular-cookies', 'angular-sanitize', 'angular-messages', 'angular-route', 'angular-animate',
            'angular-locale_zh-cn', 'angular-ui-tree', 'angular-ui-router',
        ]
    }
});