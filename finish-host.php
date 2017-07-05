<?php
require_once dirname( __FILE__ ) . '/includes/setup.php';

$twig->show('header');
$twig->show('secondary-menu');
$twig->show('modules/host/finish');
$twig->show('footer');