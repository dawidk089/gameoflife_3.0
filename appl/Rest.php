<?php

// wymuszenie interface w konwencji rest
interface Rest{
    public function get($action);
    public function post($action);
    public function put($action);
    public function delete($action);
}