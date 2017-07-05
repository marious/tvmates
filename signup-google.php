<?php

require_once dirname( __FILE__ ) . '/includes/setup.php';
require_once dirname(__FILE__) . '/includes/Modules/googleconfig.php';

if(isset($_GET['code'])){

    $gClient->authenticate($_GET['code']);

    $_SESSION['token'] = $gClient->getAccessToken();

    header('Location: ' . filter_var($redirectURL, FILTER_SANITIZE_URL));
}

if (isset($_SESSION['token'])) {
    $gClient->setAccessToken($_SESSION['token']);
}

if ($gClient->getAccessToken()) {
    //Get user profile data from google
    $gpUserProfile = $google_oauthV2->userinfo->get();


    //Initialize User class
    $user = new \TVMates\Models\UserModel();

    //Insert or update user data to the database
    $gpUserData = array(
        'oauth_provider'=> 'google',
        'oauth_uid'     => $gpUserProfile['id'],
        'first_name'    => $gpUserProfile['given_name'],
        'last_name'     => $gpUserProfile['family_name'],
        'email'         => $gpUserProfile['email'],
        'gender'        => $gpUserProfile['gender'],
        'locale'        => $gpUserProfile['locale'],
        'picture'       => $gpUserProfile['picture'],
        'link'          => $gpUserProfile['link']
    );
    $userData = $user->checkUser($gpUserData);

    //Storing user data into session
    $_SESSION['userData'] = $userData;

    $_SESSION['user_key'] = $userData['id'];
    $_SESSION['logged_in'] = true;

    //Render facebook profile data
    if(!empty($userData)){

        header("location: index.php");

    }else{

        echo '<h3 style="color:red">Some problem occurred, please try again.</h3>';
    }
} else {

    $authUrl = $gClient->createAuthUrl();

//    header("location:$authUrl");
}

if (\TVMates\Libs\Helper::isAjax()) {
    echo json_encode(['link' => $authUrl]);
    exit;
}