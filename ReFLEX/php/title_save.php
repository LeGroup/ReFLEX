<?php
header('Access-Control-Allow-Origin: *'); 
require_once('db.php');

//Security note
//Check if the current user is the author of the note to update

$id = $_POST['ID'];
$title = $_POST['Title'];

$q = $db->prepare('UPDATE notes SET Title = :title WHERE ID = :id');
$success = $q->execute(array('title' => $title, 'id' => $id));

if($success)
	echo 'Successfully updated note '.$id. ' with title "'.$title.'"';
else
	echo 'Failed to update note '.$id. ' with title "'.$title.'"';
?>