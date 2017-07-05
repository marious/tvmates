<?php
	
	/*
	 *	Make validations and read request data [GET/POST]
	 */
class Validator{

    const INPUT_METHOD = [
        'post' => INPUT_POST,
        'get' => INPUT_GET,
    ];

    private $inputMehtod;

    private $errors = [];

    private $data = [];


    protected $messages = [
        'required'  => 'The :item field is required',
        'min'       => 'The :item field must be a minimum :param Character length',
        'max'       => 'The :item field must be a maximum :param Character length',
        'email'     => 'The :item field must be valid email address',
        'match'     => 'The :item field must be match :param field',
        'alnum'     => 'The :item field must be alphanumeric only.',
        'alpha'     => 'The :item field must be alpha characters only.',
        'numeric'   => 'The :item field must contain only numbers.',
        'integer'   => 'The :item field must contain only integers.',
        'decimal'   => 'The :item field must contain a decimal number.',
        'unique'    => 'The :item field already exist please enter another one',
        'exact'     => 'The :item field must be exactly :params characters in length.',
        'array'     => 'The :item field must be selected or choose.',

    ];


    public function __construct(Array $data, $inputMethod = 'post')
    {
        $this->data = $data;
        $this->inputMehtod = $inputMethod;
    }


    public function validate(Array $rules)
    {
        $valid = true;

        foreach ($rules as $item => $ruleset) {
            // ex: required|email|min:8
            $ruleset = explode('|', $ruleset);

            foreach ($ruleset as $rule) {
                $pos = strpos($rule, ':');
                if ($pos !== false) {
                    $parameter = substr($rule, $pos + 1);
                    $rule = substr($rule, 0, $pos);
                } else {
                    $parameter = '';
                }

                // ex: validateEmail($item, $value, $param if exist)
                $validMethodName = 'validate' . ucfirst($rule);

                $value = isset($this->data[$item]) ? $this->data[$item] : NULL;

                if (method_exists($this, $validMethodName)) {
                    if (! $this->$validMethodName($item, $value, $parameter) ) {
                        $valid = false;
                        $this->addError($rule, $item, $parameter);
                    }
                }

                $filterMethodName = 'filter' . ucfirst($rule);
                if (method_exists($this, $filterMethodName)) {
                    $this->$filterMethodName($item, $value);
                }



            }

        }

        return $valid;
    }



    // --------------------------------------------------------------------


    /**
     * Add Error to errors array
     *
     * @param null $rule
     * @param null $item
     * @param null $param
     */
    protected function addError($rule = null, $item = null, $param = null)
    {
            $this->errors[$item][] = str_replace([':item', ':param'], [$this->fomratItem($item), $param],
                        $this->messages[$rule]);
    }



    // --------------------------------------------------------------------

    /**
     * required field
     *
     * @param $item
     * @param $value
     * @param null $param
     * @return bool
     */
    protected function validateRequired($item, $value, $param = null)
    {
        return  filter_has_var(self::INPUT_METHOD[$this->inputMehtod], $item) && !empty($value);
    }

    // --------------------------------------------------------------------


    /**
     * Validate Email
     *
     * @param $value
     * @param null $param
     * @return mixed
     */
    protected function validateEmail($item, $value, $param = null)
    {
        return filter_var($value, FILTER_VALIDATE_EMAIL);
    }

    // --------------------------------------------------------------------

    /**
     * validate match field
     *
     * @param $value
     * @param null $param
     * @return bool
     */
    protected function validateMatch($item, $value, $param = null)
    {
        if ($param) {
            if (isset($this->data[$param])) {
                return $value === $this->data[$param];
            }
            return false;
        }
        return false;
    }

    // --------------------------------------------------------------------

    /**
     * Validate Min
     *
     * @param $value
     * @param null $param
     * @return bool
     */
    protected function validateMin($item, $value, $param = null)
    {
        if (! is_numeric($param)){
            return false;
        }

        return mb_strlen($value) >= $param;
    }



    protected function validateUnique($item, $value, $param = null)
    {
        $db = DB::connect();
        $query = "SELECT * FROM {$param} WHERE {$item} = :value";
        $stmt = $db->prepare($query);
        $stmt->bindValue(':value', $value);
        $stmt->execute();
        if ($stmt->rowCount()) {
            return false;
        }
        return true;
    }


    // --------------------------------------------------------------------

    /**
     * Validate Max
     *
     * @param $value
     * @param null $param
     * @return bool
     */
    protected function validateMax($item, $value, $param = null)
    {
        if (! is_numeric($param)){
            return false;
        }

        return mb_strlen($value) <= $param;
    }

    // --------------------------------------------------------------------

    /**
     * validate Exact Length
     *
     * @param $value
     * @param null $param
     * @return bool
     */
    public function validateExact($item, $value, $param = null)
    {
        if (! is_numeric($param)) {
            return false;
        }

        return (mb_strlen($value) === (int) $param);
    }


    // --------------------------------------------------------------------

    /**
     * validate alpha characters
     *
     * @param $value
     * @param null $param
     * @return bool
     */
    public function validateAlpha($item, $value, $param = null)
    {
        return ctype_alpha($value);
    }


    // --------------------------------------------------------------------

    /**
     * validate alphanumeric
     *
     * @param $value
     * @param null $param
     * @return bool
     */
    protected function validateAlnum($item, $value, $param = null)
    {
        return ctype_alnum((string) $value);
    }


    // --------------------------------------------------------------------

    /**
     * Validate numeric value
     *
     * @param $value
     * @param null $param
     * @return bool
     */
    protected function validateNumeric($item, $value, $param = null)
    {
        return (bool) preg_match('/^[\-+]?[0-9]*\.?[0-9]+$/', $value);
    }

    // --------------------------------------------------------------------


    /***
     * Validate integer number
     *
     * @param $value
     * @param null $param
     * @return bool
     */
    protected function validateInteger($item, $value, $param = null)
    {
        return (bool) preg_match('/^[\-+]?[0-9]+$/', $value);
    }


    // --------------------------------------------------------------------


    protected function validateDecimal($item, $value, $param = null)
    {
        return (bool) preg_match('/^[\-+]?[0-9]+\.[0-9]+$/', $value);
    }


    // --------------------------------------------------------------------

    /**
     * Make sure the post data is array as you want
     *
     * @param $item
     * @param $value
     * @param null $param
     * @return bool
     */
    protected function validateArray($item, $value, $param = null)
    {
        return (bool) filter_input(INPUT_POST, $item, FILTER_DEFAULT,
                FILTER_REQUIRE_ARRAY);
    }


    // --------------------------------------------------------------------

    /**
     * Trim value
     *
     * @param $item
     * @param $value
     */
    protected function filterTrim($item, $value)
    {
        $this->data[$item] = trim($value);
    }


    /**
     * return input data after filtered and validated
     *
     * @return array
     */
    public function getInputData()
    {
        return $this->data;
    }


    /**
     * Get errors Array
     *
     * @return array
     */
    public function getErrors()
    {
        return $this->errors;
    }


    /**
     * Format item for best look
     *
     * @param $item
     * @return string
     */
    private function fomratItem($item)
    {
        return ucwords(str_replace(['-', '_'], [' ', ' '], $item));
    }



}