<?php
header('Access-Control-Allow-Origin: *'); 
require_once('db.php');
$q = $db->prepare('SELECT 
	ID, 
	Time, 
	Student, 
	IF(Private = "yes", "images/private.png", IF(Time > :time, "images/timecapsule.png", Picture)) as Thumb, 
	Private,
	Color
	FROM notes WHERE Student = '.$_POST['User'].' ORDER BY time');
$q->execute(array('time' => time() * 1000));

echo json_encode($q->fetchAll());
?>