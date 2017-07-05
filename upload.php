<?php
require_once dirname( __FILE__ ) . '/includes/setup.php';

use TVMates\Libs\Upload\UploadFile;

if(!isset($_SERVER['HTTP_X_REQUESTED_WITH'])) {
    exit;  //try detect AJAX request, simply exist if no Ajax
}

$max = 100 * 1024;
$messages = [];

$userDIr = dirname(__FILE__) . '/uploads/' . $_SESSION['user_key'] . '/';
if (!file_exists($userDIr)) {
    $oldmask = umask(0);
    mkdir($userDIr, 0777);
    umask($oldmask);
}


$destination = $userDIr;

try {
    $upload = new UploadFile($destination);
    $upload->setMaxSize($max);      // optional (you can define maxsize inside class)
    $upload->allowAllTypes();    // you can add custom suffix(by typing it )  || you can ommit it to add default suffix to harmful file || your can add '' to prevent adding suffix
    $upload->upload();
    $messages = $upload->getMessages();
    //var_dump($upload);
} catch (Exception $e) {
    $messages[] = $e->getMessage();
}

echo json_encode($messages, true);
