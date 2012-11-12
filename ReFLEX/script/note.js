
function AddNote(note) {
	//Check if note is already added
	if(Is_note_new(note))
	{
		AddNoteElement(note);
		Notes.push(note);
	}
	else {
		note.Object.animate({ left: ((note.Time - Timeline.Start) / (Timeline.End - Timeline.Start) * 100) + '%' }, 400);
	}
}

function UpdateAllNotePositions() {
	for(var i = 0; i < Notes.length; i++) {
		UpdateNotePosition(Notes[i]);
	}
}

function UpdateNotePosition(note) {
	// Notebar.PositionElement(note.Object, note.Time);
}

var verticalOffset = 0;

function CreateNoteElement(thumb) {
	var img = $('<img>');
	var noteBackground = $('<div class="single-note-background">');
	var o = $('<div class="note button">');
	
	if(thumb)
		img.attr('src', SERVER_URL + thumb).attr('alt', '');
	
	o.css({ 
		marginTop: Math.random() * 2 * verticalOffset - verticalOffset
	});
	
	noteBackground.append($('<div class="single-note-triangle">'));
	noteBackground.append(img);
	noteBackground.append($('<div class="note-overlay"><div></div></div>'));
	o.append(noteBackground);
	o.Image = img;
	return o;
}

function Favorite() {
	if(SelectedNote) {
		if(SelectedNote.Favorite && SelectedNote.Favorite > 0)
			SelectedNote.Favorite = false;
		else
			SelectedNote.Favorite = true;
			
			console.log(SelectedNote);
		UpdateNote(SelectedNote);
	}
}

function AddNoteElement(note) {
	
	if(note.Favorite && note.Favorite > 0)
		$('#favorite').addClass('selected');
	else
		$('#favorite').removeClass('selected');
	
	if(!note.Thumb)
		note.Thumb = note.Picture;
		
	note.Object = CreateNoteElement(note.Thumb);
	note.Object.css('opacity', 0).animate({ opacity: 1 }, 200);
	note.Object.attr('title', datetimeFormat(note.Time));
	note.Object.css('left', ((note.Time - Timeline.Start) / (Timeline.End - Timeline.Start) * 100) + '%');
	
	if(note.Time > new Date().getTime() + 1000 * 3)
		note.Object.addClass('timecapsule');
		
	if(note.Favorite && note.Favorite > 0)
		note.Object.addClass('favorite');
	
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
	note.Object.remove();
	delete note.Object;
	getJson('update.php', { Note: JSON.stringify(note) }, function(object) {
		debug('Update returns');
		AddNoteElement(note);
	});
}

