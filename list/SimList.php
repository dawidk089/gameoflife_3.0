<?php

// kontroler odpowiadajacy za podstrone z lista symulacji
class SimList extends MainController implements Rest{

    private $params = null;
    private $rest_method = null;

    // konstruktor rozpoznaje metode rest i wywoluje odpowiednia metode
    public function __construct()
    {
//        $this->params = explode('/', $_GET['target']);
//        $this->rest_method = strtolower($_SERVER['REQUEST_METHOD']);
//        switch ($this->rest_method) {
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

    // metoda get rozpoznajaca tryb (lista rekordow, lista symulacji uztykownika)
    // laduje widok strony, style css i pliki js
    public function get($action)
    {
        $list = null;
        $simulations = null;
        $type = $action;
        
        if($type === 'simulations'){
            $list = $this->own_simlist();
        }
        elseif($type === 'records'){
            $list = $this->users_simlist();
        }

        $view = new View(
            array(
                "template/simulation_list.phtml"
            ),
            array(
                "title" => "Game of life -- Symulator automatu komórkowego",
                "simulations" => $list,
                "status" => '',
                "csss" => array(
                    "appl/css/main.css",
                    "list/css/SimList.css"
                ),
                "type" => $type,
                "jss" => array(
                    "jquery_js/jquery.js",

                    "list/js/draw.js",
                    //"list/js/graph.js",
                    "list/js/form.js",
                    "list/js/init.js"
                )
            )
        );
        $view->show();
    }

    // w zaleznosci od otrzymanych parametrow usuwa symulacji lub <obsluga graph'u niedostepna>
    public function post($action)
    {
        switch($this->prepare_params()['get']['params'][0]){
            case 'delete_simulation':
                $this->delete_simulation();
                break;
            case 'draw_graph':
                $this->amount_history($this->prepare_params()['post']['id']);
                break;
        };
    }

    public function put($action)
    {
    }

    public function delete($action)
    {
    }

    // pobiera z bazy danych i zwraca wszystkie symulacje uzytkownika
    private function own_simlist(){
        $db = new BaseModel('users');
        $user = $db->read(array('nick'=>$_SESSION['logged']))[0];
        return $user['simulation'];
    }

    // <niedostepne>
    private function users_simlist(){
        //zalezy czy w bazie danych wpisy sa sortowane

        $db = new BaseModel('users');
        $users = $db->read(array());
        $simulations = array();
        foreach($users as $user){
            foreach($user['simulation'] as $simulation){
                $users_simulation = $simulation;
                $users_simulation['user'] = $user['nick'];
                $simulations[] = $users_simulation;
            }
            //simulations[] = $user['simulation'];
        }
        return $simulations;
    }

    // wspiera usuwanie symulacji z bazy danych
    private function delete_simulation(){
        $id = $this->prepare_params()['ajax']['id'];
        $db = new BaseModel('users');
        $db->delete($id-1);
    }

    // <niedostepne>
    private function amount_history($id){
        $db = new BaseModel('users');
        $user = $db->read(array('nick'=>$_SESSION['logged']))[0];
        $simulation = $user['simulation'][$id-1]['data'];
        $y = array();

        for($k=0; $k<count($simulation); ++$k) {
            $y[$k] = 0;
            for ($i = 0; $i < count($simulation[0]); ++$i)
                for ($j = 0; $j < count($simulation[0][0]); ++$j)
                    if($simulation[$k][$i][$j])
                        ++$y[$k];
        }
        echo json_encode($y);
    }
}
