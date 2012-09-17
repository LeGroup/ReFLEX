<?php
require_once('db.php');

// if(!isset($_POST['note_id'])) { _log('Note_id not set.'); die(); }

$new_note = new StdClass();

// _log('------------------------NEW NOTE----------------------------');
// _log('Photo size: ' . $_FILES['photo']['size']/1000 . " kilobytes");
// _log('Audio size: ' . $_FILES['voice']['size']/1000 . " kilobytes");
// _log('Photo error code: ' . $_FILES['photo']['error']);
// _log('Audio error code: ' . $_FILES['voice']['error']);


$new_note->Picture = "";
$new_note->Voice = "";
$new_note->ID = $_POST['note_id'];
$new_note->User = $_POST['user_id'];
$new_note->Title = isset($_POST['note_title']) ? $_POST['note_title'] : '';
$new_note->Time = time() * 1000;

$q = $db->prepare('SELECT id FROM notes WHERE id = "'.$new_note->ID.'"');
$q->execute();

if($q->rowCount() > 0)
{ die('Note already exists!'); }

$base='uploads';
$audio = $_FILES['voice']['tmp_name'];
$class_id = 'class';
$class_hash= md5($class_id);
$dir1=substr($class_hash, 0,2);

CreateDirectoryIfNotExist($base);
CreateDirectoryIfNotExist($base . '/' . $dir1);
CreateDirectoryIfNotExist($base . '/' . $dir1 . '/' . $class_id);

$directory = $base . '/' . $dir1 . '/' . $class_id . '/';

if (isset($_FILES['photo'])) {
    $picture = $_FILES['photo']['tmp_name'];
    $pic_name= $directory.$new_note->ID.'_pic.jpg';

	if(!move_uploaded_file($picture, $pic_name))
	{ _log('Uploading photo failed!'); }
	else
	{ $new_note->Picture = $pic_name; }
}
$aud_name = $directory.$new_note->ID.'_rec.mp3';
if(!move_uploaded_file($audio, $aud_name)){
	_log('Uploading audio failed!');
}
else { $new_note->Voice = $aud_name; }


//Insert a row in the database
$q = $db->prepare('INSERT INTO notes(ID, Time, Picture, Voice, Title, Student) VALUES(:id, :time, :picture, :voice, :title, :user)');
$result = $q->execute(array(
			'id' => $new_note->ID,
			'time' => $new_note->Time,
			'picture' => $new_note->Picture,
			'voice' => $new_note->Voice,
			'title' => $new_note->Title,
			'user' => $new_note->User));

if($result) {_log('Database row inserted successfully'); }
else { _log('Inserting database row failed!'); print_r($q->errorInfo()); }

//Return encoded results to javascript
echo json_encode($new_note);

fclose($log);

function CreateDirectoryIfNotExist($path) {
	if (!file_exists($path)) 
		mkdir($path);
}
?>
