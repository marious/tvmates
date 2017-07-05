<?php

	ini_set('display_errors', 'On');

	require_once dirname( __FILE__ ) . '/config.php';
	require_once dirname( __FILE__ ) . '/autoloader.php';

    // PSR4 autoload for classes with namespaces in src directory
    require_once dirname(__FILE__) . '/Defaults/Psr4AutoloaderClass.php';
    $loader = new Psr4AutoloaderClass();
    $loader->register();
    $loader->addNamespace('TVMates', dirname(__FILE__) . '/../src');

    /*
     * Prepare Storing Session in the database
     */
    $handler = new \TVMates\Libs\Sessions\PersistentSessionHandler(DB::connect());
    session_set_save_handler($handler);
    session_start();

//  require_once dirname(__FILE__) . '/Modules/googleconfig.php';
//  require_once dirname(__FILE__) . '/Modules/fbconfig.php';


//    session_destroy();exit;


	/*
	 *	New Twig Instance
	 */
	$twig = new Twig();

	$twig->set([

			/*
			 *	Website root
			 */
			'root'					=> URL_ROOT,
		
			/*
			 *	IS PROD or DEV website?
			 */
			'IS_PROD'				=> IS_PROD,

            'session'               => $_SESSION,

//            'facebookLoginUrl'      => $facebookLoginUrl,
//            'googleAuthUrl'        => $googleAuthUrl,

		]);

	/*
	 *	Add CSS Base files [without extension]
	 */
	$twig->css([
            'bootstrap',
            'ionicons',
            'style',
		]);

	/*
	 *	Add js base files
	 */
	$twig->js([
			'plugins/jquery',
			'plugins/bootstrap',
			'plugins/jquery.cookie',
			'common',
		]);

	/*
	 *	Set varaibles to JS enviroments
	 */
	$twig->jsVars([

		]);
