<?php

/**
 * Helper to wrap actual data payload into a custom normalized envelope holding
 * some meta data for the client (in case needed)
 *
 * @param $payload
 * @param null $error
 * @return array
 */
function apiOutput($payload, $error = null) {
    $ok = true;
    if ($error) {
        $ok = false;
        if ($error instanceof \Exception) {
            $error = $error->getMessage();
        }
    }

    return [
        'ok' => $ok,
        'error' => $error,
        'payload' => $payload,
        '_server_now' => date('c'),
    ];
}