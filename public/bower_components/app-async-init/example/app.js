
var app = {

    initialize: function($root) {
        $root.html([
            '<p><b>',
                'Dependencies are loaded, app is initialized, we\'re safe to start...',
            '</b></p>'
        ].join(""));

        this.$fooButton = $([
            '<button disabled>',
                '...in the meantime we\'re still waiting for Foo',
            '</button>'
        ].join(""))
            .appendTo($root);

        // this is critical to our foo example
        appCallbackStack.push('foo', this.onFooReady.bind(this));
    },

    onFooReady: function() {
        this.$fooButton
            .on('click', function(){ alert('bar') })
            .prop('disabled', false)
            .html('Foo ready!');
    }

};
