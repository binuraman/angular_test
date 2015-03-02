<?php

App::uses('ApiController', 'Controller');
App::uses('Dashboard', 'Model');

class DashboardController extends ApiController {
    public $components = array('Session', 'RequestHandler');
    public $name = "dashboard";
    private $noCSVExportColumns = '';
    private $noPDFExportColumns = '';
    private $actionprefix = '';
    private $userrole = '';
    private $userid = '';
    private $adminid = '';
    private $usercity = '';

    public function __construct($request, $controller){
        parent::__construct($request, $controller);
        $this->constructClasses();
        $params = Router::getParams();
        if(!empty($params['prefix'])) $this->actionprefix = $params['prefix'];
        elseif(!empty($params['pass'][0])) $this->actionprefix = $params['pass'][0];
        else $this->actionprefix = 'scoretable';
        $this->outputData['data'] = array('dashboard' => array($this->actionprefix => array()));
        $this->userid = $this->Session->read('User.id');
        $this->username = $this->Session->read('User.username');
    }

    public function index($action = 'scoretable') {
        $this->displayAll(true);
        $action .= "_page";
        if(method_exists($this, $action)) $this->$action();
        $this->writeOutput();
    }

    private function _formatListData($records, $outputfields) {
        $outputcolumn = array();
        if(isset($records[0])) foreach($records[0] as $record) {
            foreach($record as $key => $value) {
                $tmpTitle = explode("_", $key);
                for($i=0; $i<count($tmpTitle); $i++) {
                    $tmpTitle[$i] = ucfirst($tmpTitle[$i]);
                }
                $tmpTitle = implode(" ", $tmpTitle);
                $outputcolumn[$key] = array('title' => $tmpTitle);
            }
        }
        $outputdata = array();
        for($i=0; $i<count($records); $i++) {
            $outputdata[$i] = array();
            foreach($records[$i] as $value) {
                $outputdata[$i] = array_merge($outputdata[$i], $value);
            }
        }
        for($i=0; $i<count($outputfields); $i++) {
            if(is_array($outputcolumn) && array_key_exists($outputfields[$i], $outputcolumn)) {
                for($j=0; $j<count($outputcolumn); $j++) {
                    $this->outputData['data']['lists'][$this->actionprefix]['columns'][$outputfields[$i]] = $outputcolumn[$outputfields[$i]];
                }
            }
            if(is_array($outputdata) && array_key_exists(0, $outputdata) && array_key_exists($outputfields[$i], $outputdata[0])) {
                for($j=0; $j<count($outputdata); $j++) {
                    $this->outputData['data']['lists'][$this->actionprefix]['data'][$j][$outputfields[$i]] = $outputdata[$j][$outputfields[$i]];
                }
            }
        }
    }

    public function scoretable_page($sortby = 'id', $ascdesc = 'asc'){
        $this->dashboard->setSource('tests');

        $outputfields = explode(",", "id,date,score");

        $queryOptions = array(
            "fields" => array(
                "`dashboard`.`test_id` 'id'",
                "DATE_FORMAT(`dashboard`.`test_date`, '%d-%b-%Y %h:%i:%s %p') as 'date'",
                "IF(`dashboard`.`test_answersheet` = '', 'INCOMPLETE', CONCAT(ROUND(100 * `dashboard`.`test_score` / `dashboard`.`test_maxscore`, 0), '%')) as 'score'"
            ),
            "conditions" => array(
                'dashboard.user_id'  => $this->userid
            ),
            "order" => $sortby . ' ' . $ascdesc,
            "group" => array("id")
        );

        $records = $this->dashboard->find('all', $queryOptions);

        $this->_formatListData($records, $outputfields);
        if(!$this->displayAll()) $this->writeOutput();
    }

