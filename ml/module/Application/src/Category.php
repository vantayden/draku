<?php
namespace Application;

class Category{

    public function __construct(){
        $this->db = new DB();
        $this->lang = lang();
    }

    public function add($data){
        $sql = "INSERT INTO `category` (`name`, `icon`, `type`) VALUES ('{$data['name']}', '{$data['icon']}', '{$data['type']}')";
        $this->db->query($sql);
        return $this->result(false, $this->lang['category_add_successful']);
    }


    public function find($id){
        $sql = "SELECT * FROM `category` WHERE `id` = '{$id}'";
        $category = $this->db->query($sql)->fetch_array();
        return $category;
    }

    public function all(){
        $result = array('category' => array());
        $sql = "SELECT * FROM `category`";
        $category = $this->db->query($sql);
        while($cat = $category->fetch_assoc()){
            $result['category'][] = $cat;
        }
        return $result;
    }

    public function remove($id){
        $this->db->query("DELETE FROM `category` WHERE `id` = '{$id}'");
        return $this->result(false, $this->lang['category_delete_successful']);
    }

    private function result($error, $message){
        return array('error' => $error, 'message' => $message);
    }
}
