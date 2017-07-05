<?php

namespace TVMates\Domain;


class LocationOptions
{
    protected $wifi;
    protected $location_order;
    protected $smoking;
    protected $children_inhome;
    protected $children_athome;
    protected $pets_athome;
    protected $pets_inhome;
    protected $males;
    protected $females;
    protected $location_id;

    /**
     * @return mixed
     */
    public function getWifi()
    {
        return $this->wifi;
    }

    /**
     * @return mixed
     */
    public function getLocationOrder()
    {
        return $this->location_order;
    }

    /**
     * @return mixed
     */
    public function getSmoking()
    {
        return $this->smoking;
    }

    /**
     * @return mixed
     */
    public function getChildrenInhome()
    {
        return $this->children_inhome;
    }

    /**
     * @return mixed
     */
    public function getChildrenAthome()
    {
        return $this->children_athome;
    }

    /**
     * @return mixed
     */
    public function getPetsAthome()
    {
        return $this->pets_athome;
    }

    /**
     * @return mixed
     */
    public function getPetsInhome()
    {
        return $this->pets_inhome;
    }

    /**
     * @return mixed
     */
    public function getMales()
    {
        return $this->males;
    }

    /**
     * @return mixed
     */
    public function getFemales()
    {
        return $this->females;
    }

    /**
     * @return mixed
     */
    public function getLocationId()
    {
        return $this->location_id;
    }

}