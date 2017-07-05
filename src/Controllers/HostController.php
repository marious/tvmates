<?php

namespace TVMates\Controllers;


use TVMates\Libs\Helper;
use TVMates\Libs\Sessions\Session;
use TVMates\Models\HosterHomeModel;
use Validator;

class HostController extends AbstractController
{

    protected $hosterHomeModel;

    public function __construct()
    {
        parent::__construct();
        $this->hosterHomeModel = new HosterHomeModel();
    }



    public function hosterHome()
    {
         //Validate user input
        $validator = new Validator($this->request->getParams()->all());

        $rules = [
            'address_name'      => 'trim|required|alnum|min:4|max:125',
            'country'           => 'trim|required|alpha|max:40',
            'street_address'    => 'trim|required|alnum|max:125',
            'flat'              => 'trim',
            'city'              => 'trim|required|max:40',
            'province'          => 'trim|required|max:40',
            'postal_code'       => 'trim|required',
            'address_type'      => 'trim|required|max:100',
        ];

        $errors = [];

        // Get all errors
        if (! $validator->validate($rules))
        {
            $errors = $validator->getErrors();
        }


        if (count($errors))
        {
            return $errors;
        }



        $data = [];
        $data['address_name']           = $this->setData('address_name', true);
        $data['country']                = $this->setData('country', true);
        $data['street_address']         = $this->setData('street_address', true);
        $data['flat']                   = $this->setData('flat', true);
        $data['city']                   = $this->setData('city', true);
        $data['province']               = $this->setData('province', true);
        $data['postal_code']            = $this->setData('postal_code', true);
        $data['address_type']           = $this->setData('address_type', true);
        $data['user_key']               = Session::get('user_key');

        $createHost = $this->hosterHomeModel->create($data);
        if ($createHost) {
            return true;
        }

        $errors['error_happend'] = ['Something happend when insert new host please try again later'];
        return $errors;


    }






}
