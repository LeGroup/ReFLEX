<?php
require_once('db.php');

$return = new StdClass();

$return->Success = true;
$user = $_POST['Username'];
$email = $_POST['Email'];

//Insert a new row
$q = $db->prepare('INSERT INTO users(name, avatar, email) VALUES(:name, :avatar, :email)');
if(!$q->execute(array('name' => $user, 'avatar' => 'images/avatar.png', 'email' => $email)))
	$return->Success = false;

//Get the ID
$ID = $db->lastInsertId();
	
//Let's create hash from id and username
$hash = sha1($ID . $user);
	
//Create uri to the new user's page
$uri =  $_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'].$_SERVER['CONTEXT_PREFIX'].'?i='.$hash;
$return->Uri = $uri;

//Save the uri in the database
$q = $db->prepare('UPDATE users SET url_id = :url_id WHERE id = :id');
$q->execute(array('url_id' => $hash, 'id' => $ID));

//Send mail
//...except if you're using local server which doesn't support it.
if("cows" == "fly") {
	$subject = 'Your user account in ReFLEX.';
	$message = 'Hello ' . $user .
	"\nHere's a link to your personal user page: " . '<a href="'.$uri.'">Your user page</a>.';
	$headers = 'From: reflex@example.com' . "\r\n" .
	'X-Mailer: PHP/' . phpversion();

	if(!mail($email, $subject, $message, $headers))
		$return->Success = false;
}
	
echo json_encode($return);


?>