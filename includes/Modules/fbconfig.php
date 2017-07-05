<?php
//if (!session_id()) {
//    session_start();
//}

require_once dirname(__FILE__) . '/../config.php';
// Include the autoloader provided in the SDK
require_once dirname(__FILE__) . '/../facebook-php-sdk/autoload.php';

// Include required libraries
use Facebook\Facebook;
use Facebook\Exceptions\FacebookResponseException;
use Facebook\Exceptions\FacebookSDKException;

$fbAppId         = '118994188709525'; //Facebook App ID
$fbAppSecret     = 'f889a0d574415497877197556ce02a0a'; //Facebook App Secret
$fbRedirectUrl   = URL_ROOT .  '/signup-facebook.php'; //Callback URL
$fbPermissions = array("email,public_profile");  //Optional permissionss


$fb = new Facebook(array(
    'app_id' => $fbAppId,
    'app_secret' => $fbAppSecret,
    'default_graph_version' => 'v2.9'
));
// Get redirect login helper
$fbhelper = $fb->getRedirectLoginHelper();


//$facebookLoginUrl = $fbhelper->getLoginUrl($fbRedirectUrl, $fbPermissions);

// Try to get access token



try {
    if (isset($_SESSION['facebook_access_token'])) {
        $accessToken = $_SESSION['facebook_access_token'];
    } else {
        $accessToken = $fbhelper->getAccessToken();
    }
    $facebookLoginUrl = $fbhelper->getLoginUrl($fbRedirectUrl, $fbPermissions);

} catch (FacebookResponseException $e) {
    echo 'Graph returned an error: ' . $e->getMessage();
    exit;
} catch (FacebookSDKException $e) {
    echo 'Facebook SDK returned an error: ' . $e->getMessage();
    exit;
}



