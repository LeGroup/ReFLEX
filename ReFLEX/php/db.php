<?php
//Settings of database
$user = 'root';
$pass = 'x)*z8uUmpswmjeUh3y';
$database = 'reflex';
$host = '127.0.0.1';

//Self-explanatory
//Used for disabling mail in local servers
$mail_enabled = true;

//Connect database
$db = new PDO('mysql:dbname='.$database.';host='.$host, $user, $pass);

//Open log file resource
if(!isset($log)) { $log = fopen("../log/log.txt", 'a'); }

function _log($text) {
	global $log;
	fwrite($log, date('Y.m.d H:i:s') . " - ".$text."\n");
}

?>