<?php
    define(
        "APPLICATION_ENV",
        preg_match('/local/', $_SERVER['SERVER_NAME']) ? 'development' : 'production' // quick-n-dirty
    );
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Finance app (react playground)</title>
    <script><?php echo file_get_contents('./bower_components/loadjs/dist/loadjs.min.js') ?></script>
    <script><?php echo file_get_contents('./bower_components/app-async-init/dist/app-async-init.min.js') ?></script>
    <script><?php echo file_get_contents('./bower_components/app-async-init/dist/app-callback-stack.min.js') ?></script>
    <style><?php  echo file_get_contents('./dist/css/reboot.css'); ?></style>
</head>
<body>

    <div id="app">Loading, please wait...</div>

    <script>
        appAsyncInit.push(function(){
            var app = window.appFactory('app', {
                bemNs: 'mmfa', // custom BEM namespace (prefix)
                loginApiEndpoint: 'api/login.php',
                maxAccountsLimit: 4,
                transactionCategories: <?php
                    // this stupid decode/encode is here just to "minify" the json formatting (as it is maintained by hand)
                    echo json_encode(json_decode(file_get_contents("../data/transaction_category.json")))
                ?>
            });

            // example of calling the exposed api:
            //app.foo();
        })
    </script>

    <script>
        // load deps (will be loaded in parallel, but executed in order)
        appAsyncInit.loadAndRun(
            [
                "bower_components/react/react.js",
                "bower_components/react/react-dom.js",
                "bower_components/font-awesome/css/font-awesome.min.css",
                "bower_components/chart.js/dist/Chart.min.js",
                "<?= _versionize("dist/css/main.css") ?>",
                "<?= _versionize("dist/js/app.js") ?>"
            ],
            function() {
                if (!window.appFactory) {
                    alert("Unexpected fatal error (missing app factory)...");
                    return false;
                }
                return true;
            }
        )
    </script>

    <?php if (file_exists(__DIR__ . "/_ga.php")) include __DIR__ . "/_ga.php"; ?>

</body>
</html>
<?php

    function _versionize($f) {
        return (
            "$f?v=" . substr(md5_file($f), 0, 6)
            // this is a little hack for loadjs, as it apparently looks for file extension
            // quite naively, so we add the extension to our version "v" param as well
            . substr($f, -4)
        );
    }