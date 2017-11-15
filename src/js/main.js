require.config({
    paths: {
        'Util': 'util-require',
        'Data': 'data',
        'Action': 'action'
    }
});

require(['Action'], function (Action) {
    Action.init();
});