<?php
/**
 * API Controller
 */

App::uses('Controller', 'Controller');
App::uses('CakeSession', 'Model/Datasource');
App::uses('Sanitize', 'Utility');

//session_start();
//if(!isset($_SESSION['user']['id'])) $_SESSION['user']['id'] = 17;
//if(!isset($_SESSION['user']['city_id'])) $_SESSION['user']['city_id'] = 1;

define('FILE_BANNED_IPS', '../../banned_ips');

class ApiController extends Controller {
    public $components = array('DebugKit.Toolbar','Session', 'RequestHandler');
//    public $name = 'Users';

    private $postdata = '';
    private $displayAll = false;
    protected $outputData = array(
        'status' => 'success',
        'data' => array(
            'dashboard' => array(
            )
        )
    );

    /* User Related Methods */
    public function beforeFilter(){
        $this->ip = filter_var($_SERVER['REMOTE_ADDR'], FILTER_VALIDATE_IP);

        if(!$this->ip) $this->writeError("System unable to recognize the client's IP.", 605);

        if(preg_match(",".$this->ip.",", ",".preg_replace(array("/\r/","/\n/"), array("",","), trim(file_get_contents(FILE_BANNED_IPS, 'r'))).",") === 1) {
            $this->writeError("User trying to access from a banned IP address.", 606);
        }

        if(CakeSession::check('User.админ') && CakeSession::read('User.админ') == "абсолютно") {
            $this->_checkAccessPermission();
        } else {
            if($this->action != 'login' && $this->action != 'logout') {
                CakeSession::destroy();
                $this->writeRedirect('#/login');
            }
        }
    }

    public function populateUserData() {
        if(CakeSession::check('User.админ') && CakeSession::read('User.админ') == "абсолютно"){
            $this->outputData['data']['user'] = array(
                "id" => CakeSession::read('User.id'),
                "username" => CakeSession::read('User.username'),
            );
            $this->outputData['data']['permissions'] = $this->_permissions();
        } else {
            unset($this->outputData['data']['user']);
        }
    }

    protected function _checkAccessPermission(){
        $params = Router::getParams();
        if($params['action'] == 'login' || $params['action'] == 'logout') {
            return true;
        }
        $accessedpath = '/'.$params['controller'].'/';
        if(isset($params['prefix'])) {
            $accessedpath .= $params['prefix'].'/';
        } elseif(isset($params['pass'][0])) {
            $accessedpath .= $params['pass'][0].'/';
        } elseif(isset($params['action'][0])) {
            $accessedpath .= $params['action'].'/';
        }
        $accessedpath = strtolower($accessedpath);
//        echo $accessedpath; exit;
        if(in_array($accessedpath, $this->_permissions())){
            return true;
        }
        $this->writeError("Access denied.", 666);
        return false;
    }

    protected function _permissions() {
        $permissions = array(
            "/listgraphs/artists/",
            "/listtables/artists/",
            "/users/testlogin/",
        );

        return $permissions;
    }

    public function ban_ip() {
        file_put_contents(FILE_BANNED_IPS, $this->ip."\n");
        $this->writeError("IP address banned from logging into the portal.", 606);
    }
    /* EOF User Related Methods */

    /* Core Methods */
    public function __construct($request, $controller){
        parent::__construct($request, $controller);
        $this->postdata = json_decode(file_get_contents("php://input"), true);
    }

    public function getPostData() {
        return $this->postdata;
    }

    protected function errorHandler($code, $description, $file = null, $line = null, $context = null) {
        if(error_reporting() == 0) {
            return;
        } elseif($code === 2048 || $code === 8192) {
            $this->writeError($description, $code);
            return;
        } else {
            echo $code;
//            exit;
        }

        // throw error for further handling
        throw new exception(strip_tags($description));
    }

    public function writeOutput() {
        $this->layout = NULL;
        $this->autoRender = false;
        $this->populateUserData();
        header('Content-type: application/json');
        echo json_encode(Sanitize::clean($this->outputData));
        die();
    }

    public function writeError($errorStringOrErrorArray = '', $errorCode = 0, $fieldName = 'mainform') {
        unset($this->outputData['data']);
        $this->outputData['status'] = 'error';
        if(gettype($errorStringOrErrorArray) == 'array') {
            if(isset($errorStringOrErrorArray[0]['fieldName']) || isset($errorStringOrErrorArray[0]['errorString'])) {
                for($i=0; $i<count($errorStringOrErrorArray); $i++) {
                    $fieldName = (empty($errorStringOrErrorArray[$i]['fieldName'])?'mainform':$errorStringOrErrorArray[$i]['fieldName']);
                    if(!empty($errorStringOrErrorArray[$i]['errorString'])) $this->outputData['error'][$fieldName]['errorString'] = $errorStringOrErrorArray[$i]['errorString'];
                    if(!empty($errorStringOrErrorArray[$i]['errorCode'])) $this->outputData['error'][$fieldName]['errorCode'] = $errorStringOrErrorArray[$i]['errorCode'];
                }
            } else {
                $this->outputData['error'] = $errorStringOrErrorArray;
            }
        } else {
            if(empty($fieldName)) $fieldName = 'mainform';
            $this->outputData['error'] = array($fieldName => array());
            if(!empty($errorStringOrErrorArray)) $this->outputData['error'][$fieldName]['errorString'] = $errorStringOrErrorArray;
            if(!empty($errorCode)) $this->outputData['error'][$fieldName]['errorCode'] = $errorCode;
        }
        $this->writeOutput();
        die();
    }

    public function writeRedirect($targetURL, $alertMessage = '') {
        unset($this->outputData['data']);
        $this->outputData['status'] = 'redirect';
        if(trim($targetURL) != '') {
            $this->outputData['redirect'] = array('redirectURL' => $targetURL);
            if(!empty($alertMessage)) $this->outputData['redirect']['alertMessage'] = $alertMessage;
        }
        $this->writeOutput();
        die();
    }
    /* EOF Core Methods */
}
