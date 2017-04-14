<?php
/**
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2016 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace Application;

class User{

    public function __construct(){
        $this->db = new DB();
        $this->lang = lang();
    }

    private function select($user){
        if(is_numeric($user))
            $sql = "SELECT * FROM `user` WHERE `id` = '{$user}'";
        else
            $sql = "SELECT * FROM `user` WHERE `email` = '{$user}'";
        return $this->db->query($sql);
    }

    public function add($data){
        $user = $this->select($data['email']);
        if($user->num_rows == 1)
            return $this->result(true, $this->lang['user_email_exist']);
        else{
            $sql = "INSERT INTO `user` (`email`, `password`, `name`) VALUES ('{$data['email']}', '".md5($data['password'])."', '{$data['name']}')";
            $this->db->query($sql);
            return $this->result(false, $this->lang['user_add_successful']);
        }
    }

    public function find($user){
        while ($row = $this->select($user)->fetch_assoc()) {
            unset($row['password']);
            return $row;
        }
    }

    public function update($data){
		$user = $this->select($data['user'])->fetch_array();
		if(md5($data['old_password']) != $user['password'])
			return $this->result(true, $this->lang['user_password_missmatch']);
		else {
			$sql = "UPDATE `user` SET ";
			if(isset($data['new_password']))
				$sql .= "`password` = '".md5($data['new_password'])."' ";
			if(isset($data['name']))
				$sql .= ", `name` = '{$data['name']}' ";
			$sql .= "WHERE `id` = '{$data['user']}'";
			$this->db->query($sql);
			return $this->result(false, $this->lang['user_update_successful']);
		}
    }

    public function login($data){
        $user = $this->select($data['email']);
        if($user->num_rows == 0){
            return $this->result(true, $this->lang['user_email_dont_exist']);
        } else {
            $user = $user->fetch_array();
            if(md5($data['password']) != $user['password'])
                return $this->result(true, $this->lang['user_password_missmatch']);
            else {
                $Session = new Session();
                $session_value = $Session->add($user['id']);
                $result = $this->result(false, $this->lang['user_login_success']);
                $result['session'] = $session_value;
                return $result;
            }
        }
    }

    private function result($error, $message){
        return array('error' => $error, 'message' => $message);
    }
}
