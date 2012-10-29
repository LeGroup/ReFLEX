<?php
header('Access-Control-Allow-Origin: *'); 
require_once('db.php');

$return = new StdClass();
$return->Success = false;
$q = $db->prepare('SELECT url_id FROM users WHERE email = :email');
$q->execute(array('email', $_POST['email']));

$uri = 'http://reflex.aalto.fi/?i='.$q->fetchColumn();;

$return->asd = $_SERVER['WEBSITE_SALT'];
echo json_encode($return);

if(MAIL_ENABLED && false) {
	$subject = 'A forgotten user page url';
	$message = '<h3>Hello ' . $user . '</h3>'.
	"<p>Here's a link to your user page you requested: " . "<a href=\"".$uri."\">Your user page</a>.</p>".
	'<p style="color: #565656;">Reflex</p>';
	
	if(!mail($email, $subject, $message, MAIL_HEADERS))
		$return->Success = false;
	else
		$return->MailSent = true;
}

echo json_encode($return);

?>