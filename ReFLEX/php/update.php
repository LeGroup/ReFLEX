<?php
require_once('db.php');

$note = json_decode($_POST['Note']);
$value = new StdClass();

$q = $db->prepare('UPDATE notes SET Time = :time, Student = :student, Private = :private, Color = :color WHERE ID = :id');
$result = $q->execute(array(
				'time' => $note->Time,
				'student' => $note->Student,
				'private' => $note->Private ? 'yes' : 'no',
				'color' => $note->Color,
				'id' => $note->ID));
if($result)
	$value->Success = true;
else
	$value->Success = false;

$value->Error = $db->errorInfo();
$value->Private = $note->Private;

if(!$note->Private) {
	$q = $db->prepare('SELECT Picture FROM notes WHERE ID = :id');
	$q->execute(array('id' => $note->ID));
	$value->Picture = $q->fetchColumn();
}
echo json_encode($value);
?>