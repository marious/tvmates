<?php
require_once dirname( __FILE__ ) . '/includes/setup.php';

use TVMates\Libs\Helper;

if (Helper::isAjax())
{
    $userController = new \TVMates\Controllers\UsersController();
    $errors = $userController->login();

    if (count($errors) && is_array($errors))
    {
        echo Helper::jsonEncode([
            'error' => true,
            'validation' => $errors,
        ]);
        exit;
    }

    echo Helper::jsonEncode(['error' => false]);
    exit;
}


