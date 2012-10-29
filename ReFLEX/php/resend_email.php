<?php
header('Access-Control-Allow-Origin: *'); 
require_once('db.php');

$return = new StdClass();
$return->Success = true;
$email = $_POST['email'];

$q = $db->prepare('SELECT id, name FROM users WHERE email = :email');
$q->execute(array('email' => $email));

$user = $q->fetch();

$hash = DoubleSaltedHash($user['id'] . $user['name'] . time());

$q = $db->prepare('UPDATE users SET url_id = :url WHERE id = :id');
$q->execute(array(
			'url' => $hash,
			'id' => $user['id']
		));

$link = SERVER_URL . '?i=' . $hash;

if(MAIL_ENABLED) {
	$subject = 'A forgotten user page url';
	$message = '<h3>Hello ' . $user['name'] . '</h3>'.
	"<p>Here's a link to your user page you requested: " . "<a href=\"".$link."\">Your user page</a>.</p>".
	'<p style="color: #565656;">Reflex</p>';
	
	if(!mail($email, $subject, $message, MAIL_HEADERS))
		$return->Success = false;
	else
		$return->MailSent = true;
}
else
	$return->Link = $link;

echo json_encode($return);

?>