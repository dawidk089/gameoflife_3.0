<?php

// kontroler wspierajacy autoryzacje uzytkownika (rejestracja/logowanie)
class Auth extends MainController implements Rest {

    private $rest_method = null;

    // konstruktor rozpoznaje metode rest i wywoluje odpowiednia metode
    public function __construct(){
                
//        $this->rest_method = strtolower($_SERVER['REQUEST_METHOD']);
//        switch($this->rest_method){
//            case "get":
//                $this->get($params);
//                break;
//            case "post":
//                $this->post($params);
//                break;
//            case "put":
//                $this->put($params);
//                break;
//            case "delete":
//                $this->delete($params);
//                break;
//        }
    }

    // metoda get laduje widok strony, style css i pliki js oraz w zaleznosci od akcji nadaje tekst w pasku statusu
    public function get($action){

        $status = '';
        switch($action){
            case 'nick_exist':
                $status = 'Wprowadzony nick już istnieje.';
                break;
            case 'nick_nexist':
                $status = 'Wprowadzony nick nie istnieje.';
                break;
            case 'logout':
                $this->logout();
                $status = 'Zostałeś wylogowany pomyślnie.';
                break;
            case 'new_logged':
                $status = 'Zostałeś pomyślnie zalogowany.';
                break;
            case 'password_wrong':
                $status = "Hasło jest nieprawidłowe.";
                break;
            case 'bad_forms':
                $status = "Nieprawidłowe dane z formularzy!!!";
                break;
        }

        $view = new View(
            array(
                "template/login.phtml",
                "template/registration.phtml",
            ),
            array(
                "title"=>"Game of life -- Autoryzacja dostępu",
                "status"=>$status,
                "csss"=>array(
                    "appl/css/main.css",
                    "auth/css/main.css"
                    ),
                "jss"=>array(
                    "auth/js/init.js",
                    "jquery_js/jquery.js",
                ),
            )
        );

        $view->show();
    }

    // w zaleznosci od dostarczonych parametrow zadania podejmuje probe logowania lub rejestracji
    // przekierowuje w razie niepowodzenia na inna strone z odpowiednim komunikatem
    public function post($action){
//        echo 'Auth post</br>';
//        echo 'action: '.$action.'</br>';

//        $mode = $params['get']['params'][0];
        switch($action){
            case 'login':
                $result = $this->login($_POST['nick']);
                if($result === true) {
                    $_SESSION["logged"] = $_POST['nick'];
                    $this->redirect("Main/new_logged");
                }
                elseif($result === false)
                    $this->redirect("Auth/bad_forms");
                break;
            case 'register':
                if($this->register()) { //...
                    $_SESSION["logged"] = $_POST['nick'];
                    $this->redirect("Main/new");
                }
                elseif($this->register())
                    $this->redirect("Auth/bad_forms");
                break;
        }
    }
    
    public function put($action){
    }
    
    public function delete($action){
    }

    // metoda wspierajaca rejestracje
    // waliduje dostarczone dane
    // sprawdza baze danych w poszukiwaniu juz istniejacego nick'u
    // uzupelnia baze danych informacjami
    private function register(){
        //echo 'Auth register</br>';
//        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL))
//            return false;
//        if(!is_string($data['password']) || $data['password'] === '')
//            return false;

        $nick = $_POST['nick'];

//        if(!is_string($nick) || $nick === '')
//            return false;

        //otwarcie bazy danych
        $database = new BaseModel('users');
        $users = $database->read(array('nick'=>$nick));

        //echo 'users found: '.count($users).'</br>';
        
        //sprawdzenie czy uzytkownik istnieje
        //dodanie uzytkownika
        if(count($users) === 0){
            $database->create(array(
                    'email'=>$_POST['email'],
                    'nick'=>$_POST['nick'],
                    'password'=>$_POST['password'],
                    'simulation'=>array(),
                )
            );
            return true;
        }
        //przekierowanie z informacja zwrotna o niepowodzeniu
        else{
            $this->redirect("Auth/nick_exist/");
            return false;
        }
    }

    // metoda wspierajaca logowanie
    // waliduje dostarczone dane
    // sprawdza baze danych w poszukiwaniu podanego nick'u
    private function login(){
        $nick = $_POST['nick'];
//        if(!is_string($nick) || $nick === "")
//            return false;
//        $password = $data['password'];
//        if(!is_string($password) || $password === '')
//            return false;

        //otwarcie bazy danych
        $database = new BaseModel('users');
        $users = $database->read(array('nick'=>$nick));
        //sprawdzenie czy uzytkownik istnieje
        //przekierowanie z informacja zwrotna o niepowodzeniu
        if(count($users) === 0){
            $this->redirect("Auth/nick_nexist");
        }
        elseif(count($users) !== 1){
        }
        elseif($users[0]['password'] !== $_POST['password']){
            $this->redirect("Auth/password_wrong");
        }
        else{
            $_SESSION['logged'] = $nick;
            $this->redirect("Main/login");
            return true;
        }

    }

    // metoda wspierajaca wylogowanie
    private function logout(){
        unset($_SESSION['logged']);
    }

}