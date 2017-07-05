<?php
require_once dirname( __FILE__ ) . '/includes/setup.php';

use TVMates\Libs\Helper;

Helper::guard();

if (Helper::isAjax())
{
    $hostController = new \TVMates\Controllers\HostController();
    $errors = $hostController->hosterHome();

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
    'hostTitle'     => 'Passo 1/4 Indrizzo',
]);

$twig->show('header');
$twig->show('secondary-menu');
$twig->show('modules/host/host_step_1');
$twig->show('footer-scripts');