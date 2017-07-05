<?php
require_once dirname( __FILE__ ) . '/includes/setup.php';

use TVMates\Libs\Helper;
//
if ( Helper::isAjax() )
{
    $userController = new \TVMates\Controllers\UsersController();
    $errors = $userController->register();


    if (count($errors)) {
        echo Helper::jsonEncode([
            'error' => true,
            'validation' => $errors,
        ]);
        exit;
    } else {
        echo Helper::jsonEncode([
            'success' => true,
            'successMsg' => 'you have successfully registered please check your email address to complete registration',
            'error' => false,
        ]);
        exit;
    }
}


header('Location: index.php');

