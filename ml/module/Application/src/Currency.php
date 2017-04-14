<?php
namespace Application;

class Currency{

    public function __construct(){
        $this->db = new DB();
        $this->lang = lang();
    }

    public function add($data){
        $sql = "INSERT INTO `currency` (`name`, `icon`, `short`) VALUES ('{$data['name']}', '{$data['icon']}', '{$data['short']}')";
        $this->db->query($sql);
        return $this->result(false, $this->lang['currency_add_successful']);
    }

    public function all(){
        $result = array('category' => array());
        $sql = "SELECT * FROM `currency`";
        $category = $this->db->query($sql);
        while($cat = $category->fetch_assoc()){
            $result['currency'][] = $cat;
        }
        return $result;
    }

    public function remove($id){
        $this->db->query("DELETE FROM `currency` WHERE `id` = '{$id}'");
        return $this->result(false, $this->lang['currency_delete_successful']);
    }

    private function result($error, $message){
        return array('error' => $error, 'message' => $message);
    }
}
