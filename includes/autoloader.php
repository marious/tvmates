<?php


	spl_autoload_register(function($class) {

	    $directories = [            // can be modified when the project grow
	        '',
            'Defaults/',
        ];

        /*
         *	Require needed class file
         */
        switch ($class) {
            case 'Twig':
                if ($class == 'Twig') require_once dirname(__FILE__) . '/Twig/Autoloader.php';
                break;
            default:
                $class = ltrim($class);
                foreach ($directories as $directory) {
                    $path = dirname(__FILE__) . '/' . $directory . $class . '.php';
                    if (file_exists($path)) {
                        require_once $path;
                        return;
                    }
                }
                break;
        }

    });
