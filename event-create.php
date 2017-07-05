<?php
require_once dirname( __FILE__ ) . '/includes/setup.php';

use TVMates\Libs\Helper;

Helper::guard();


$twig->show('header');
$twig->show('secondary-menu');
$twig->show('modules/events/event-create');
$twig->show('footer-scripts');