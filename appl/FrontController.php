<?php


class FrontController extends MainController{
    
    // lista dozwolonych kontrolerow
    private $allowed_controlers = array(
        "Main",
        "Auth",
        "BaseModel",
        "Automaton",
        "SimList",
        "About",
        "Test"
    );
    private $default_controller = "Main";
    private $controller_name = null;
    private $action_name = null;
    public static $main_path = null;

    public function __construct(){
       
        // pobranie sciezki aplikacji
        $request_uri = $_SERVER['REQUEST_URI'];
        $request_method = strtolower($_SERVER['REQUEST_METHOD']);
        
        if(!preg_match('/^.*\/gameoflife\//', $request_uri, $matches)) {
            #TODO wyjatek
            echo 'wyjatek: nie znaleziono sciezki projektu';
            echo '</br>';
            return;
        }
        else {
            FrontController::$main_path = $matches[0];
            unset($matches);
        }
        
        
        // pobranie kontrolera i akcji
        if(preg_match('/^.*\/gameoflife[\/]?$/', $request_uri)) {
            $this->redirect('Main');
            return;
        }
        elseif(!preg_match('/^.*\/gameoflife\/([^\/]+)\/?.*/', $request_uri, $matches)) {
            #TODO wyjatek
            echo 'wyjatek: niepoprawne uri (controller)';
            echo '</br>';
            return;
        }
        
        else{
            $this->controller_name = $matches[1];
            unset($matches);
        }

        if(!preg_match('/^.*\/gameoflife\/.*\/(.*)/', $request_uri, $matches)||$matches[1]==='') {
            #TODO wyjatek
//            echo 'wyjatek: niepoprawne(brak) uri (action) -- domyslna akcja';
//            echo '</br>';
            $this->action_name = 'defualt';
        }
        else{
            $this->action_name = $matches[1];
            unset($matches);

        }

        if(!in_array($this->controller_name, $this->allowed_controlers)) {
            #TODO wyjatek
            echo 'wyjatek: niedozwolony kontroler';
            echo '</br>';
            return;
        }
        
        //TODO obsluga logowania z przywracaniem poprzedniej strony, sprawdzanie zalogowania w interwale
        
        if (!isset($_SESSION["logged"]) && $this->controller_name !== 'Auth')
            $this->redirect('Auth');
        
        $controller = new $this->controller_name(); 
        $controller->$request_method($this->action_name);
               
        
//    // sprawdzanie czy uzytkownik jest zalogowany
//    protected function check_log(){
//        if(!isset($_SESSION["logged"]))
//            return false;
//        else return true;
//    }

        

    }
}
