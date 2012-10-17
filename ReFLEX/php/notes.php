<?php
header('Access-Control-Allow-Origin: *'); 
require_once('db.php');
$q = $db->prepare('SELECT 
	ID, 
	Time, 
	Student, 
	IF(Private = "yes", "images/private.png", Picture) as Thumb, 
	Private,
	Color
	FROM notes WHERE Student = '.$_POST['User'].' ORDER BY time');
$q->execute();

$obj = $q->fetchAll();
foreach($obj as $note) {
	if($note->Time > time() * 1000)
		$note->Thumb = 'images/private.png';
}	
echo json_encode($obj);
?>