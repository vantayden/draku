<?php

namespace Application;

class Session{

    public function __construct(){
        $this->db = new DB();
        $this->lang = lang();
    }

    private function generate($length = 32){
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    private function dateDiffTs($start_ts, $end_ts) {
        $diff = $end_ts - $start_ts;
        return round($diff / 86400);
    }

    public function add($id){
        $session_value = $this->generate();
        $sql = "INSERT INTO `session` (`value`, `user`) VALUES ('{$session_value}', '{$id}')";
        $this->db->query($sql);
        return $session_value;
    }

    public function find($session){
        $sql = "SELECT * FROM `session` WHERE `value` = '{$session}'";
        $session = $this->db->query($sql);
        if($session->num_rows == 0)
            return $this->result(true, $this->lang['session_dont_exist']);
        else {
            $session = $session->fetch_array();
            if($this->dateDiffTs(time(), $session['time']) > 2){
                $this->remove($session['id']);
                return $this->result(true, $this->lang['session_exprired']);
            }
            else
                return $session['user'];
        }
    }

    private function remove($id){
        $this->db->query("DELETE FROM `session` WHERE `id` = '{$id}'");
    }

    private function result($error, $message){
        return array('error' => $error, 'message' => $message);
    }
}
