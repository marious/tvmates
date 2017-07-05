<?php
include_once dirname(__FILE__) . '/includes/setup.php';
session_destroy();
header('Location: index.php');
exit;