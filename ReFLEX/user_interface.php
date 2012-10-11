<!-- User info -->
	<h1 id="username-title"><?php echo $USER->username; ?></h1>
	<div id="user-data" data-id="<?php echo $USER->ID; ?>" data-username="<?php echo $USER->username; ?>" style="display: none"></div>
	<div id="left">
		<div id="avatar">
			<?php $avatar = file_exists('images/avatars/avatar_'.$USER->ID.'.jpg') ? 'images/avatars/avatar_'.$USER->ID.'.jpg' : 'images/avatars/avatar_placeholder.png'; ?>
			<img src="<?php echo $avatar; ?>" alt class="avatar" id="avatar-image"/>
			<div id="AvatarCameraContainer"><div id="AvatarCamera"></div></div>
			<div id="ava-countdown"></div>
			<div id="ava-save">Save picture</div>
		</div>
		<p><a id="pin-reset" class="button i18n">Reset your PIN</a></p>
		<div id="note-options">
		<p><input type="button" id="privacy" class="i18n_value" value="Make private" /></p>
		</div>
	</div>
<!-- Video player and recorder -->
<div id="videos">
	<div id="video-recorder-wrapper">
		<div id="video-recorder">
			
			<div id="TeamRecorder"></div>
			<div id="video-recorder-overlay-ui">
				<span class="recorder-ui video-off i18n" id="what-did-i-learn">What did I learn?</span>
				<div class="recorder-ui video-off recorder-initialized note-sealed" id="record-init-background"></div>
				<div class="recorder-ui video-off recorder-initialized button" id="record-button-onvideo"><img src="images/record.png" alt /></div>
				<div class="recorder-ui recorder-finished button save-recorded-video i18n" id="save-recorded-video">Drag your clip to the timeline</div>
				<div class="recorder-ui recorder-finished save-recorded-video" id="record-video-drag"></div>
				<div class="recorder-ui recorder-finished button" id="re-record-button-onvideo"><img src="images/record.png" alt /></div>
				<div class="recorder-ui note-selected note-playback-finished button" id="play-button-onvideo"><img src="images/play.png" alt /></div>
				<div class="recorder-ui note-playing button" id="stop-button-onvideo"><img src="images/stop.png" alt /></div>
				<div class="recorder-ui record-on i18n" id="ilearned">I learned...</div>
				<div class="recorder-ui record-on" id="countdown">...</div>
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
				
				<div class="pincode recorder-ui note-sealed">
					<div>
						<h2><span class="i18n">This note is private!</span><br /><span class="i18n">Enter your pin code to open it</span></h2>
						<input type="text" maxlength="4" />
					</div>
				</div>
			</div>
		</div>
		<div id="video-recorder-controls">
			<div id="record-button" class="button i18n_title" title="Record a new note"></div>
			<div id="recorder-controls-timeline" class="slider"></div>
		</div>
	</div>
</div>
	<div style="width: 100%; clear:both"></div>

<!-- Saved recordings show up here -->
<div id="notes">
		<div id="note-background"></div>
	<div id="note-drag-area"></div>
	<!-- <div id="prev-week" class="button"></div> -->
	<!-- <div id="next-week" class="button"></div> -->
	<div id="note-timeline-wrapper">
		<div id="note-timeline">
			<div id="day-blocks"> </div>
			<div id="week-blocks"> </div>
			<div id="month-blocks"> </div>
			<div id="now-indicator"><div class="i18n">Now</div></div>
		</div>
	</div>
</div>
<div id="note-scroll" class="slider"></div>
<div id="note-zoom" class="slider"></div>
<div id="zoom-title">
	<span id="zoom-title-months" class="i18n">Months</span>
	<span id="zoom-title-weeks" class="i18n">Weeks</span>
	<span id="zoom-title-days" class="i18n">Days</span>
</div>