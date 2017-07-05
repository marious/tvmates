<?php

namespace TVMates\Core;


class FilteredMap
{
    private $map;

    public function __construct($baseMap)
    {
        if (! is_array($baseMap)) {
            throw new \Exception('baseMap must be an array');
        }
        $this->map = $baseMap;
    }


    public function all()
    {
        return $this->map;
    }


    public function has($name)
    {
        return isset($this->map[$name]);
    }

    public function get($name)
    {
        if (!is_string($name)) { throw new \Exception('name must be string'); }
        $this->map[$name] = $this->map[$name] ? $this->map[$name] : null;
        return $this->map[$name];
    }


    public function getInt($name)
    {
        return (int) $this->get($name);
    }


    public function getNumber($name)
    {
        return (float) $this->get($name);
    }

    public function getString($name, $filter = true)
    {
        $value = (string) $this->get($name);
        if ($filter) {
            return addslashes($value);
        }
        return $value;
    }
}