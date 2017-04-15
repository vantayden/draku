<?php
/**
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2016 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace Application\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Application\Category;
use Application\Currency;
use Application\Transaction;
use Application\User;
use Application\Wallet;
use Application\Session;

require('/../../lang/vn.php');

class APIController extends AbstractActionController
{
    private $validate = array(
        'user_add' => array('email' => 'email', 'password' => 'text', 'name' => 'text'),
        'user_login' => array('email' => 'email', 'password' => 'text'),
        'user_update' => array('new_password' => 'text'),
        'wallet_add' => array('name' => 'text', 'currency' => 'number', 'startAmount' => 'number'),
        'transaction_add' => array('amount' => 'number', 'date' => 'text', 'note' => 'text', 'category' => 'number', 'wallet' => 'wallet'),
        'category_add' => array('name' => 'text', 'icon' => 'text', 'type' => 'number',),
        'currency_add' => array('name' => 'text', 'icon' => 'text', 'short' => 'text',),
    );

    private $Error = array('error'=> true);

    public function __construct(){
        $this->lang = lang();
        $this->Error['message'] = $this->lang['api_error'];
    }

    public function indexAction(){
        return $this->redirect()->toRoute('home');
    }

    private function renderView(){
        $view = new ViewModel();
        $view->setTemplate('/application/api/api');
        $view->setTerminal(true);
        return $view;
    }


    public function apiAction(){
        $this->do = $this->params()->fromRoute('do');
        $this->data = json_decode($this->getRequest()->getContent(), true);
        $this->method = $this->getRequest()->getMethod();
        $session = explode(": ", $this->getRequest()->getHeader('session')->toString());
        if(count($session) > 0)
            $this->session = $session[1];

        $model = $this->params()->fromRoute('model');
        switch($model){
            case 'category':
                $result = $this->handleCategory();
                break;
            case 'currency':
                $result = $this->handleCurrency();
                break;
            case 'transaction':
                $result = $this->handleTransaction();
                break;
            case 'user':
                $result = $this->handleUser();
                break;
            case 'wallet':
                $result = $this->handleWallet();
                break;
            default:
                $result = $this->Error;
        }

        $view = $this->renderView();
        $view->setVariables(array('data' => $result));
        return $view;
    }

    private function handleCategory(){
        $cat = $this->params()->fromRoute('id');
        $Category = new Category();
        switch($this->do){
            case 'add':
                if ($this->method != 'POST' || !$this->postValidate($this->data, $this->validate['category_add'])) {
                    $result = $this->Error;
                } else {
                    return $Category->add($this->data);
                }
                break;
            case 'all':
                if ($this->method != 'GET') {
                    $result = $this->Error;
                } else {
                    return $Category->all();
                }
                break;
            case 'remove':
                if ($this->method != 'GET') {
                    $result = $this->Error;
                } else {
                    return $Category->remove($cat);
                }
                break;
            default:
                $result = $this->Error;
        }

        if(!isset($result))
            return $this->Error;
        else
            return $result;
    }

    private function handleCurrency(){
        $currency = $this->params()->fromRoute('id');
        $Currency = new Currency();
        switch($this->do){
            case 'add':
                if ($this->method != 'POST' || !$this->postValidate($this->data, $this->validate['currency_add'])) {
                    $result = $this->Error;
                } else {
                    return $Currency ->add($this->data);
                }
                break;
            case 'all':
                if ($this->method != 'GET') {
                    $result = $this->Error;
                } else {
                    return $Currency ->all();
                }
                break;
            case 'remove':
                if ($this->method != 'GET') {
                    $result = $this->Error;
                } else {
                    return $Currency ->remove($currency);
                }
                break;
            default:
                $result = $this->Error;
        }

        if(!isset($result))
            return $this->Error;
        else
            return $result;
    }

    private function handleTransaction(){
        $transaction = $this->params()->fromRoute('id');
        $Transaction = new Transaction();
        $Session = new Session();

        $user = $Session->find($this->session);
        if (isset($user['error']))
            return $user;
        else {
            $this->data['user'] = $user;
            switch ($this->do) {
                case 'add':
                    if ($this->method != 'POST' || !$this->postValidate($this->data, $this->validate['transaction_add'])) {
                        $result = $this->Error;
                    } else {
                        return $Transaction->add($this->data);
                    }
                    break;
                case 'all':
                    if ($this->method != 'GET') {
                        $result = $this->Error;
                    } else {
                        return $Transaction->all($transaction);
                    }
                    break;
                case 'info':
                    if ($this->method != 'GET' || $transaction == '') {
                        $result = $this->Error;
                    } else {
                        if ($user != $Transaction->owner($transaction))
                            return $this->Error;
                        else {
                            return $Transaction->find($transaction);
                        }
                    }
                    break;
                case 'update':
                    if ($this->method != 'POST') {
                        $result = $this->Error;
                    } else {
                        if ($user != $Transaction->owner($transaction))
                            return $this->Error;
                        else {
                            $this->data['id'] = $transaction;
                            return $Transaction->update($this->data);
                        }
                    }
                    break;
                case 'remove':
                    if ($this->method != 'GET') {
                        $result = $this->Error;
                    } else {
                        if ($user != $Transaction->owner($transaction))
                            return $this->Error;
                        else {
                            return $Transaction->remove($transaction);
                        }
                    }
                    break;
                default:
                    $result = $this->Error();
            }
        }

        if(!isset($result))
            return $this->Error;
        else
            return $result;
    }

    private function handleUser(){
        $User = new User();
        $Session = new Session();
        switch($this->do){
            case 'add':
                if($this->method != 'POST' || !$this->postValidate($this->data, $this->validate['user_add']))
                    $result = $this->Error;
                else {
                    return $User->add($this->data);
                }
                break;
            case 'info':
                if($this->method != 'GET' || $this->session == '') {
                    $result = $this->Error;
                }
                else {
                    $session = $Session->find($this->session);
                    if(isset($session['error']))
                        return $session;
                    else
                        return $User->find($session);
                }
                break;
            case 'update':
                if($this->method != 'POST')
                    $result = $this->Error;
                else {
                    $session = $Session->find($this->session);
                    if(isset($session['error']))
                        return $session;
                    else {
                        $this->data['user'] = $session;
                        return $User->update($this->data);
                    }
                }
                break;
            case 'login':
                if($this->method != 'POST' || !$this->postValidate($this->data, $this->validate['user_login'])){
                    $result = $this->Error;
                } else {
                    return $User->login($this->data);
                }
                break;
            default:
                $result = $this->Error;
        }

        if(!isset($result))
            return $this->Error;
        else
            return $result;
    }

    private function handleWallet(){
        $wallet = $this->params()->fromRoute('id');
        $Wallet = new Wallet();
        $Session = new Session();

        $user = $Session->find($this->session);
        if(isset($user['error']))
            return $user;
        else {
            $this->data['user'] = $user;
            switch($this->do){
                case 'add':
                    if($this->method != 'POST' || !$this->postValidate($this->data, $this->validate['wallet_add'])){
                        $result = $this->Error;
                    } else {
                        return $Wallet->add($this->data);
                    }
                    break;
                case 'all':
                    if($this->method != 'GET'){
                        $result = $this->Error;
                    } else {
                        return $Wallet->all($this->data);
                    }
                    break;
                case 'info':
                    if($this->method != 'GET' || $wallet == ''){
                        $result = $this->Error;
                    } else {
                        if($user != $Wallet->owner($wallet))
                            return $this->Error;
                        else{
                            return $Wallet->find($wallet);
                        }
                    }
                    break;
                case 'current':
                    if($this->method != 'GET' || $wallet == ''){
                        $result = $this->Error;
                    } else {
                        if($user != $Wallet->owner($wallet))
                            return $this->Error;
                        else{
                            return $Wallet->current($wallet);
                        }
                    }
                    break;
                case 'update':
                    if($this->method != 'POST'){
                        $result = $this->Error;
                    } else {
                        if($user != $Wallet->owner($wallet))
                            return $this->Error;
                        else{
                            $this->data['id'] = $wallet;
                            return $Wallet->update($this->data);
                        }
                    }
                    break;
                case 'remove':
                    if($this->method != 'GET'){
                        $result = $this->Error;
                    } else {
                        if($user != $Wallet->owner($wallet))
                            return $this->Error;
                        else{
                            return $Wallet->remove($wallet);
                        }
                    }
                    break;
                default:
                    $result = $this->Error();
            }
        }


        if(!isset($result))
            return $this->Error;
        else
            return $result;
    }

    private function postValidate($data, $value){
        foreach($value as $k => $v)
            if(!isset($data[$k]) || !$this->checkType($data[$k], $v))
                return false;
        return true;
    }

    private function checkType($data, $type){
        switch($type){
            case 'email':
                if(filter_var($data, FILTER_VALIDATE_EMAIL) === false)
                    return false;
                break;
            case 'number':
                if(!is_numeric($data))
                    return false;
                break;
            default:
                return true;
        }
        return true;
    }
}
