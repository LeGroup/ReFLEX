<?php
header('Access-Control-Allow-Origin: *'); 
require_once('db.php');

$user = Auth($_POST['email'], $_POST['pin']);

if(!$user) { $obj = new StdClass(); $obj->Success = false; echo json_encode($obj); die(); }

$id = isset($_POST['id']) ? $_POST['id'] : 0;

$q = $db->prepare('SELECT 
	ID, 
	Time, 
	Student, 
	Picture as Thumb,
	Favorite,
	AudioLength as Length
	FROM notes WHERE Student = :user 
	AND Time >= :start 
	AND Time < :end 
	AND ID > :id
	LIMIT 0, 1');
	
$q->execute(array(
		'user' => $user,
		'start' => $_POST['start'],
		'end' => $_POST['end'],
		'id' => $id )
		);
		
echo json_encode($q->fetchAll());
?>