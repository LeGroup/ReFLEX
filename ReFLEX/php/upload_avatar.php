<?php
header('Access-Control-Allow-Origin: *'); 
$o = new StdClass();
$o->User = $_POST['user_id'];
$o->PhotoTmp = $_FILES['photo']['tmp_name'];
$o->Photo = 'images/avatars/avatar_'.$o->User.'.jpg';
$o->Success = move_uploaded_file($o->PhotoTmp, "../".$o->Photo);
unset($o->PhotoTmp);
echo json_encode($o);
?>

