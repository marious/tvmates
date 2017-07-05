<?php


/*
 * This file is part of Twig.
 *
 * (c) 2009 Fabien Potencier
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Autoloads Twig classes.
 *
 * @author Fabien Potencier <fabien@symfony.com>
 */
class Twig_Autoloader
{
    /**
     * Registers Twig_Autoloader as an SPL autoloader.
     *
     * @param bool    $prepend Whether to prepend the autoloader or not.
     */
    public static function register($prepend = false)
    {
        if (version_compare(phpversion(), '5.3.0', '>=')) {
            spl_autoload_register(array(__CLASS__, 'autoload'), true, $prepend);
        } else {
            spl_autoload_register(array(__CLASS__, 'autoload'));
        }
    }

    /**
     * Handles autoloading of classes.
     *
     * @param string $class A class name.
     */
    public static function autoload($class)
    {
        if (0 !== strpos($class, 'Twig')) {
            return;
        }



        if (is_file($file = dirname(__FILE__).'/../'.str_replace(array('_', "\0"), array('/', ''), $class).'.php')) {
            require $file;
        }
    }
}
Twig_Autoloader::register(true);

//La nostra classe che estende Twig
class Twig extends Twig_Autoloader{

    private $_params = array();
    private $_js = array('js'   => array()); 
    private $_css = array('css'   => array()); 
    private $_js_vars = array('js_vars'   => array()); 
    private $_twig;     //Istanza di twig

    function __construct(){
        $loader = new \Twig_Loader_Filesystem( dirname(__FILE__) . '/../../tpl');
        $this->_twig = new \Twig_Environment($loader, ['debug'  => true]);
    }



    function set($data){
        //$this->_params[] = $data;
        $this->_params = array_merge($this->_params , (array)$data);
    }

    public function js($scripts){
        $this->_js['js'] = array_merge((array)$this->_js['js'] , (array)$scripts); 
    }

    public function jsVars($js_vars){
        $this->_js_vars['js_vars'] = array_merge((array)$this->_js_vars['js_vars'] , (array)$js_vars); 
    }

    public function css($style){
        $this->_css['css'] = array_merge((array)$this->_css['css'] , (array)$style); 
    }


    function show($tpl){

        $params = array_merge( $this->_params , $this->_js );
        $params = array_merge( $params , $this->_css );
        $params = array_merge( $params , $this->_js_vars );

        echo $this->_twig->render($tpl . '.twig', $params );

    }

    public function addFilter($arg){
        $this->_twig->addFilter($arg);
    }


    public function addFunction($arg){
        $this->_twig->addFunction($arg);
    }
}