<?php
header('Access-Control-Allow-Origin: *'); 
require_once('db.php');

$note = json_decode($_POST['Note']);
$value = new StdClass();

$id = Auth($_POST['email'], $_POST['pin']);
if(!$id) { $obj = new StdClass(); $obj->Success = false; echo json_encode($obj); die(); }
$note->Student = $id;

$q = $db->prepare('UPDATE notes SET Time = :time, Student = :student, Favorite = :favorite WHERE ID = :id');
$result = $q->execute(array(
		'time' => $note->Time,
		'student' => $note->Student,
		'favorite' => $note->Favorite,
		'id' => $note->ID));
if($result)
	$value->Success = true;
else
	$value->Success = false;

$value->TimeCapsule = ($note->Time > time() * 1000);
	
$value->Error = $db->errorInfo();

echo json_encode($value);
?>