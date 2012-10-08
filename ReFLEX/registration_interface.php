<p class="register" style="display: block; text-align: center">
	<input type="text" id="newUsername" class="i18n_placeholder" placeholder="Your username" value="" /><br /> 
	<input type="text" id="newUserEmail" class="i18n_placeholder" placeholder="Your email address" value="" /><br /> 
	<a id="newUserAdd" class="button i18n">Add new user</a>
</p>
<p class="register-complete" style="display: none"></p>
<?php
$q = $db->prepare('SELECT id, name, url_id FROM users');
$q->execute();

while($row = $q->fetch()) {
	echo '<p><a href="?i='.$row['url_id'].'">'.$row['id'] . ' - ' .$row['name'] . '</a></p>';
	
}

?>