<?php

namespace TVMates\Models;


class DeviceModel extends AbstractModel
{
    const HosterHomeClass = '\TVMates\Domain\Device';


    public function create($data)
    {
        $query = "INSERT INTO devices(device_type, dimentions, resolution, is_3d, host_id)
                    VALUES (:device_type, :dimentions, :resolution, :is_3d, :host_id)";

        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':device_type', $data['device_type']);
        $stmt->bindValue(':dimentions', $data['dimentions']);
        $stmt->bindValue(':resolution', $data['resolution']);
        $stmt->bindValue(':is_3d', $data['is_3d']);
        $stmt->bindValue(':host_id', $data['host_id']);

        $stmt->execute();
        return $stmt->rowCount();
    }
}