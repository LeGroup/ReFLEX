<?php
$id = isset($_POST['user']) ? $_POST['user'] : -1;
if(file_exists('../images/avatars/avatar_'.$id.'.jpg'))
	echo json_encode('images/avatars/avatar_'.$id.'.jpg');
else
	echo json_encode('images/avatar/avatar_placeholder.png');
?>
