<?php

// Report all PHP errors (see changelog)
error_reporting(E_ALL);
ini_set('display_errors', 1);

//otwiera sesje jesli jej nie ma
session_start();

//implementuje autoladowanie klas w projekcie
require_once "appl/PrepareClass.php";

new PrepareClass(array(
    "./",
    "appl/",
    "auth/",
    "login/",
    "testy/",
    "simulator/",
    "model/",
    "automaton/",
    "list/",
    "about/",
    "test/"
));

//uruchamia i wywoluje odpowiedni kontroler wspierajac sie na glownej klasie -- FrontController
$front_controller = new FrontController();
