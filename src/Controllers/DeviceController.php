<?php

namespace TVMates\Controllers;


use TVMates\Models\DeviceModel;
use Validator;

class DeviceController extends AbstractController
{
    protected $deviceModel;

    public function __construct()
    {
        parent::__construct();
        $this->deviceModel = new DeviceModel();
    }


    public function setDevice()
    {
        //Validate user input
        $validator = new Validator($this->request->getParams()->all());

        $rules = [
            'device_type'   => 'trim|required',
            'dimentions'    => 'trim|required',
            'resolution'    => 'trim|required',
            'is_3d'         => 'trim|required',
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
        $data['device_type'] = $this->setData('device_type', true);
        $data['dimentions'] = $this->setData('dimentions', true);
        $data['resolution'] = $this->setData('resolution', true);
        $data['is_3d']      = $this->setData('is_3d', true);
        $data['host_id'] = 1; // temporary

        if ($this->deviceModel->create($data))
        {
            return true;
        }

        $errors['error_happend'] = ['Something happend when insert new host please try again later'];
        return $errors;

    }

}