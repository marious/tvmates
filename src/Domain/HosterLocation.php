<?php

namespace TVMates\Domain;


class HosterLocation
{
    protected $location_type;
    protected $area;
    protected $air_condition;
    protected $seats_type;
    protected $seats_number;
    protected $ambient_light;
    protected $host_id;

    /**
     * @return mixed
     */
    public function getLocationType()
    {
        return $this->location_type;
    }

    /**
     * @return mixed
     */
    public function getArea()
    {
        return $this->area;
    }

    /**
     * @return mixed
     */
    public function getAirCondition()
    {
        return $this->air_condition;
    }

    /**
     * @return mixed
     */
    public function getSeatsType()
    {
        return $this->seats_type;
    }

    /**
     * @return mixed
     */
    public function getSeatsNumber()
    {
        return $this->seats_number;
    }

    /**
     * @return mixed
     */
    public function getAmbientLight()
    {
        return $this->ambient_light;
    }


    /**
     * @return mixed
     */
    public function getHostId()
    {
        return $this->host_id;
    }
}