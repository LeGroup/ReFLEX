
// noteObject: { Day: 1, Hour: 15, Image: 'images/Desert.jpg', Voice: 'path', Position: (Math.random()), Object: outerHTML }
// Missing: some link to the recording for opening the video
// Day and hour need to be saved as a date
function AddNote(note) {
	//Check if note is already added
	if(Is_note_new(note))
	{
		AddNoteElement(note);
		Notes.push(note);
		debug('Added a note. Notes.length = ' + Notes.length);
	}
	else
		debug('Note is already added!');
}

function UpdateAllNotePositions() {
	for(var i = 0; i < Notes.length; i++) {
		UpdateNotePosition(Notes[i]);
	}
}

function UpdateNotePosition(note) {
	note.Object.css('left', Notebar.GetRatio(note.Time) * 100 + '%');
}

var verticalOffset = 0;

function CreateNoteElement(thumb, color) {
	var img = $('<img>');
	var noteBackground = $('<div class="single-note-background">');
	var o = $('<div class="note button">');
	
	if(thumb)
		img.attr('src', SERVER_URL + thumb).attr('alt', '');
	
	
	o.css({ 
		marginTop: Math.random() * 2 * verticalOffset - verticalOffset,
		backgroundColor: color
	});
	
	noteBackground.append($('<div class="single-note-triangle">'));
	noteBackground.append(img);
	o.append(noteBackground);
	o.Image = img;
	return o;
}

function AddNoteElement(note) {
	
	if(!note.Color)
		note.Color = 'rgba(244,244,244,1)';
	
	note.Object = CreateNoteElement(note.Thumb, note.Color);
	
	note.Object.attr('title', datetimeFormat(note.Time));
	note.Object.css('left', Notebar.GetRatio(note.Time) * 100 + '%');
	
	
	if(are_notes_draggable) {
		note.Object.draggable({ 
			axis: 'x',
			containment: 'parent',
			snap: '#now-indicator',
			snapMode: 'inner',
			snapTolerance: 15,
			zIndex: 9999,
			start: function() {
				$(this).data('noclick', true);
			},
			stop: function(e, ui) { 
				note.Time = Notebar.GetTime(ui.offset.left);
				note.Object.attr('title', datetimeFormat(note.Time));
				UpdateNote(note);
			}
		});
	}
	note.Object.click(function() { SelectNote(note); });
	$('#note-timeline').append(note.Object);
	
	DisplayRatioByHeight($(note.Object.find('.single-note-background').get(0)), 420/280);
	note.Object.Image.load(function() { note.Object.css('marginLeft', -(note.Object.Image.width()/2) + 'px') }); 
}

function UpdateNote(note) {
	//JSON.stringify doesn't like the Object property as it's a jquery object.
	//It needs to be temporarily removed before stringification 
	var obj = note.Object;
	note.Object.remove();
	delete note.Object;
	getJson('update.php', { Note: JSON.stringify(note) }, function(object) {
		if(!object.Private)
			note.Thumb = object.Picture;
		AddNoteElement(note);
	});
}

function Is_note_new(note) {
	for(var i = 0; i < Notes.length; i++) {
		if(note.ID == Notes[i].ID) 
			return false;
	}
	return true;
}


function SelectNote(note) {
	//Camera has be accepted before doing any actions in recorder screen
	if(!RECORDER.isCameraAccepted)
		return; 
		
	//Highlighting
	$('.selected').removeClass('selected');
	note.Object.addClass('selected');
	

		$('#video-recorder').css('borderColor', note.Color);
	
	if(RECORDER.CurrentState == RECORDER.UiStates.Playing)
		RECORDER.stop_playing();
	
	RECORDER.recording_timer(0);
	
	SelectedNote = note;
	debug('Selected a note');
	if(SelectedNote.Locked) {
		UIChangeState(RECORDER.UiStates.NoteTimeSealed);
		$('#timecapsule-date').text(dateFormat(new Date().setTime(SelectedNote.Time)));
	}
	else if(SelectedNote.Private) {
		$('#privacy').val(i18n('Make public'));
		UIChangeState(RECORDER.UiStates.NoteSealed);
	} else {
		$('#privacy').val(i18n('Make private'));
		OpenNote(SelectedNote);
	}
}

function OpenNote(note) {
	RECORDER.loadNote(note, $('#pin-field').val());
}

function LoadNotes() {
	debug('Preparing to load notes from user ' + User.ID + '.');
	getJson('notes.php', { User: User.ID }, function(object) {
		//Notebar need to be initialized before any notes are added
		//However we need to know the date of the first note in order to set notebar's timespan
		var start = new Date();
		var end = new Date();
		
		//If there are notes, set the beginning of the notebar's timespan to the date of the first note.
		if(object.length > 0) {
			start = new Date().getTime() > object[0].Time ? object[0].Time : new Date().getTime();
			end = new Date().getTime() > object[object.length - 1].Time ? new Date().getTime() : object[object.length - 1].Time;
		}
		initNotebar(start, end);
		
		//Add notes
		debug('Found ' + object.length + ' notes.');
		for(var i = 0; i < object.length; i++) {
			
			AddNote({ 
				ID: object[i].ID, 
				Time: object[i].Time, 
				Thumb: object[i].Thumb, 
				Student: object[i].Student, 
				Private: (object[i].Private == 'yes'),
				Color: object[i].Color,
				Locked: (object[i].Time > new Date().getTime()) 
			});
			debug(Notes[Notes.length - 1].Thumb);
		}
		
		//If there are already notes, select the most recent.
		if(object.length > 0)
			SelectNote(Notes[Notes.length - 1]);
		InitLayout();
	}, false, true);
}