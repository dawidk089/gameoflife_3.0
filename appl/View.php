<?php

// klasa wspierajaca implementacje szablonow strony z odpowiednimi paramterami
// caly serwis posiada staly szablon naglowka i stopki strony
class View{

    private $templates = null;
    private $data = null;

    public function __construct($template_paths, $data){
        $this->templates = $template_paths;
        $this->data = $data;
    }

    private $path = array(
        'header'=>"template/headerer.phtml",
        'footer'=>"template/footerer.phtml",
    );

    public function show(){
        $this->set_header();
        $this->set_main();
        $this->set_footer();
    }

    private function set_main(){
        foreach($this->templates as $template) {
            extract($this->data);
            include_once $template;
        }
    }

    private function set_header(){
        extract($this->data);
        include_once $this->path['header'];
    }

    private function set_footer(){
        extract($this->data);
        include_once $this->path['footer'];
    }
}