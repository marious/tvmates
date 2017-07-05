<?php
require_once dirname( __FILE__ ) . '/includes/setup.php';

use TVMates\Libs\Helper;

//Helper::guard();

$twig->show('header');
$twig->show('third-menu');
$twig->show('modules/host/behost');
$twig->show('footer');