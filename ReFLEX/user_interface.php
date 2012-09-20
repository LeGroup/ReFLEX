<!-- User info -->
<div id="header">
	<h1 id="username-title"><?php echo $USER->username; ?></h1>
	<div id="avatar">
		<?php
		$avatar = file_exists('images/avatars/avatar_'.$USER->ID) ? 'images/avatars/avatar_'.$USER->ID.'.jpg' : 'images/avatars/avatar_placeholder.png';
		
		?>
		<img src="<?php echo $avatar; ?>" alt class="avatar" id="avatar-image"/>
		<div id="AvatarCameraContainer"><div id="AvatarCamera"></div></div>
		<div id="ava-countdown" style="width: 80px; height: 80px; background-color: rgba(0,0,0,0.4); position: absolute; top: 50%; left: 50%; margin: -40px; color: #fff; font-size: 50px; line-height: 80px; text-align: center"></div>
		<div id="ava-save" style="cursor: pointer; display: none; width: 100%; height: 50px; background-color: rgba(0,0,0,0.4); position: absolute; bottom: 0; color: #fff; line-height: 50px; text-align: center">Save picture</div>
		
	</div>
	<hr />
</div>
<!-- Video player and recorder -->
<div id="videos">
	<div id="video-player-wrapper">
		<div id="user-data" data-id="<?php echo $USER->ID; ?>" data-username="<?php echo $USER->username; ?>" style="display: none"></div>
		<h2 id="player-title" contentEditable></h2>
		<div id="video-player">
			<div id="video-player-ui">
				<!-- <div id="video-player-play"><img src="images/play.png" alt /></div> -->
				<audio controls>Your browser doesn't support HTML5 audio.</audio>
			</div>
		</div>
	</div>
	<div id="video-recorder-wrapper">
		<h2 id="recorder-title" contentEditable>My note</h2>
		<div id="video-recorder">
			
			<div id="TeamRecorder"></div>
			<div id="video-recorder-overlay-ui">
				<span class="recorder-ui video-off">What did I learn?</span>
				<div class="recorder-ui video-off recorder-initialized button" id="record-button-onvideo"><img src="images/record.png" alt /></div>
				<div class="recorder-ui recorder-finished button save-recorded-video" id="save-recorded-video">Drag your clip to the timeline</div>
				<div class="recorder-ui recorder-finished button" id="re-record-button-onvideo"><img src="images/record.png" alt /></div>
				<div class="recorder-ui record-on recorder-initialized" id="ilearned">I learned...</div>
				<div class="recorder-ui record-on" id="countdown">1</div>
				<div class="recorder-ui record-on" id="vumeters">
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
				</div>
			</div>
		</div>
		<div id="video-recorder-controls">
			<div id="recorder-controls-timeline" class="rfx-scrollbar">
				<div id="timeline-active" class="rfx-scrollbar-active">
					<div id="timeline-cursor" class="rfx-scrollbar-cursor"></div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Saved recordings show up here -->
<div id="notes">
	<div id="note-drag-area"></div>
	<div id="note-timeline">
		<div id="week-blocks"> </div>
	</div>
</div>
<div id="note-scroll" class="rfx-scrollbar"><div id="note-scroll-cursor" class="draggable rfx-scrollbar-cursor"></div></div>

<div id="note-zoom" class="rfx-scrollbar"><div id="note-zoom-cursor" class="draggable rfx-scrollbar-cursor"></div></div>