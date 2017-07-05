<?php

namespace TVMates\Libs;

use TVMates\Libs\Sessions\Session;

class Helper
{


    /**
     * Check the submitted date is valid
     *
     * @param $month
     * @param $day
     * @param $year
     * @return bool
     */
    public static function checkDate($month, $day, $year)
    {
        return checkdate((int) $month, (int) $day, (int) $year);
    }



    public static function guard($page = 'index.php')
    {
        if (!isset($_SESSION['user_key']))
        {
            header('Location: ' . $page);

        }
    }


    public static function sanitize($string)
    {
        return htmlentities($string, ENT_QUOTES, "UTF-8");
    }




    public static function jsonEncode($value = null)
    {
        if (defined('JSON_UNESCAPED_UNICODE')) {

            return json_encode(
                $value,
                JSON_HEX_TAG |
                JSON_HEX_APOS |
                JSON_HEX_QUOT |
                JSON_HEX_AMP |
                JSON_UNESCAPED_UNICODE);


        } else {


            return json_encode(
                $value,
                JSON_HEX_TAG |
                JSON_HEX_APOS |
                JSON_HEX_QUOT |
                JSON_HEX_AMP
            );
        }
    }


    /**
     * Check if the getting connection is throug Ajax
     * @return bool
     */
    public static function isAjax()
    {
        /* AJAX check  */
        if(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            return true;
        }

        return false;
    }

}
