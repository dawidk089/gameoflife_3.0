<?php

// klasa wspierajaca autozalaczanie klas w plikach php
class PrepareClass{

    private $path;

    public function __construct($classes_path)
    {
        $this->path = $classes_path;
        spl_autoload_register(array($this, "add_folders"));
    }

    private function add_folders($class_name)
    {
        foreach ($this->path as $path) {
            if (file_exists($path . $class_name . ".php")) {
                include_once $path . $class_name . ".php";
                return true;
            }
        }
        return false;
    }
}