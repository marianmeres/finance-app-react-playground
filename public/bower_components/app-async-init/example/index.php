<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>App async init example</title>
    <script><?php echo file_get_contents('./loadjs.min.js') ?></script>
    <script><?php echo file_get_contents('../dist/app-async-init.min.js') ?></script>
    <script><?php echo file_get_contents('../dist/app-callback-stack.min.js') ?></script>
    <style>
        body {padding: 3em;}
    </style>
</head>
<body>

<div id="app">Loading, please wait...</div>

<script>
    appAsyncInit.push(function(){
        // everything we critically need is loaded and executed, any optional
        // sanity checks are made, and we are safe to start running our app...
        app.initialize($('#app'));
    })
</script>

<script>
    // list of 3rd party dependecies we critically need and the app itself...
    var urls = [
        "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css",
        "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js",
        "https://code.jquery.com/jquery-3.1.1.slim.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js",
        "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js",
        "app.js"
    ];
    // by design, the "loadAndRun" must be called only once (it logs error if called multiple times)
    appAsyncInit.loadAndRun(urls, function() { // optional...
        // idea is to do any additional sanity checks here, and if problems
        // are found just return false. None of the registered callbacks
        // (via appAsyncInit.push) will be executed

        // for now, everything is OK, so:
        return true;
    })
</script>

<script>
    // this example ilustrates the usage of appCallbackStack... imagine this:
    //
    // 1. we have to load 3rd party libs via theirs own async loading and initializing
    //    (e.g. Facebook SDK, Google auth), but we dont want to include them as
    //    a hard "pre" load dependency for our app
    //
    // 2. we want to have transparent machanism of letting the global context
    //    know once these libs (or anything we label by name) are ready
    //
    window.fooAsyncInit = function() { // looks familiar? ;)
        FOO.init();

        // this is the signal that our thing (labeled as 'foo') just became ready
        appCallbackStack.ready('foo');
    };

    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "foo-sdk.php";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'foo-jssdk'));
</script>

<p style="margin-top: 3em;"><small>
    Source on <a href="https://github.com/marianmeres/app-async-init">GitHub</a>
</small></p>

</body>
</html>