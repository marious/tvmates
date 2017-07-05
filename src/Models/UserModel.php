<?php

namespace TVMates\Models;


use DB;

class UserModel extends AbstractModel
{

    protected $userProviderTbl = 'userProvider';


    const UserClass = '\TVMates\Domain\User';


    public function create($data)
    {
        $query = "INSERT INTO `users`(`user_key`, `username`, `sur_name`, `birth_day`, 
                `email`, `password`, `token`) 
                VALUES (:user_key, :username, :sur_name, :birth_day, :email, :password, :token)";

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_key', $data['user_key']);
        $stmt->bindParam(':username', $data['username']);
        $stmt->bindParam(':sur_name', $data['sur_name']);
        $stmt->bindParam(':birth_day', $data['birth_day']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password', $data['password']);
        $stmt->bindParam(':token', $data['token']);

        $stmt->execute();

        return $stmt->rowCount();
    }





    public function get($email, $password)
    {
        $query = "SELECT * FROM users WHERE email = :email";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        if ($stmt->rowCount())
        {
            $user = $stmt->fetchAll(\PDO::FETCH_CLASS, self::UserClass)[0];
            if (! password_verify($password, $user->getPassword())) {
                return false;
            }
            return $user;
        }

        return false;
    }










    public function checkUser($userData = [])
    {
        if (! empty($userData))
        {
            // check whether user data already exists in a database 
            $prevQuery = "SELECT * FROM {$this->userProviderTbl} WHERE oauth_provider = :oauth_provider
					AND oauth_uid = :oauth_uid";
            $stmt = $this->db->prepare($prevQuery);
            $stmt->bindParam(':oauth_provider', $userData['oauth_provider']);
            $stmt->bindParam(':oauth_uid', $userData['oauth_uid']);
            $stmt->execute();
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);

            if ($row)
            {
                // update
                $query = "UPDATE {$this->userProviderTbl} SET first_name = :first_name, 
					last_name = :last_name, email = :email, gender = :gender, 
					locale = :locale, picture = :picture, link = :link, 
						modified = '" . date("Y-m-d H:i:s") . "' WHERE oauth_provider = :oauth_provider AND oauth_uid = :oauth_uid";
                $stmt = $this->db->prepare($query);
                $stmt->bindParam(":first_name", $userData['first_name']);
                $stmt->bindParam(":last_name", $userData['last_name']);
                $stmt->bindParam(":email", $userData['email']);
                $stmt->bindParam(":gender", $userData['gender']);
                $stmt->bindParam(":locale", $userData['locale']);
                $stmt->bindParam(":picture", $userData['picture']);
                $stmt->bindParam(":link", $userData['link']);
                $stmt->bindParam(":oauth_provider", $userData['oauth_provider']);
                $stmt->bindParam(":oauth_uid", $userData['oauth_uid']);
                $stmt->execute();
            }
            else
            {
                // insert
                $query = "INSERT INTO {$this->userProviderTbl} SET first_name = :first_name, 
					last_name = :last_name, email = :email, gender = :gender, 
					locale = :locale, picture = :picture, link = :link, 
						oauth_provider = :oauth_provider, 
						oauth_uid = :oauth_uid,
						modified = '".date("Y-m-d H:i:s")."'";
                $stmt = $this->db->prepare($query);
                $stmt->bindParam(":first_name", $userData['first_name']);
                $stmt->bindParam(":last_name", $userData['last_name']);
                $stmt->bindParam(":email", $userData['email']);
                $stmt->bindParam(":gender", $userData['gender']);
                $stmt->bindParam(":locale", $userData['locale']);
                $stmt->bindParam(":picture", $userData['picture']);
                $stmt->bindParam(":link", $userData['link']);
                $stmt->bindParam(":oauth_provider", $userData['oauth_provider']);
                $stmt->bindParam(":oauth_uid", $userData['oauth_uid']);
                $update = $stmt->execute();
            }

            // Get user data from database 
            $stmt = $this->db->prepare($prevQuery);
            $stmt->bindParam(':oauth_provider', $userData['oauth_provider']);
            $stmt->bindParam(':oauth_uid', $userData['oauth_uid']);
            $stmt->execute();
            $userData = $stmt->fetch(\PDO::FETCH_ASSOC);
            return $userData;
        }
    }



}