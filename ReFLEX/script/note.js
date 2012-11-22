
function AddNote(note) {
	//Check if note is already added
	if(Is_note_new(note))
	{
		AddNoteElement(note);
		Notes.push(note);
	}
	else {
		note.Object.animate({ left: GetNotePosition(note) }, 400);
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
	
	
	note.Object.css('left', GetNotePosition(note));
	
	if(note.Time > new Date().getTime() + 1000 * 3)
		note.Object.addClass('timecapsule');
		
	if(note.Favorite && note.Favorite > 0)
		note.Object.addClass('favorite');
	
	note.Object.click(function() { SelectNote(note); });
	$('#note-timeline').append(note.Object);
	
	DisplayRatioByHeight($(note.Object.find('.single-note-background').get(0)), 420/280);
	note.Object.Image.load(function() { note.Object.css('marginLeft', -(note.Object.Image.width()/2) + 'px') }); 
}

var noteGap = 50;
var NoteTimeline;
// Move post apart from each other
function SeparatePosts() {
	var space = Math.min(NoteTimeline.width() / Notes.length, noteGap);
	
	var start = new Date();
	var min = NoteTimeline.width() * 0.06;
	var max = NoteTimeline.width() * 0.94;
	
	var done = false;
	while(!done) {
		done = true;
		for(var i = 0; i < Notes.length; i++) {
			Notes[i].Object.css('zIndex', parseInt(Notes[i].Object.css('left')));
			for(var j = i + 1; j < Notes.length; j++) {
				var iLeft = parseInt(Notes[i].Object.css('left'));
				var jLeft = parseInt(Notes[j].Object.css('left'));
				if(Math.abs(iLeft - jLeft) < space) {
					var g = space - (iLeft - jLeft);
					done = false;
					if(Notes[i].Time > Notes[j].Time) {
						Notes[i].Object.css('left', clamp((iLeft + g/2)/NoteTimeline.width(), 0.06, 0.94) * 100 + '%');
						Notes[j].Object.css('left', clamp((jLeft - g/2)/NoteTimeline.width(), 0.06, 0.94) * 100 + '%');
					}
					else {
						Notes[i].Object.css('left', clamp((iLeft - g/2)/NoteTimeline.width(), 0.06, 0.94) * 100 + '%');
						Notes[j].Object.css('left', clamp((jLeft + g/2)/NoteTimeline.width(), 0.06, 0.94) * 100 + '%');
					}
				}
			}
		}
		//if(new Date().getTime() - start.getTime() > 1000)
			//break;
	}
	
	debug(new Date().getTime() - start.getTime());
}

function GetNotePosition(note) {
	var r = (note.Time - Timeline.Start) / (Timeline.End - Timeline.Start);
	r = 0.06 + r * 0.88;
	return (r * 100) + '%';
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

function LoadNewNote(start, end, id, finished) {
	
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
				Locked: (object[0].Time > new Date().getTime() - 1000 * 60 * 5),
				Length: object[0].Length
				});
				LoadNewNote(start, end, object[0].ID, finished);
		}
		else if(finished)
			finished();
			
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
			SetTimeline(Timeline.Start - msInDay, Timeline.End - msInDay, SeparatePosts);
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
			SetTimeline(Timeline.Start + msInDay, Timeline.End + msInDay, SeparatePosts);
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
		
		len = Math.max(len, 1000 * 60 * 60 * 12);
		
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
	SetTimeline(start, end, SeparatePosts);
}