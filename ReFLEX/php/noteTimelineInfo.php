<?php
header('Access-Control-Allow-Origin: *'); 
require_once('db.php');

$id = Auth($_POST['email'], $_POST['pin']);
if(!$id) { $obj = new StdClass(); $obj->Success = false; echo json_encode($obj); die(); }

$q = $db->prepare('SELECT 
	min(Time) as Min, max(Time) as Max 
	FROM notes WHERE Student = :user');
	
$q->execute(array(
		'user' => $id
		));
		
echo json_encode($q->fetchAll());
?>