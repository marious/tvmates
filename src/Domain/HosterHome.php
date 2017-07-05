<?php

namespace TVMates\Domain;


class HosterHome
{
    protected $city;
    protected $province;
    protected $street_address;
    protected $postal_code;
    protected $flat;
    protected $address_type;
    protected $address_name;
    protected $country;
    protected $user_key;

    /**
     * @return mixed
     */
    public function getCity()
    {
        return $this->city;
    }

    /**
     * @return mixed
     */
    public function getProvince()
    {
        return $this->province;
    }

    /**
     * @return mixed
     */
    public function getAddress()
    {
        return $this->address;
    }

    /**
     * @return mixed
     */
    public function getPostalCode()
    {
        return $this->postal_code;
    }

    /**
     * @return mixed
     */
    public function getFlat()
    {
        return $this->flat;
    }

    /**
     * @return mixed
     */
    public function getAddressType()
    {
        return $this->address_type;
    }

    /**
     * @return mixed
     */
    public function getAddressName()
    {
        return $this->address_name;
    }

    /**
     * @return mixed
     */
    public function getCountry()
    {
        return $this->country;
    }

    /**
     * @return mixed
     */
    public function getUserKey()
    {
        return $this->user_key;
    }

    /**
     * @return mixed
     */
    public function getStreetAddress()
    {
        return $this->street_address;
    }
}