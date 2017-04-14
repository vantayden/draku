<?php

namespace Application;

class DB
{
    public function __construct()
    {
        $this->db = new \mysqli('localhost', 'root', '', 'test');
    }

    public function __destruct()
    {
        $this->db->close();
    }

    public function query($sql){
        return $this->db->query($sql);
    }

}
