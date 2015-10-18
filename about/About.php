<?php

class About extends FrontController implements Rest
{
    private $params = null;
    private $rest_method = null;

    public function __construct($params)
    {
        $this->params = explode('/', $_GET['target']);
        $this->rest_method = strtolower($_SERVER['REQUEST_METHOD']);
        switch ($this->rest_method) {
            case "get":
                $this->get($params);
                break;
            case "post":
                $this->post($params);
                break;
            case "put":
                $this->put($params);
                break;
            case "delete":
                $this->delete($params);
                break;
        }

    }

    public function get(Array $params){
        $view = new View(
            array(
                "template/about.phtml"
            ),
            array(
                "title" => "Game of life -- Symulator automatu komórkowego",
                "status" => '',
                "csss" => array(
                    "appl/css/main.css"
                ),
                "jss" => array(
                )
            )
        );
        $view->show();
    }

    public function post(Array $params){

    }

    public function put(Array $params){

    }

    public function delete(Array $params){

    }

}