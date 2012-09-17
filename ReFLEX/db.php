<?php
$db = new PDO('mysql:dbname=reflex;host=127.0.0.1', 'root', '');
$log = fopen("log/log.txt", 'a');

function _log($text) {
	global $log;
	fwrite($log, date('Y.m.d H:i:s') . " - ".$text."\n");
}

?>