    public function scoretable_scorecard($testid = null){
        $this->dashboard->setSource('tests');

        $outputfields = explode(",", "date,score");

        $queryOptions = array(
            "fields" => array(
                "`dashboard`.`test_id` 'id'",
                "DATE_FORMAT(`dashboard`.`test_date`, '%d-%b-%Y %h:%i:%s %p') as 'date'",
                "CONCAT(ROUND(100 * `dashboard`.`test_score` / `dashboard`.`test_maxscore`, 0), '%') as 'score'",
                "`dashboard`.`test_answersheet` as 'answersheet'",
            ),
            "conditions" => array(
                'dashboard.user_id'  => $this->userid
            ),
            "order" => '`dashboard`.`test_id` DESC',
            "limit" => 1
        );
        if(!empty($testid)) $queryOptions['conditions']['dashboard.test_id'] = $testid;

        $records = $this->dashboard->find('all', $queryOptions);
        $output = array("id" => 0, "date" => "", "score" => "");
        if(isset($records[0])) {
            foreach($records[0] as $record){
                $output = array_merge($output, $record);
            }
            $output['answersheet'] = json_decode($output['answersheet']);
        } else {
            if(empty($testid)) {
                $this->writeError("User has not completed any tests yet.", 700);
            } else {
                $this->writeError("Invalid test id.", 701);
            }
        }
        unset($this->outputData['data']);
        $this->outputData['data'] = array("scorecard" => $output);
        if(!$this->displayAll()) $this->writeOutput();
    }

    private function _fetchQuestionnaire($withAnswers = false){
        $this->dashboard->setSource('questions');

        $queryOptions = array(
            "fields" => array(
                "`dashboard`.`quest_id` as 'id'",
                "`dashboard`.`question` as 'question'",
                "`dashboard`.`is_fib`"
            ),
            "order" => '`dashboard`.`quest_id` ASC'
        );
        if($withAnswers) {
            $queryOptions["fields"][] = "IF(`dashboard`.`is_fib` = '1', `dashboard`.`correct_answer_fib`, `dashboard`.`correct_answer_id`) as 'correct_answer'";
            $queryOptions["fields"][] = "IF(`dashboard`.`is_fib` = '1', `dashboard`.`correct_answer_fib`, '') as 'correct_answer_value'";
            $queryOptions["fields"][] = "IF(`dashboard`.`is_fib` = '1', `dashboard`.`correct_answer_pattern_fib`, '') as 'correct_answer_pattern'";
        }
        $questions = $this->dashboard->find('all', $queryOptions);

        $this->dashboard->setSource('answers');
        $queryOptions = array(
            "fields" => array(
                "`dashboard`.`answer_id` as 'id'",
                "`dashboard`.`question_id` as 'quest_id'",
                "`dashboard`.`answer` as 'answer'"
            ),
            "order" => '`dashboard`.`answer_id` ASC'
        );
        $answers = $this->dashboard->find('all', $queryOptions);

        $tmpQuestions = array();
        if(!empty($questions[0]) && !empty($questions[0]['dashboard']) && !empty($questions[0]['dashboard']['id'])) {
            for($i=0; $i<count($questions); $i++){
                $tmpQuestions[$questions[$i]['dashboard']['id']] = array();
                foreach($questions[$i] as $v){
                    $tmpQuestions[$questions[$i]['dashboard']['id']] = array_merge($tmpQuestions[$questions[$i]['dashboard']['id']], $v);
                }
                $tmpQuestions[$questions[$i]['dashboard']['id']]['question'] = utf8_encode($tmpQuestions[$questions[$i]['dashboard']['id']]['question']);
            }
        }
        $questions = $tmpQuestions;

        if(!empty($answers[0]) && !empty($answers[0]['dashboard']) && !empty($answers[0]['dashboard']['id'])) {
            for($i=0; $i<count($answers); $i++){
                if(empty($questions[$answers[$i]['dashboard']['quest_id']]['options'])) $questions[$answers[$i]['dashboard']['quest_id']]['options'] = array();
                $answers[$i]['dashboard']['answer'] = utf8_encode($answers[$i]['dashboard']['answer']);
                $questions[$answers[$i]['dashboard']['quest_id']]['options'][] = $answers[$i]['dashboard'];
                if($withAnswers && $questions[$answers[$i]['dashboard']['quest_id']]['correct_answer'] == $answers[$i]['dashboard']['id']) {
                    $questions[$answers[$i]['dashboard']['quest_id']]['correct_answer_value'] = $answers[$i]['dashboard']['answer'];
                }
            }
        }

        ksort($questions);
        $tmpQuestions = array();
        foreach($questions as $question){
            $tmpQuestions[] = $question;
        }
        $questions = $tmpQuestions;
        return $questions;
    }

    public function questionnaire_page(){
        $this->outputData['data']['dashboard']['questionnaire'] = $this->_fetchQuestionnaire();
        if(!$this->displayAll()) $this->writeOutput();
    }