function Is_note_new(note) {
	for(var i = 0; i < Notes.length; i++) {
		if(note.ID == Notes[i].ID) {
			note.Object = Notes[i].Object;
			Notes.splice(i, 1);
			Notes.push(note);
			return false;
		}
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
	
	
	if(RECORDER.CurrentState == RECORDER.UiStates.Playing)
		RECORDER.stop_playing();
	
	RECORDER.recording_timer(0, note.Length);
	
	SelectedNote = note;
	debug('Selected a note');
	
	OpenNote(SelectedNote);
}

function flashred(o, times) {
	o.animate({ borderColor: 'rgba(255, 0, 0, 1)' }, 400, function() { 
		o.animate({ borderColor: 'rgba(255,255,255,0.1)' }, 400, function() { 
			if(times - 1 > 0)
				flashred(o, times - 1); 
		}); 
	});
}

function OpenNote(note) {
	
	if(note.Favorite && note.Favorite > 0)
		$('#favorite').addClass('selected');
	else
		$('#favorite').removeClass('selected');
	
	RECORDER.loadNote(note, $('#pin-field').val());
}

function LoadNotes() {
	debug('Preparing to load notes from user ' + User.ID + '.');
	getJson('loadNoteWithinTimespan.php', { User: User.ID }, function(object) {
		//Notebar need to be initialized before any notes are added
		//However we need to know the date of the first note in order to set notebar's timespan
		var start = new Date();
		var end = new Date();
		
		//If there are notes, set the beginning of the notebar's timespan to the date of the first note.
		if(object.length > 0) {
			start = new Date().getTime() > object[0].Time ? object[0].Time : new Date().getTime();
			end = new Date().getTime() > object[object.length - 1].Time ? new Date().getTime() : object[object.length - 1].Time;
		}
		
		
		//Add notes
		debug('Found ' + object.length + ' notes.');
		for(var i = 0; i < object.length; i++) {
			AddNote({ 
				ID: object[i].ID, 
				Time: object[i].Time, 
				Thumb: object[i].Picture, 
				Student: object[i].Student, 
				Locked: (object[i].Time > new Date().getTime()),
				Length: object[0].Length
			});
		}
		
		//If there are already notes, select the most recent.
		if(object.length > 0)
			SelectNote(Notes[Notes.length - 1]);
	}, false, true);
}

function LoadNewNote(start, end, id) {
	
	if(!id) { id = 0; }
	
	getJson('loadNoteWithinTimespan.php', { 
		user: User.ID, 
		start: start, 
		end: end,  
		id: id
		}, function(object) {
		
		if(object.length > 0) {
			AddNote({
				ID: object[0].ID, 
				Time: object[0].Time, 
				Thumb: object[0].Thumb, 
				Student: object[0].Student, 
				Favorite: object[0].Favorite,
				Locked: (object[0].Time > new Date().getTime()),
				Length: object[0].Length
				});
				LoadNewNote(start, end, object[0].ID);
		}
		}, false, true);
}


var Levels = {
	Day: 1,
	Week: 2,
	Month: 3,
	AllTime: 4
}
var ZoomLevel;


function Back() {
	switch(ZoomLevel) {
		case Levels.Day: 
			SetTimeline(Timeline.Start - msInDay, Timeline.End - msInDay);
			break;		
			
			case Levels.Week: 
			SetTimeline(Timeline.Start - msInDay * 7, Timeline.End - msInDay * 7);
			break;		
			
			case Levels.Month: 
			var s = new Date();
			s.setTime(Timeline.Start);
			
			s.setDate(0);
			Timeline.End = s.getTime();
			
			s.setDate(1);
			Timeline.Start = s.getTime();
			
			SetTimeline(Timeline.Start, Timeline.End);
			break;
	}
}

function Forward() {
	switch(ZoomLevel) {
		case Levels.Day: 
			SetTimeline(Timeline.Start + msInDay, Timeline.End + msInDay);
			break;		
			
			case Levels.Week: 
			SetTimeline(Timeline.Start + msInDay * 7, Timeline.End + msInDay * 7);
			break;		
			
			case Levels.Month: 
			var s = new Date();
			s.setTime(Timeline.Start);
			
			s.setMonth(s.getMonth() + 1);
			s.setDate(1);
			Timeline.Start = s.getTime();
			
			s.setMonth(s.getMonth() + 1);
			s.setDate(0);
			Timeline.End = s.getTime();
			
			SetTimeline(Timeline.Start, Timeline.End);
			break;
	}
}

function Today() {
	SelectedNote = false;
	
	switch(ZoomLevel) {
		case Levels.Day: 
			ShowNotesDay();
		break;		
		
		case Levels.Week: 
			ShowNotesWeek();
		break;		
		
		case Levels.Month: 
			ShowNotesMonth();
		break;
	}
}

function ShowAllNotes() {
	ZoomLevel = Levels.AllTime;
	getJson('noteTimelineInfo.php', { user: User.ID }, function(object) {
		var len = Math.round((object[0].Max - object[0].Min) * 0.06);
		SetTimeline(Number(object[0].Min) - Number(len), Number(object[0].Max) + Number(len));
	});
}

function ShowNotesMonth() {
	ZoomLevel = Levels.Month;
	var n = new Date();
	
	if(SelectedNote) 
		n.setTime(SelectedNote.Time);
	
	n.setDate(1);
	start = n.getTime();
	
	n.setMonth(n.getMonth() + 1);
	n.setDate(0);
	
	end = n.getTime();
	SetTimeline(start, end);
}

function ShowNotesWeek() {
	ZoomLevel = Levels.Week;
	var n = new Date();
	
	if(SelectedNote) 
		n.setTime(SelectedNote.Time);
	
	n = GetLastMonday(n);
	start = n;
	
	end = n + msInDay * 7 - 1;
	SetTimeline(start, end);
}

function ShowNotesDay() {
	ZoomLevel = Levels.Day;
	var n = new Date();
	
	if(SelectedNote) 
		n.setTime(SelectedNote.Time);
	
	n.setHours(0,0,0,0);
	start = n.getTime();
	

	end = n.getTime() + msInDay;
	SetTimeline(start, end);
}