<?php

namespace TVMates\Controllers;

use TVMates\Libs\Sessions\Session;
use TVMates\Models\UserModel;
use Validator;
use TVMates\Core\Request;
use TVMates\Libs\Helper;

class UsersController extends AbstractController
{

    protected $wrongDate = 'La data di nascita inviata non è valida';
    protected $underAge = 'La tua età deve essere uguale o maggiore di 18 anni';
    protected $notSelectedAge = 'Seleziona la tua data di nascita per continuare.';
    protected $errorCredentias = 'Indirizzo e-mail e password non corrispondono';
    const validAge = 18;
    protected $userModel;


    public function __construct()
    {
        parent::__construct();
        $this->userModel = new UserModel();
    }


    public function register()
    {
        // Validate user input
        $validator = new Validator($this->request->getParams()->all());

        $rules = [
            'username'      => 'trim|required|min:3|max:50|alnum',
            'sur_name'      => 'trim|required|min:3|max:50|alnum',
            'email'         => 'trim|required|email|unique:users',
            'password'      => 'trim|required|min:6',
        ];

        $errors = [];

        // Get all errors
        if (! $validator->validate($rules))
        {
            $errors = $validator->getErrors();
        }

        // Check errors for date submitted
        if (isset($this->request->day) && isset($this->request->month) && isset($this->request->year))
        {
            if ( $this->checkUserSubmitedDate($this->request->day, $this->request->month, $this->request->year) !== true )
            {
                $errors['birth_date'] = [$this->checkUserSubmitedDate($this->request->day, $this->request->month, $this->request->year)];
            }
        }


        if (!isset($this->request->day) || !isset($this->request->month) || !isset($this->request->year))
        {
            $errors['birth_date'] = [$this->notSelectedAge];
        }


        if (count($errors))
        {
            return $errors;
        }
        else
        {
            // user data to save in database users table
            $data = [];
            $data['username'] = filter_var($this->request->username, FILTER_SANITIZE_STRING);
            $data['sur_name'] = filter_var($this->request->sur_name, FILTER_SANITIZE_STRING);
            $data['password'] = password_hash($this->request->password, PASSWORD_DEFAULT);
            $data['email'] = $this->request->email;
            $data['user_key'] = hash('crc32', microtime(true) . mt_rand() . $data['username']);
            $data['token'] = bin2hex(openssl_random_pseudo_bytes(16));  // 32 charcters long
            $data['birth_day'] = $this->request->year . '-' . $this->request->month . '-' . $this->request->day;
            $insertUser = $this->userModel->create($data);

            if ($insertUser)
            {
                // Send confirmation message to email address
                if (! $this->sendRegisterationEmail($data['email'], $data['token'])  )
                {
                    $errors['error_happen'] = 'Something happen when sending emai please try again later';

                }
            }

        }



        return $errors;



    }






    public function login()
    {
        // Validate user input
        $validator = new Validator($this->request->getParams()->all());

        $rules = [
            'email'         => 'trim|required|email',
            'password'      => 'trim|required',
        ];

        $errors = [];

        // Get all errors
        if (! $validator->validate($rules))
        {
            $errors = $validator->getErrors();
        }

        if (count($errors)) {
            return $errors;
        }

        $user = $this->userModel->get($this->request->email, $this->request->password);

        if (! $user) {
            $errors['errors_credentials'] = $this->errorCredentias;
            return $errors;
        }


        Session::put('logged_in', true);
        Session::put('user_key', $user->getUserKey());
        Session::put('username', $user->getUsername());
        Session::put('sur_name', $user->getSurName());
        Session::put('email', $user->getEmail());

       return true;

    }





    public function logout()
    {
        $_SESSION = [];
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 86400, $params['path'], $params['domain'],
            $params['secure'], $params['httponly']);
        session_destroy();
        header('Location: index.php');
        exit;
    }






    private function checkUserSubmitedDate($day, $month, $year)
    {
        if (! Helper::checkDate($this->request->month,
            $this->request->day, $this->request->year))
        {
            return $this->wrongDate;
        }

        // if date is less than 18 year
        $now = new \DateTime();
        $postedDate = new \DateTime("{$month}/{$day}/{$year}");
        $diff = $now->diff($postedDate)->format('%y');
        if ((int) $diff < self::validAge)
        {
            return $this->underAge;
        }


        return true;
    }

    private function sendRegisterationEmail($email, $token)
    {
        return true;
    }

}