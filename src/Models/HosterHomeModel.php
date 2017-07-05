<?php

namespace TVMates\Models;


class HosterHomeModel extends AbstractModel
{

    const HosterHomeClass = '\TVMates\Domain\HosterHome';

    public function create($data)
    {
        $query = "INSERT INTO `hoster_home` (`city`,`province`,`street_address`,`postal_code`,
                    `flat`, `address_type`, `address_name`, `country`, `user_key`)
                    VALUES (:city, :province, :street_address, :postal_code, :flat, 
                      :address_type, :address_name, :country, :user_key)";



        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':city', $data['city']);
        $stmt->bindParam(':province', $data['province']);
        $stmt->bindParam(':street_address', $data['street_address']);
        $stmt->bindParam(':postal_code', $data['postal_code']);
        $stmt->bindParam(':flat', $data['flat']);
        $stmt->bindParam(':address_type', $data['address_type']);
        $stmt->bindParam(':address_name', $data['address_name']);
        $stmt->bindParam(':country', $data['country']);
        $stmt->bindParam(':user_key', $data['user_key']);

        $stmt->execute();
        return $stmt->rowCount();
    }









    public function get($userKey)
    {
        $query = "SELECT * FROM `hoster_home` WHERE user_key = :user_key";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_key', $userKey);
        $stmt->execute();

        if ($stmt->rowCount())
        {
            $hosterHome = $stmt->fetchAll(\PDO::FETCH_CLASS, self::HosterHomeClass)[0];
            return $hosterHome;
        }

        return false;

    }





}