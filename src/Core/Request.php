<?php

namespace TVMates\Core;


class Request
{
    const GET = 'GET';
    const POST = 'POST';

    private $domain;
    private $path;
    private $method;

    private $params;
    private $cookies;

    public function __construct()
    {
        $this->domain = $_SERVER['HTTP_HOST'];
        $this->path = $_SERVER['REQUEST_URI'];
        $this->method = $_SERVER['REQUEST_METHOD'];

        $this->params = new FilteredMap(array_merge($_POST, $_GET));
        $this->cookies = new FilteredMap($_COOKIE);
    }




    public function __get($name)
    {
        // TODO: Implement __get() method.
        if ( $this->getParams()->has($name) ) {
            return $this->getParams()->get($name);
        }
        //throw new \Exception('The name: ' . $name . ' not found in request class');
    }

    public function __isset($name)
    {
        return $this->getParams()->has($name);
    }


    public function getUrl()
    {
        return $this->domain . $this->path;
    }




    public function getDomain()
    {
        return $this->domain;
    }



    public function getPath()
    {
        return $this->path;
    }




    public function getMethod()
    {
        return $this->method;
    }




    public function isPost()
    {
        return $this->method == self::POST;
    }





    public function isGet()
    {
        return $this->method == self::GET;
    }




    public function getParams()
    {
        return $this->params;
    }





    public function getCookies()
    {
        return $this->cookies;
    }

}