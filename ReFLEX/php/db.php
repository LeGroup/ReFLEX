<?php
//Self-explanatory.
//First one is used for disabling mail in local servers.
define('MAIL_ENABLED', false);
define('LANGUAGE', isset($_POST['Language']) ? $_POST['Language'] : 'en-EN');
define('WEBSITE_SALT', $_SERVER['WEBSITE_SALT']);
define('SERVER_URL', 'http://reflex.aalto.fi/');
define('MAIL_HEADERS', 
'From: Reflex' . "\r\n" .
'Content-type: text/html; charset=utf-8' . "\r\n");

//Open log file resource.
if(!isset($log)) { $log = fopen("../log/log.txt", 'a'); }

//Settings of database.
$database = 'reflex';
$user = 'root';
$host = '127.0.0.1';
$pass = 'x)*z8uUmpswmjeUh3y';
$pass = ''; //Local

$localized = json_decode(file_get_contents('../i18n/localized_'.LANGUAGE.'.js'));
	

//Connect database.
$db = new PDO('mysql:dbname='.$database.';host='.$host, $user, $pass);

unset($pass);

//The point of these comments is that the file will change and it can be commited to the server. 
//(Some failing with conflict resolving.)
function _log($text) {
	global $log;
	fwrite($log, date('Y.m.d H:i:s') . " - ".$text."\n");
}

function DoubleSaltedHash($pw, $salt = WEBSITE_SALT) {
    return sha1($salt.sha1($salt.sha1($pw)));
}

function Auth($email, $pin) {
	global $db;
	$q = $db->prepare('SELECT id FROM users WHERE email = :email AND pin = :pin');
	$q->execute(array('email' => $email, 'pin' => $pin));
	
	if($q->rowCount() == 1) {
		return $q->fetchColumn();
	}
	else {
		return false;
	}
	
}

function localize($str) {
	global $localized;
	if(!isset($localized[$str])) { _log('Localization error: ' .$str .' missing in '. LANGUAGE); }
	return isset($localized[$str]) ? $localized[$str] : $str;
}
?>