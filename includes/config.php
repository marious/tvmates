<?php

	switch( $_SERVER['HTTP_HOST'] ){
		case 'dev.tvmeets.com':
			define('DB_NAME','');
			define('DB_USER','');
			define('DB_PASSWORD','');
			define('URL_ROOT', '');
			define('IS_PROD',false);
		break;
		default:
			define('DB_NAME','tvmates');
			define('DB_USER','root');
			define('DB_PASSWORD','password');
			define('URL_ROOT', 'http://tvmates.dev');
			define('DB_HOST', 'localhost');
			define('IS_PROD',false);			
		break;
	}
	
	
	
