<?php
require_once('db.php');

$note = json_decode($_POST['Note']);
$value = new StdClass();

$q = $db->prepare('UPDATE notes SET Time = :time, Picture = :picture, Voice = :voice, Student = :student, Title = :title WHERE ID = :id');
$result = $q->execute(array(
				'time' => $note->Time,
				'picture' => $note->Picture,
				'voice' => $note->Voice,
				'student' => $note->Student,
				'title' => $note->Title,
				'id' => $note->ID));
if($result)
	$value->Success = true;
else
	$value->Success = false;

$value->Error = $db->errorInfo();
echo json_encode($value);
?>