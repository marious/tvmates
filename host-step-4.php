<?php
require_once dirname( __FILE__ ) . '/includes/setup.php';

use TVMates\Libs\Helper;

Helper::guard();

if (Helper::isAjax())
{
    $locationController = new \TVMates\Controllers\LocationController();
    $errors = $locationController->setLocationOptions();

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
    'hostTitle'     => 'Passo 4/4 Options',
]);

$twig->show('header');
$twig->show('secondary-menu');
$twig->show('modules/host/host_step_4');
$twig->show('footer-scripts');
//$twig->show('footer');

