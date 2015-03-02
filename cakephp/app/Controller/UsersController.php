<?php
App::uses('ApiController', 'Controller');

//define('FILE_BANNED_IPS', '../../banned_ips');
//define('ALLOW_OLD_LOGIN', true);

class UsersController extends ApiController {
    public $components = array('Session', 'RequestHandler');
//    public $uses = array('User');
    public $name = 'User';
    public $ip = false;

    public function register(/*$username = '', $password = ''/**/) {
        $this->User->setSource('users');
        $post = $this->getPostData();
        $username = empty($post['username'])?'':$post['username'];
        $password = empty($post['password'])?'':$post['password'];

        $username = trim($username);
        $password = trim($password);

        $errorOutput = array();
        if(empty($username)) $errorOutput['username'] = array("errorCode" => 610, "errorString" => "Invalid username value.");
        if(empty($password)) $errorOutput['password'] = array("errorCode" => 611, "errorString" => "Invalid password value.");

        if(!empty($errorOutput)) {
            $this->Session->destroy();
            $this->writeError($errorOutput);
        }

        $validusers = $this->User->find('all', array(
            "fields" => array("count(`User`.`user_id`) as 'count'"),
            "conditions" => array(
                'User.username'  => $username
            ),
        ));
        if($validusers[0][0]['count'] > 0) {
            $this->Session->destroy();
            $this->writeError('User already exists.', 23000);
        }

        try{
            $query = $this->User->query("INSERT INTO `".$this->User->tablePrefix."users`(`username`, `password`) VALUES('".mysql_real_escape_string($username)."', '".mysql_real_escape_string(sha1($password))."')");
        } catch (Exception $e){
            $this->Session->destroy();
            switch($e->getCode()){
                case '23000':
                    $this->writeError('User already exists.', 23000);
                    break;
                default:
                    $this->writeError($e->getMessage(), $e->getCode());
                    break;
            }
        }

        $validusers = $this->User->find('all', array(
            "fields" => array("count(`User`.`user_id`) as 'count', `User`.`user_id`, `User`.`username`"),
            "conditions" => array(
                'User.username'  => $username,
                'User.password'  => sha1($password)
            ),
        ));
        if($validusers[0][0]['count'] > 0) {
            $this->Session->write('User.админ', 'абсолютно');
            $this->Session->write('User.id', $validusers[0]['User']['user_id']);
            $this->Session->write('User.username', $validusers[0]['User']['username']);

            unset($this->outputData['data']['dashboard']);
            $this->writeOutput();
        }
        $this->Session->destroy();
        $this->writeError('Unknown error occurred due to which user could not be logged in.', 650);
    }

    public function login(/*$username = '', $password = ''/**/) {
        $this->User->setSource('users');
        $post = $this->getPostData();
        $username = empty($post['username'])?'':$post['username'];
        $password = empty($post['password'])?'':$post['password'];

        $validusers = $this->User->find('all', array(
                                        "fields" => array("count(`User`.`user_id`) as 'count', `User`.`user_id`, `User`.`username`"),
                                        "conditions" => array(
                                            'User.username'  =>  $username,
                                            'User.password'  => sha1($password)
                                        ),
                                    ));
//        print_r($validusers); exit;
        if($validusers[0][0]['count'] > 0) {
            $this->Session->write('User.админ', 'абсолютно');
            $this->Session->write('User.id', $validusers[0]['User']['user_id']);
            $this->Session->write('User.username', $validusers[0]['User']['username']);

            unset($this->outputData['data']['dashboard']);
            $this->writeOutput();
        }
        $this->Session->destroy();
        $this->writeError('Invalid username or password.', 607);
    }

    public function logout($redirectToLogin = false) {
        $this->Session->destroy();
        if($redirectToLogin) {
            $this->writeRedirect('#/login', 'User logged out successfully.');
        } else {
            unset($this->outputData['data']);
            $this->writeOutput();
        }
        exit();
    }

    public function profile($dummy = 'profile', $autoRedirectToLoginIfRequired = false) {
        unset($this->outputData['data']);
        if($this->Session->read('User.админ') != 'абсолютно' && $autoRedirectToLoginIfRequired){
            $this->writeRedirect('#/login', 'Session already expired. Please login again.');
        } else {
            $this->writeOutput();
        }
    }

    public function testLogin() {
        echo "User Logged In";
        echo "<pre>";
        print_r($_SESSION);
        echo "</pre>";
        exit;
    }
}
