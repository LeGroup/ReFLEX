<?php 
	$log = fopen("log/log.txt", 'a');
	require_once('php/db.php'); 
?>
<!DOCTYPE html>
<html lang="fi">
<head>
	<title>ReFLEX</title>
	<meta charset="utf-8">
	<link rel="stylesheet" type="text/css" href="css/style.css" />
	<link rel="stylesheet" type="text/css" href="css/dot-luv/jquery-ui-1.9.0.custom.min.css" />
	<script src="script/jquery-1.8.2.js" type="text/javascript"></script>
	<script src="script/jquery-ui-1.9.0.custom.min.js" type="text/javascript"></script>
	<script src="script/jquery.ui.touch-punch.min.js" type="text/javascript"></script>
	<script src="script/main.js" type="text/javascript"></script>
	<script src="script/swfobject.js" type="text/javascript"></script>
	<script src="script/recorder.js" type="text/javascript"></script>
	<script src="script/avatarCamera.js" type="text/javascript"></script>
</head>
<body>
	<div id="wrapper">
		<?php 
			if(isset($_GET['i']))
			{
				$q = $db->prepare('SELECT * FROM users WHERE url_id = :id');
				$id = $_GET['i'];
				$q->execute(array('id' => $id));
				
				if($q->rowCount() == 1) {
					$result = $q->fetch();
					$USER = new StdClass();
					$USER->ID = $result['id'];
					$USER->username = $result['name'];
					$USER->registered = $result['date'];
					require_once('user_interface.php');
				}
			}
			else
				require_once('registration_interface.php');
		?>
	</div>
</body>
</html>