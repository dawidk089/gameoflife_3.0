<?php

// klasa wspierajaca dostep i wykonywanie operacji w bazie danych
class BaseModel{

    private $user = "dawidk089" ;
    private $pass = "ciTronex" ;
    //private $host = "localhost" ; //lenovo
    //private $host = "http://wu.tbajorek.pl/gameoflife/" ;
    private $host = "localhost" ;
    private $base = "gameoflife" ;
    private $coll;// = "users";
    private $conn ;
    private $dbase ;
    private $collection ;

    // kostruktor nawiazujacy polaczenie z baza danych
    // (proba przeciazenia konstruktora typem parametrow)
    public function __construct($data){

//        echo 'BaseModel __construct';
//        echo '</br>';
//        echo 'data: ';
//        var_dump($data);
//        echo '</br>';
        
        switch(gettype($data)){
            case 'array':
                $this->construct_coll($data[0]);
                break;
            case 'string':
                $this->construct_coll($data);
                break;
        }
        
        //echo 'BaseModel __construct (koniec)</br>';
    }

    // faktyczny konstruktor
    public function construct_coll($collection) {
        $this->coll = $collection;
        $this->conn = new MongoClient("mongodb://{$this->user}:{$this->pass}@{$this->host}/{$this->base}");
        $this->dbase = $this->conn->selectDB($this->base) ;
        $this->collection = $this->dbase->selectCollection($this->coll);
    }

    // ponizej cztery metody dostepu do bazy danych w konwencji przypominajacej CRUD
    public function read($search_expression){
        $result = array();
        foreach($this->collection->find($search_expression) as $obj){
            $result[] = $obj;
        }
        return $result;
    }

    public function create(Array $data){
        //echo 'BaseModel create</br>';
        //echo 'collection: '.$this->collection.'</br>';
        $this->collection->insert($data);
    }

    public function update($mode, Array $where, Array $what){
        if($mode === 'add') {
            $this->collection->update(
                $where,
                array('$addToSet' => $what)
            );
        }
    }

    public function delete($no){
        $this->collection->update(
            array('nick'=>$_SESSION['logged']),
            array('$unset'=>array('simulation.'.$no=>1)));
        $this->collection->update(
            array('nick'=>$_SESSION['logged']),
            array('$pull'=>array('simulation'=>null)));
    }
}
