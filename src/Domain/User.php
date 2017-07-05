<?php

namespace TVMates\Domain;



class User
{
    protected $user_key;
    protected $username;
    protected $sur_name;
    protected $birth_day;
    protected $email;
    protected $password;
    protected $token;
    protected $status;
    protected $sex;
    protected $phone;
    protected $favourite_language;
    protected $address;
    protected $city;
    protected $postal_code;
    protected $photo;
    protected $video;
    protected $facebook;
    protected $google;
    protected $linkedin;
    protected $identity_card;
    protected $province;
    protected $country;
    protected $created_at;
    protected $updated_at;

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
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return mixed
     */
    public function getSurName()
    {
        return $this->sur_name;
    }

    /**
     * @return mixed
     */
    public function getBirthDay()
    {
        return $this->birth_day;
    }

    /**
     * @return mixed
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * @return mixed
     */
    public function getSex()
    {
        return $this->sex;
    }

    /**
     * @return mixed
     */
    public function getPhone()
    {
        return $this->phone;
    }

    /**
     * @return mixed
     */
    public function getFavouriteLanguage()
    {
        return $this->favourite_language;
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
    public function getCity()
    {
        return $this->city;
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
    public function getPhoto()
    {
        return $this->photo;
    }

    /**
     * @return mixed
     */
    public function getVideo()
    {
        return $this->video;
    }

    /**
     * @return mixed
     */
    public function getFacebook()
    {
        return $this->facebook;
    }

    /**
     * @return mixed
     */
    public function getGoogle()
    {
        return $this->google;
    }

    /**
     * @return mixed
     */
    public function getLinkedin()
    {
        return $this->linkedin;
    }

    /**
     * @return mixed
     */
    public function getIdentityCard()
    {
        return $this->identity_card;
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
    public function getCountry()
    {
        return $this->country;
    }

    /**
     * @return mixed
     */
    public function getCreatedAt()
    {
        return $this->created_at;
    }

    /**
     * @return mixed
     */
    public function getUpdatedAt()
    {
        return $this->updated_at;
    }

    /**
     * @return mixed
     */
    public function getToken()
    {
        return $this->token;
    }

    /**
     * @return mixed
     */
    public function
    getStatus()
    {
        return $this->status;
    }

    /**
     * @return mixed
     */
    public function getPassword()
    {
        return $this->password;
    }

    /**
     * @return mixed
     */
    public function getUsername()
    {
        return $this->username;
    }


}