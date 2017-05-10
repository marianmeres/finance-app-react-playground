
/**
 * Simple callback stack, labeled by name
 *
 * @type {{push, init}}
 */
var appCallbackStack = (function(){
    "use strict";

    var _stacks = {};
    var _initialized = {};

    return {

        /**
         * @param stackLabel
         * @param cb
         */
        push: function(stackLabel, cb){
            if (_initialized[stackLabel]) { return cb ? cb() : null; }
            _stacks[stackLabel] = _stacks[stackLabel] || [];
            cb && _stacks[stackLabel].push(cb);
        },

        /**
         * @param stackLabel
         */
        ready: function(stackLabel){
            _initialized[stackLabel] = true;
            _stacks[stackLabel] = _stacks[stackLabel] || [];
            _stacks[stackLabel].forEach(function(fn){ fn(); }); // fifo
        }

    }
})();