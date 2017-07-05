<?php
if (!session_id()) {
    session_start();
}

require_once dirname(__FILE__) . '/../config.php';
include_once  dirname(__FILE__) . '/../google-php-sdk/Google_Client.php';
include_once  dirname(__FILE__) . '/../google-php-sdk/contrib/Google_Oauth2Service.php';


/*
 * Configuration and setup Google API
 */
$gclientId = '475755399864-vqfc2h1109d6sjlr6sqd38a9p59jrpls.apps.googleusercontent.com';

$gclientSecret = 'zHIJrzeDWElEqGa-fgDBbQYr';

$gredirectURL   = URL_ROOT .  '/signup-google.php'; //Callback URL

//Call Google API
$gClient = new Google_Client();

$gClient->setApplicationName('tvmates');

$gClient->setClientId($gclientId);

$gClient->setClientSecret($gclientSecret);

$gClient->setRedirectUri($gredirectURL);

// $gClient->addScope('https://mail.google.com/');
//$gClient->setScopes(array(
////    "https://www.googleapis.com/auth/plus.login",
////    "https://www.googleapis.com/auth/userinfo.email",
////    "https://www.googleapis.com/auth/userinfo.profile",
////    "https://www.googleapis.com/auth/plus.me",
////    "https://mail.google.com/"
//));


$google_oauthV2 = new Google_Oauth2Service($gClient);
$googleAuthUrl = $gClient->createAuthUrl();