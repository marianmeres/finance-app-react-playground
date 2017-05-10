<?php
    require_once "./_helpers.php";

    $output = null;

    try {
        if (empty($_REQUEST['username']) || empty($_REQUEST['password'])) {
            throw new Exception("Missing required parameters");
        }

        // NOTE: normalizing password (to lowercase or else) is STUPID in real world...
        $username = strtolower($_REQUEST['username']);
        $password = strtolower($_REQUEST['password']);
        $rows = json_decode(file_get_contents("../../data/user.json"), true);
        $user = null;

        //
        foreach ($rows as $row) {
            if ($row['login'] == $username && $row['password'] == $password) {
                $user = $row;
                unset($user['login']);
                unset($user['password']);
                break;
            }
        }

        if (!$user) {
            throw new Exception("Invalid name and/or password");
        }

        $output = apiOutput($user);

    } catch (\Exception $e) {
        $output = apiOutput(null, $e);
    }

    // serve out
    header("Content-type: application/json");
    echo json_encode($output);
