<?php

// kontroler odpowiedzialny za strone glowna
class Main extends MainController implements Rest
{

    private $params = null;
    private $rest_method = null;

    // konstruktor rozpoznaje metode rest i wywoluje odpowiednia metode
    public function __construct()
    {

    }

    // inicjuje szablony, wstawia style css i pliki js
    public function get($action)
    {
        if ($action == 'new')
            $status = 'Witamy nowy użytkowniku -- zostałeś zarejestrowany.';
        else
            $status = '';

        $view = new View(
            array(
                "template/board.phtml",
                "template/control_panel.phtml",
            ),
            array(
                "title" => "Game of life -- Symulator automatu komórkowego",
                "status" => $status,
                "csss" => array(
                    "appl/css/main.css",
                    "simulator/css/main.css"
                ),
                "jss" => array(
                    "jquery_js/jquery.js",
                    "simulator/js/cell.js",
                    "simulator/js/period_finder.js",
                    "simulator/js/storage.js",
                    "simulator/js/board.js",
                    "simulator/js/game.js",
                    "simulator/js/init.js",
                )
            )
        );
        $view->show();
    }

    // metoda post, ktora uruchamia konstruktor klasy przeprowadzajacej symulacje na serwerze
    public function post($action)
    {
//        echo 'Main post</br>';
        $_AJAX = $this->unif_ajax();
//        echo 'Main->$_AJAX: ';
//        var_dump($_AJAX);
//        echo '</br>';

        
        //$this->cout(json_encode($_AJAX));
        new Automaton($_AJAX['simulation'], (int)$_AJAX['id']);
    }

    public function put($action)
    {
    }

    public function delete($action)
    {
    }
}