<?php

namespace Application;

class Wallet{

    public function __construct(){
        $this->db = new DB();
        $this->lang = lang();
    }

    public function add($data){
        $sql = "INSERT INTO `wallet` (`name`, `currency`, `startAmount`, `user`) VALUES ('{$data['name']}', '{$data['currency']}', '{$data['startAmount']}', '{$data['user']}')";
        $this->db->query($sql);
        return $this->result(false, $this->lang['wallet_add_successful']);
    }

    public function update($data){
        $sql = "UPDATE `wallet` SET ";
        if(isset($data['name']))
            $sql .= "`name` = '{$data['name']}' ";
        if(isset($data['currency']))
            $sql .= ", `currency` = '{$data['currency']}' ";
        if(isset($data['startAmount']))
            $sql .= ", `startAmount` = '{$data['startAmount']}' ";
        $sql .= "WHERE `id` = '{$data['id']}'";
        $this->db->query($sql);
        return $this->result(false, $this->lang['wallet_update_successful']);
    }

    public function all($data){
        $result = array('wallet' => array());
        $wallet = $this->db->query("SELECT * FROM `wallet` WHERE `user` = '{$data['user']}'");
        while($row = $wallet->fetch_assoc()){
            $currency = $this->db->query("SELECT * FROM `currency` WHERE `id` = '{$row['currency']}'")->fetch_array();
            unset($row['user']);
            $row['currency'] = $currency['short'];
            $row['balance'] = $this->balance($row['id']);
            $result['wallet'][] = $row;
        }
        return $result;
    }

    public function find($id){
        while ($row = $this->db->query("SELECT * FROM `wallet` WHERE `id` = '{$id}'")->fetch_assoc()) {
            unset($row['user']);
            return $row;
        }
    }

    public function remove($id){
        $this->db->query("DELETE FROM `wallet` WHERE `id` = '{$id}'");
        return $this->result(false, $this->lang['wallet_delete_successful']);
    }

    public function balance($id){
        $wallet = $this->db->query("SELECT * FROM `wallet` WHERE `id` = '{$id}'")->fetch_array();
        $balance = $wallet['startAmount'];
        $transactions = $this->db->query("SELECT * FROM `transaction` WHERE `wallet` = '{$wallet['id']}'");
        while($t = $transactions->fetch_assoc()){
            $cat = $this->db->query("SELECT * FROM `category` WHERE `id` = '{$t['category']}'")->fetch_array();
            if($cat['type'] == 0)
                $balance -= $t['amount'];
            else
                $balance += $t['amount'];
        }
        return $balance;
    }

    public function owner($id){
        $wallet = $this->db->query("SELECT * FROM `wallet` WHERE `id` = '{$id}'")->fetch_array();
        return $wallet['user'];
    }

    private function result($error, $message){
        return array('error' => $error, 'message' => $message);
    }
}
