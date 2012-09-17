<!-- User info -->
<div id="header">
	<h1 id="username-title"><?php echo $USER->username; ?></h1>
	<img src="<?php echo $USER->avatar; ?>" alt class="avatar" />
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
		<h2 id="recorder-title" contentEditable></h2>
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