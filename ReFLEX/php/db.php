<?php
//Self-explanatory.
//First one is used for disabling mail in local servers.
define('MAIL_ENABLED', true);
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
// $pass = ''; //Local

//Connect database.
$db = new PDO('mysql:dbname='.$database.';host='.$host, $user, $pass);

unset($pass);

//The point of these comments is that the file will change and it can be commited to the server. 
//(Some failing with conflict resolving.)
function _log($text) {
	global $log;
	fwrite($log, date('Y.m.d H:i:s') . " - ".$text."\n");
}

function DoubleSaltedHash($pw, $salt) {
    return sha1($salt.sha1($salt.sha1($pw)));
}
?>