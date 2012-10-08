<?php
require_once('db.php');
$q = $db->prepare('SELECT ID, Time, Student, IF(Private = "yes", "images/private.png", Picture) as Thumb, Private FROM notes WHERE Student = '.$_POST['User'].' ORDER BY time');
$q->execute();
echo json_encode($q->fetchAll());
?>