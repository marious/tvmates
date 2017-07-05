<?php

/*
 *	Handle DB connections and query
 */
class DB
{

    public static $FETCH_MODE = PDO::FETCH_OBJ;

    private static $_dbHandle = null;


    /*
     *	DB COoenction
     *	[Use PDO]
     */
    public static function connect()
    {
        require_once dirname(__FILE__) . '/../config.php';

        if (self::$_dbHandle == null) {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME;
            self::$_dbHandle = new PDO($dsn, DB_USER, DB_PASSWORD);
            self::$_dbHandle->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, self::$FETCH_MODE);
            self::$_dbHandle->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$_dbHandle->exec("SET NAMES 'utf8'");
        }

        return self::$_dbHandle;
    }

    /*
     *	Query
     */
    public static function query(\PDO $db, $query, $params = [])
    {
        $stmt = $db->prepare($query);

        if (count($params)) {
            $x = 1;
            foreach ($params as $param) {
                $stmt->bindValue($x, $param);
                $x++;
            }
        }

        $stmt->execute();
        return $stmt;

    }

}