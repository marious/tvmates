<?php

namespace TVMates\Domain;


class Device
{
    protected $device_type;
    protected $dimentions;
    protected $resolution;
    protected $is_3d;
    protected $host_id;

    /**
     * @return mixed
     */
    public function getDeviceType()
    {
        return $this->device_type;
    }

    /**
     * @return mixed
     */
    public function getDimentions()
    {
        return $this->dimentions;
    }

    /**
     * @return mixed
     */
    public function getResolution()
    {
        return $this->resolution;
    }

    /**
     * @return mixed
     */
    public function getIs3d()
    {
        return $this->is_3d;
    }

    /**
     * @return mixed
     */
    public function getHostId()
    {
        return $this->host_id;
    }
}