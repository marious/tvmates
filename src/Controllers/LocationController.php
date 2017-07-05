<?php

namespace TVMates\Controllers;


use TVMates\Models\LocationModel;
use Validator;

class LocationController extends AbstractController
{

    protected $locationModel;

    public function __construct()
    {
        parent::__construct();
        $this->locationModel = new LocationModel();
    }



    public function setLocationInfo()
    {
        //Validate user input
        $validator = new Validator($this->request->getParams()->all());

        $rules = [
            'location_type' => 'trim|required',
            'area'          => 'trim|required',
            'seats_type'    => 'trim|required',
            'seats_number'  => 'trim|required|integer',
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
        $data['location_type'] = $this->setData('location_type', true);
        $data['area'] = $this->setData('area', true);
        $data['air_condition'] = $this->setData('air_condition', true);
        $data['seats_type'] = $this->setData('seats_type', true);
        $data['seats_number'] = $this->setData('seats_number', true);
        $data['ambient_light'] = $this->setData('ambient_light', true);
        $data['host_id'] = 1; // temporary


        if ($this->locationModel->create($data))
        {
            return true;
        }

        $errors['error_happend'] = ['Something happend when insert new host please try again later'];
        return $errors;

    }








    public function setLocationOptions()
    {
        //Validate user input
        $validator = new Validator($this->request->getParams()->all());

        $rules = [

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
        $data['wifi'] = $this->setData('wifi', true);
        $data['location_order'] = $this->setData('location_order', true);
        $data['smoking'] = $this->setData('smoking', true);
        $data['children_inhome'] = $this->setData('children_inhome', true);
        $data['children_athome'] = $this->setData('children_athome', true);
        $data['pets_athome'] = $this->setData('pets_athome', true);
        $data['pets_inhome'] = $this->setData('pets_inhome', true);
        $data['males'] = $this->setData('males', true);
        $data['females'] = $this->setData('females', true);
        $data['location_id'] = 1; // temporary


        if ($this->locationModel->createLocationOptions($data))
        {
            return true;
        }

        $errors['error_happend'] = ['Something happend when insert new host please try again later'];
        return $errors;

    }




}