    public function questionnaire_start(){
        $this->dashboard->setSource('tests');

        $newtests = $this->dashboard->find('all', array(
            "fields" => array("count(`dashboard`.`test_id`) as 'count'"),
            "conditions" => array(
                'dashboard.test_answersheet'  => "",
                'dashboard.user_id'  => $this->userid
            ),
            "order" => '`dashboard`.`test_id` DESC',
            "limit" => 1
        ));
        unset($this->outputData['data']);
        if($newtests[0][0]['count'] > 0) {
            if(!$this->displayAll()) $this->writeOutput();
        }

        try{
            $query = $this->dashboard->query("INSERT INTO `".$this->dashboard->tablePrefix."tests`(`user_id`, `test_score`, `test_maxscore`, `test_answersheet`) VALUES('".$this->userid."', '0', '0', '')");
        } catch (Exception $e){
            $this->writeError('Unable to write into database due to unknown reasons. Test could not be started. Please retry.', 675);
        }
        if(!$this->displayAll()) $this->writeOutput();
    }

    public function questionnaire_status(){
        $this->dashboard->setSource('tests');

        $newtests = $this->dashboard->find('all', array(
            "fields" => array("count(`dashboard`.`test_id`) as 'count'"),
            "conditions" => array(
                'dashboard.test_answersheet'  => "",
                'dashboard.user_id'  => $this->userid
            ),
            "order" => '`dashboard`.`test_id` DESC',
            "limit" => 1
        ));
        unset($this->outputData['data']);
        if($newtests[0][0]['count'] > 0) {
            $this->outputData['data']['questionnaireInProgress'] = 1;
        } else {
            $this->outputData['data']['questionnaireInProgress'] = 0;
        }
        if(!$this->displayAll()) $this->writeOutput();
    }

    private function _getQuestionsWithAnswersAndCorrectAnswers($answers) {
        $questions = $this->_fetchQuestionnaire(true);

        if(count($questions) == count($answers)) {
            for($i=0; $i<count($questions); $i++) {
                if(!isset($answers[$i]->value)) {
                    $this->writeError("Corrupted answersheet data.", 672);
                }
                $questions[$i]['user_answer'] = $answers[$i]->value;
            }
        } else {
            $this->writeError("Invalid answersheet data.", 671);
        }
        return $questions;
    }

    private function _calculateScores($questionnaireWithAnswers) {
        $output = array("test_score" => 0, "test_maxscore" => count($questionnaireWithAnswers));
        for($i=0; $i<count($questionnaireWithAnswers); $i++) {
            if($questionnaireWithAnswers[$i]['user_answer'] != "" && ($questionnaireWithAnswers[$i]['user_answer'] == $questionnaireWithAnswers[$i]['correct_answer'])) $output['test_score']++;
        }
        return $output;
    }

    public function questionnaire_saveresponse(){
        $this->dashboard->setSource('tests');

        $newtests = $this->dashboard->find('all', array(
            "fields" => array("count(`dashboard`.`test_id`) as 'count', `dashboard`.`test_id` as 'id'"),
            "conditions" => array(
                'dashboard.test_answersheet'  => "",
                'dashboard.user_id'  => $this->userid
            ),
            "order" => '`dashboard`.`test_id` DESC',
            "limit" => 1
        ));
        if($newtests[0][0]['count'] <= 0) {
            $this->writeRedirect("#/", "Server could not locate any test with status 'in-progress'. Please go back to home screen and start a new test by clicking on 'Take a new test' button.");
        }

        $post = $this->getPostData();
        $answers = empty($post['answers'])?'':$post['answers'];
//        $answers = empty($_REQUEST['answers'])?'':$_REQUEST['answers'];
        $answers = trim($answers);

        try{
            $tmpAnswers = json_decode($answers);
        } catch (Exception $e){
            $this->writeError("Inalid answersheet data.", 670);
        }

        $questionnaire = $this->_getQuestionsWithAnswersAndCorrectAnswers($tmpAnswers);
        $scores = $this->_calculateScores($questionnaire);

        try{
            $query = $this->dashboard->query("UPDATE `".$this->dashboard->tablePrefix."tests` SET `test_score`='".$scores['test_score']."', `test_maxscore`='".$scores['test_maxscore']."', `test_answersheet`='".mysql_real_escape_string(json_encode($questionnaire))."' WHERE `test_id`='".$newtests[0]['dashboard']['id']."'");
        } catch (Exception $e){
            $this->writeError('Unable to write into database due to unknown reasons. Failed to save test data. Please retry.', 676);
        }

        unset($this->outputData['data']);
        if(!$this->displayAll()) $this->writeOutput();
    }
}
