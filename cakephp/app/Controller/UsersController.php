<?php
App::uses('ApiController', 'Controller');

//define('FILE_BANNED_IPS', '../../banned_ips');
//define('ALLOW_OLD_LOGIN', true);

class UsersController extends ApiController {
    public $components = array('Session', 'RequestHandler');
//    public $uses = array('User');
    public $name = 'User';
    public $ip = false;

    public function login($username, $password) {
        $this->User->setSource('users');
        $post = $this->getPostData();
//        $username = $post['username'];
//        $password = $post['password'];

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

    public function logout($redirectToLogin = true) {
        $this->Session->destroy();
        if($redirectToLogin) {
            $this->writeRedirect('#/login', 'User logged out successfully.');
        } else {
            unset($this->outputData['data']);
            $this->writeOutput();
        }
        exit();
    }

    public function testLogin() {
        echo "User Logged In";
        echo "<pre>";
        print_r($_SESSION);
        echo "</pre>";
        exit;
    }
}
