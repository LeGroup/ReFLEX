<?php
header('Access-Control-Allow-Origin: *'); 
require_once('db.php');
$q = $db->prepare('SELECT Private FROM notes WHERE ID = :id');
$q->execute(array('id' => $_POST['id']));

//Object to return as Json
$obj = new StdClass();	
$obj->ID = $_POST['id'];

//Note is private, need to check for pin
if($q->fetchColumn() == 'yes') {
	$q = $db->prepare('SELECT IF(pin = :pin, 1, 0) FROM users WHERE id = :id');
	$q->execute(array(
		'pin' => $_POST['pin'],
		'id' => $_POST['user']));
		
	$result = $q->fetchColumn();
}
else
	$result = 1;

//Check if user has access to the note
if($result == 0) {
	$obj->Success = false;
	$obj->CorrectPin = false;
}
else {
	$obj->CorrectPin = true;
	
	$q = $db->prepare('SELECT Picture, Voice, Time FROM notes WHERE 
		Student = :user AND 
		ID = :id
		ORDER BY time');

	$q->execute(array(
		'user' => $_POST['user'],
		'id' => $_POST['id']));

	$obj->Error = $q->errorInfo();
	
	if($q->rowCount() == 1) {
		$obj = $q->fetchObject();
		
		if($obj->Time > time() * 1000) {
			$obj->Success = false;
			$obj->Message = 'Note is closed for now.';
		}
		else
			$obj->Success = true;
	}
	else
		$obj->Success = false;
}
	
echo json_encode($obj);
?>