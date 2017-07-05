<?php

namespace TVMates\Models;

use DB;

class AbstractModel
{
    protected $db;

    public function __construct()
    {
        $this->db = DB::connect();
    }
}