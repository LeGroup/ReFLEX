<?php
$db = new PDO('mysql:dbname=reflex;host=127.0.0.1', 'root', '');
$q = $db->prepare('SELECT * FROM notes ORDER BY time');
$q->execute();
echo json_encode($q->fetchAll());
?>