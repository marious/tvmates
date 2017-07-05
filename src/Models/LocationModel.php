<?php

namespace TVMates\Models;


class LocationModel extends AbstractModel
{


    const HosterLocationClass = '\TVMates\Domain\HosterLocation';


    public function create($data)
    {
        $query = "INSERT INTO location (location_type, area, air_condition, seats_type, 
                    seats_number, ambient_light, host_id)
                    VALUES (:location_type, :area, :air_condition, :seats_type, 
                      :seats_number, :ambient_light, :host_id)";

        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':location_type', $data['location_type']);
        $stmt->bindValue(':area', $data['area']);
        $stmt->bindValue(':air_condition', $data['air_condition']);
        $stmt->bindValue(':seats_type', $data['seats_type']);
        $stmt->bindValue(':seats_number', $data['seats_number']);
        $stmt->bindValue(':ambient_light', $data['ambient_light']);
        $stmt->bindValue(':host_id', $data['host_id']);
        $stmt->execute();

        return $stmt->rowCount();

    }









    public function createLocationOptions($data)
    {
        $query = "INSERT INTO location_options (wifi, location_order, smoking, children_inhome, 
                      children_athome, pets_athome, pets_inhome, males, females, location_id)
                      VALUES (:wifi, :location_order, :smoking, :children_inhome, 
                      :children_athome, :pets_athome, :pets_inhome, :males, :females, :location_id )
                      
                      ";

        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':wifi', $data['wifi']);
        $stmt->bindValue(':location_order', $data['location_order']);
        $stmt->bindValue(':smoking', $data['smoking']);
        $stmt->bindValue(':children_inhome', $data['children_inhome']);
        $stmt->bindValue(':children_athome', $data['children_athome']);
        $stmt->bindValue(':pets_athome', $data['pets_athome']);
        $stmt->bindValue(':pets_inhome', $data['pets_inhome']);
        $stmt->bindValue(':males', $data['males']);
        $stmt->bindValue(':females', $data['females']);
        $stmt->bindValue(':location_id', $data['location_id']);
        $stmt->execute();

        return $stmt->rowCount();



    }




}