<?php

class MainController{
    
    protected $ajax_dict = null;
    
    protected function __construct() {
        $this->unif_ajax();     
    }
    
    protected function get_ajax_dict($key){
        return $ajax_dict[$key];       
    }
    
    protected function unif_ajax(){
        $ajax_data = file_get_contents('php://input');
        $this->ajax_dict = json_decode($ajax_data, true);
        
        
//        echo 'unif_ajax: ';
//        var_dump($this->ajax_dict);
//        echo '</br>';
//        
//        foreach (explode('&', $ajax_data) as $val) {
//            
//            $arr_ajax = explode('=', $val);
//            
//            $this->ajax_dict[$arr_ajax[0]] = json_decode($arr_ajax[1], true);
//        }
//        echo 'unif_ajax dict: ';
//        var_dump($this->ajax_dict);
//        echo '</br>';
        return $this->ajax_dict;
    }            
    
    protected function redirect($ulr=""){
        header("Location: ".FrontController::$main_path.$ulr);
    }
    
    protected function cout($string){
        $file = fopen('log.txt', 'w');
        fwrite($file, $string);
        fclose($file);
    }
}

