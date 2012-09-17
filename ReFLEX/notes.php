<?php
require_once('db.php');
$q = $db->prepare('SELECT * FROM notes WHERE Student = '.$_POST['User'].' ORDER BY time');
$q->execute();
echo json_encode($q->fetchAll());
?>