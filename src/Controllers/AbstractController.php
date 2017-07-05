<?php
namespace TVMates\Controllers;

use TVMates\Core\Request;
use DB;
use TVMates\Libs\Helper;

abstract class AbstractController
{
    protected $request;
    protected $db;

    public function __construct()
    {
        $this->request = new Request();
        $this->db = DB::connect();
    }



    protected function setData($requested, $sanitize = false)
    {
        if (isset($this->request->$requested))
        {
            if ($sanitize) {
                return Helper::sanitize($this->request->$requested);
            }
            return $this->request->$requested;
        }
        return null;
    }




}