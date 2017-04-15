<?php
/**
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2016 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace Application;

class Transaction{

    public function __construct(){
        $this->db = new DB();
        $this->lang = lang();
    }
    /*add Transaction with check balance
    public function add($data){
        $Wallet = new Wallet();
        $balance = $Wallet->balance($data['wallet']);
        if($data['amount'] > $balance)
            return $this->result(true, $this->lang['transaction_balance']);
        else {
            $dt = new \DateTime($data['date']);
            $sql = "INSERT INTO `transaction` (`amount`, `note`, `category`, `wallet`, `date`) VALUES ('{$data['amount']}', '{$data['note']}', '{$data['category']}', '{$data['wallet']}', '{$dt->format('Y-m-d')}')";
            $this->db->query($sql);
            return $this->result(false, $this->lang['transaction_add_successful']);
        }
    }*/

    public function add($data){
        $dt = new \DateTime($data['date']);
        $sql = "INSERT INTO `transaction` (`amount`, `note`, `category`, `wallet`, `date`) VALUES ('{$data['amount']}', '{$data['note']}', '{$data['category']}', '{$data['wallet']}', '{$dt->format('Y-m-d')}')";
        $this->db->query($sql);
        return $this->result(false, $this->lang['transaction_add_successful']);
    }

    public function update($data){
        $sql = "UPDATE `transaction` SET ";
        if(isset($data['amount']))
            $sql .= "`amount` = '{$data['amount']}' ";
        if(isset($data['note']))
            $sql .= ", `note` = '{$data['note']}' ";
        if(isset($data['category']))
            $sql .= ", `category` = '{$data['category']}' ";
        if(isset($data['wallet']))
            $sql .= ", `wallet` = '{$data['wallet']}' ";
        if(isset($data['date'])){
            $dt = new \DateTime($data['date']);
            $sql .= ", `date` = '{$dt->format('Y-m-d')}' ";
        }
        $sql .= "WHERE `id` = '{$data['id']}'";
        $this->db->query($sql);
        return $this->result(false, $this->lang['transaction_update_successful']);
    }

    public function all($wallet){
        $result = array('transaction' => array());
        $transaction = $this->db->query("SELECT * FROM `transaction` WHERE `wallet` = '{$wallet}'");
        if($transaction->num_rows > 0)
            while($row = $transaction->fetch_assoc()){
                $cat = $this->db->query("SELECT * FROM `category` WHERE `id` = '{$row['category']}'")->fetch_array();
                $wallet = $this->db->query("SELECT * FROM `wallet` WHERE `id` = '{$row['wallet']}'")->fetch_array();
                unset($wallet['startAmount']);
                $row['category'] = $cat;
                $row['wallet'] = $wallet;
                $result['transaction'][] = $row;
            }
        return $result;
    }


    public function find($id){
        while ($row = $this->db->query("SELECT * FROM `transaction` WHERE `id` = '{$id}'")->fetch_assoc()) {
            unset($row['user']);
            return $row;
        }
    }

    public function remove($id){
        $this->db->query("DELETE FROM `transaction` WHERE `id` = '{$id}'");
        return $this->result(false, $this->lang['transaction_delete_successful']);
    }

    public function owner($id){
        $transaction = $this->db->query("SELECT * FROM `transaction` WHERE `id` = '{$id}'")->fetch_array();
        $wallet = $this->db->query("SELECT * FROM `wallet` WHERE `id` = '{$transaction['wallet']}'")->fetch_array();
        return $wallet['user'];
    }

    private function result($error, $message){
        return array('error' => $error, 'message' => $message);
    }
}
