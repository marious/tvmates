<?php
require_once dirname( __FILE__ ) . '/includes/setup.php';

use TVMates\Libs\Helper;

Helper::guard();

if (Helper::isAjax())
{
    $deviceController = new \TVMates\Controllers\DeviceController();
    $errors = $deviceController->setDevice();

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

$twig->set([
    'hostTitle'     => 'Passo 3/4 Apparecchio',
]);

$twig->show('header');
$twig->show('secondary-menu');
$twig->show('modules/host/host_step_3');
$twig->show('footer-scripts');
//$twig->show('footer');

