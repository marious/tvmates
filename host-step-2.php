<?php
require_once dirname( __FILE__ ) . '/includes/setup.php';

use TVMates\Libs\Helper;

Helper::guard();

if (Helper::isAjax())
{
    $locationController = new \TVMates\Controllers\LocationController();
    $errors = $locationController->setLocationInfo();

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
    'hostTitle'     => 'Passo 2/4 Location',
]);

$twig->js([
    'plugins/jquery.filedrop',
    'modules/handle_upload',
]);

$twig->show('header');
$twig->show('secondary-menu');
$twig->show('modules/host/host_step_2');
$twig->show('footer-scripts');
//$twig->show('footer');
