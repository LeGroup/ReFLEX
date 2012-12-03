<?php
header('Access-Control-Allow-Origin: *'); 
require_once('db.php');


//Object to return as Json
$obj = new StdClass();	

$id = Auth($_POST['email'], $_POST['pin']);
if(!$id) { $obj = new StdClass(); $obj->Success = false; echo json_encode($obj); die(); }

$obj->ID = $_POST['id'];

$q = $db->prepare('SELECT Picture, Voice, Time FROM notes WHERE 
	Student = :user AND 
	ID = :id
	ORDER BY time');

$q->execute(array(
	'user' => $id,
	'id' => $_POST['id']));

$obj->Error = $q->errorInfo();

if($q->rowCount() == 1) {
	$obj = $q->fetchObject();
	
	if($obj->Time > time() * 1000 + 1000 * 120) {
		$obj->Voice = false;
	}
	
	$obj->Success = true;
}
else
	$obj->Success = false;

	
echo json_encode($obj);
?>