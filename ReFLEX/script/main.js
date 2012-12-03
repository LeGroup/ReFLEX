var SERVER_URL = ''; //'http://reflex.aalto.fi/';
var PHP_LIB = 'php/'; //'http://reflex.aalto.fi/php/';
var User;
var SelectedNote;
var Notes = [];
var Wrapper;
var timelinewidth = 0.001;
var noteTimelineLeft = 0;
var zoomDragging;
var Zoom;
var weeksShown = 1.5;
var are_notes_draggable = false;
var localizedStrings;
var Language;
var ScrollSlider;
var ZoomSlider;
var TimelineSlider;
var Timeline = { }

var Languages = {
	"deutsch": "de-AT",
	"eesti": "et-ET",
	"english": "en-EN",
	"español": "es-ES",
	"français": "fr-FR",
	"עִבְרִית": "he-HE",
	"magyar": "hu-HU",
	"italiano": "it-IT",
	"lietuvių": "lt-LT",
	"nederlands": "nl-NL",
	"norsk": "no-NO",
	"português": "pt-PT",
	"slovenčina": "sk-SK",
	"suomi": "fi-FI",
	"türkçe": "tr-TR"
}

$(function() { Init(); });

//To enable drag'n drop in mobile devices?
$(document).bind('touchmove', function(e) { e.preventDefault(); }, false);

function Init() {
	localize();
	if(CheckBrowser()) {
		InitializeRegistrationInterface();
	}
	else
		OpenPage('browser');
}

function CheckBrowser() {
	debug("browser: " + JSON.stringify($.browser));
	if($.browser.msie) {
		var ver = parseInt($.browser.version.substr(0, 1));
		debug(ver);
		return ver >= 9;
	}
	else if($.browser.webkit) { return true; }
	else if($.browser.mozilla) { return true; }
	else if($.browser.opera) { return true; }
	return false;
}

function LogIn(email, pin) {
	getJson('login.php', { email: email, pin: pin }, function(object) {
		if(object.Success) {
			User = object;
			User.Email = email;
			User.Pin = pin;
			InitializeUserInterface();
		}
		else
			alert('Logging in failed. Check your email and PIN');
	});
}

function DisplayRatioByHeight(o, ratio) {
	if(ratio)
		o.attr('data-display-ratio', ratio);
	else
		o.attr('data-display-ratio', o.width() / o.height());		
		
	o.css('width', Math.ceil(o.height() * o.attr('data-display-ratio')) + "px"); 
	//$(window).resize(function() { o.css('width', Math.ceil(o.height() * o.attr('data-display-ratio')) + "px"); }); 
}

function InitializeUserInterface() {
	OpenPage('user');
	debug('User logged in. Displaying basic user interface.');
	$('.username').text(User.username);
	$('#user-page').show();
	$('#datepicker-calendar').datepicker({
		dayNames: [ i18n("Sunday"), i18n("Monday"), i18n("Tuesday"), i18n("Wednesday"), i18n("Thursday"), i18n("Friday"), i18n("Saturday") ], 
		dayNamesShort: [ i18n("Sun"), i18n("Mon"), i18n("Tue"), i18n("Wed"), i18n("Thu"), i18n("Fri"), i18n("Sat") ], 
		dayNamesMin: [ i18n("Su"), i18n("Mo"), i18n("Tu"), i18n("We"), i18n("Th"), i18n("Fr"), i18n("Sa") ], 
		monthNames: [ i18n("January"), i18n("February"), i18n("March"), i18n("April"), i18n("May"), i18n("June"), i18n("July"), i18n("August"), i18n("September"), i18n("October"), i18n("November"), i18n("December") ], 
		monthNamesShort: [ i18n("Jan"), i18n("Feb"), i18n("Mar"), i18n("Apr"), i18n("May"), i18n("Jun"), i18n("Jul"), i18n("Aug"), i18n("Sep"), i18n("Oct"), i18n("Nov"), i18n("Dec") ], 
		minDate: 1,
		firstDay: 1,
		onSelect: function(date, inst) {
			RecordedNote.Time = new Date(date).getTime();
			RECORDER.save_note();
		},
		});
		$('#timecapsule-datepicker > img').click(function() { $('#datepicker-calendar').datepicker('show'); });
	
	ScrollSlider = $('#note-scroll');
	ZoomSlider = $('#note-zoom');
	TimelineSlider = $('#recorder-controls-timeline');
	NoteTimeline = $('#note-timeline');
	InitRecorder();
	
	$('#toggle-settings').click(function() { $('#settings').toggle(200); });
	$('#privacy').click(function() { 
		if(SelectedNote.Private)
			MakePublic(SelectedNote); 
		else
			MakePrivate(SelectedNote);
	});
	
	
	$(window).resize(function() {
		$('.single-note-background').each(function() { $(this).css('marginLeft', -($(this).width()/2) + 'px'); });
	});
	
	
	Timeline.Start = GetLastMonday(new Date());
	Timeline.End = Timeline.Start + msInDay * 7 - 1;
	ZoomLevel = Levels.Week;
	SetTimeline(Timeline.Start, Timeline.End);
	
	//Default settings
	$('.slider').slider({
		
		max: 1,
		min: 0,
		step: 0.001,
		animate: 400,
		range: 'min'
	});
	
	//Specific
	
	TimelineSlider.slider({
		stop: playbackPositionScroll,
		disabled: true,
	});
	
	$('#zoom-buttons').buttonset();
	$('#today').button();
	
	$('#zoom-alltime').click(ShowAllNotes);
	$('#zoom-month').click(ShowNotesMonth);
	$('#zoom-week').click(ShowNotesWeek);
	$('#zoom-day').click(ShowNotesDay);
	$('#timeline-back').click(Back);
	$('#timeline-forward').click(Forward);
	$('#favorite').click(Favorite);
	$('#today').click(Today);
	$('#avatar-camera-trigger').click(AVA.action);
	
	getJson('avatar.php', { user: User.ID }, function (data) {
		debug(data);
		$('.avatar-image').attr('src', data);
	});
	
	$('.email').text(User.Email);
}

function GetLastMonday(date) {
	var dateTime = date.setHours(0,0,0,0);
	if(date.getDay() > 0)
		dateTime -= (date.getDay() - 1) * msInDay;
	else
		dateTime -= 6 * msInDay;
	return dateTime;
}


function InitializeRegistrationInterface() {
	OpenPage('register');
	
	var delimiter = '';
	for(lang in Languages) {
		var l = $('<a>');
		l.text(lang)
		.attr('href', '?lang=' + Languages[lang])
		.addClass('language');
		$('.languages').append(delimiter).append(l);
		delimiter = ' | ';
	}
	
	$('.pin-reset').click(ResetPin);
	$('.back-index').click(function() { OpenPage('register'); });
	$('#forgot-pin').click(function() { OpenPage('resend-mail'); });
	$('#newUserAdd').click(RegisterUser);
	$('#login-button').click(function() { LogIn($('#login-email').val(), $('#login-pass').val()); });
}

function SetTimeline(start, end, finished) {
	Timeline.Start = start;
	Timeline.End = end;
	
	
	var start = new Date();
	start.setTime(Timeline.Start);
	$('#timeline-start').text(dateFormat(start.getTime()));	
	
	var end = new Date();
	end.setTime(Timeline.End);
	$('#timeline-end').text(dateFormat(end.getTime()));
	Timeline.Timespan = Timeline.End - Timeline.Start;
	
	EmptyNotes(Timeline.Start, Timeline.End);
	LoadNewNote(Timeline.Start, Timeline.End, false, finished);
}

function EmptyNotes(start, end) {
	for(i = 0; i < Notes.length; i++) {
		if(Notes[i].Time < start || Notes[i].Time >= end) {
			
			if(Notes[i].Object)
				Notes[i].Object.remove();
			Notes.splice(i, 1);
			i--;
		}
	}
}

function OpenPage(id) {
	SelectedNote = false;
	if(RECORDER.CurrentState) {
		RECORDER.isCameraAccepted = false;
		RECORDER.prepare_recorder();
	}
	$('.page').hide();
	$('#' + id + '-page').fadeIn(600);
}

function ResetPin() {
	var email = $('#resetEmail').val();
	if(!email || email.length == 0)
		email = User.email;
	getJson('resetPin.php', { email: email}, function(object) {
		if(object.Success) {
			alert(i18n('Your pin has been reset. You will receive new pin code shortly.'));
			$('#resetEmail').val('');
		}
		else if(object.EmailNotFound)
			alert(i18n("Email address not found. Maybe you haven't registered yet?"));
		else
			alert(i18n("Something went wrong. Please try again."));
	});
}

function RegisterUser() {
	if(ValidateUserRegistration()) {
		getJson('user_registration.php', { 
		Username: $('#newUsername').val(), 
		Email: $('#newUserEmail').val(),
		Title: i18n('Your user account in ReFLEX'),
		Greeting: i18n('Hello'),
		HeresLink: i18n("Here's a link to your personal user page:"),
		YourUserPage: i18n('Your user page'),
		PinCode: i18n("Here's also your PIN code you need to open private notes:")
		}, function(object) {
			$('#newUserAdd').hide();
			// $('#newUserEmail').hide();
			if(object.Success) {
				$('#register-before').hide();
				$('.register-complete').show(); 
			}
			else {
				debug('User Registration failed: ' + object.Message);
				$('#register-before').hide();
				$('.register-failed').show();  
			}
		});
	}
	else
		alert('Your name and email address cannot be empty!');
}

function ValidateUserRegistration() {
	return !($('#newUsername').val() == '' || $('#newUserEmail').val() == '');
}

function debug(msg) { 
	// var d = new Date();
	// var hh = d.getHours();
	// var mm = d.getMinutes();
	// var ss = d.getSeconds();
	// var ms = d.getMilliseconds();
	// if (hh < 10) {hh = "0"+hh;}
	// if (mm < 10) {mm = "0"+mm;}
	// if (ss < 10) {ss = "0"+ss;}
	// if (ms < 10) {ms = "0"+ms;}
	// if (ms < 100) {ms = "0"+ms;}
	// console.log(hh + ':' + mm + ':' + ss + '.' + ms + '	' + msg); 
	console.log(msg);
} 

function playbackPositionScroll() {
	RECORDER.movePlaybackToPosition(TimelineSlider.slider('option', 'value'));
}


function weekBlockWidths(weekCount) {
	$('#note-timeline').css('width', '100%');
	$('#day-blocks').width((Math.ceil(Notebar.DayCount)/Notebar.DayCount) * 100 + '%');
	$('#day-blocks > div').width((1/$('#day-blocks > div').length * 100) + "%");
	$('#week-blocks').width(Math.ceil(Notebar.WeekCount)/Notebar.WeekCount * 100 + '%');
	$('#week-blocks > div').width((1/$('#week-blocks > div').length * 100) + "%");
	$('#month-blocks').width(Notebar.MonthTime/Notebar.Timespan * 100 + '%');
}

var months = [ i18n('January'), i18n('February'), i18n('March'), i18n('April'), i18n('May'), i18n('June'), i18n('July'), i18n('August'), i18n('September'), i18n('October'), i18n('November'), i18n('December') ];

function dateFormat(date) { date = new Date(date); return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear(); }
function monthFormat(date) { return i18n(months[new Date(date).getMonth()]); }
function datetimeFormat(date) { 
	var d = new Date();
	d.setTime(date);
	date = d;
	var mins = date.getMinutes();
	var hours = date.getHours();
	if(mins < 10) { mins = '0' + mins; }
	if(hours < 10) { hours = '0' + hours; }
	return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + hours + ':' + mins; 
}

function weekDay(date) { date = new Date(date); return date.getDay(); }
function daysInMonth(month,year) { return new Date(year, month + 1, 0).getDate(); }
function monthInTime(month, year) { return new Date(year, month + 2, 0).getTime() - new Date(year, month + 1, 0).getTime(); }

var Notebar;
var msInWeeks = 1000 * 60 * 60 * 24 * 7;
var msInDay = 1000 * 60 * 60 * 24;

function nextDay(t) {
	t = new Date(t);
	return new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1).getTime();
}

function nextMonth(t) {
	t = new Date(t);
	return new Date(t.getFullYear(), t.getMonth() + 1, t.getDate()).getTime();
}

function i18n(str, lang){
    if (!localizedStrings || !str) return str;
	
    var locstr = localizedStrings[str];
	
	if (locstr == null || locstr == "") {
		debug('Localization error: "' + str + '" missing in ' + lang);
        locstr = '[translation missing: ' + str + ']';
    }
    return locstr;
}


var URL_VARS = { };
var CONTROLLER = { };
CONTROLLER.getLocale = function() { return null; }
function guess_language(){
	var get = getUrlVars();
	if(get['lang']) 
		return get['lang'];
	
	if(typeof(Storage) !== 'undefined') {
		if(localStorage.Language) {
			return localStorage.Language;
		}
	}
	
    return URL_VARS.locale || CONTROLLER.getLocale() || navigator.language || navigator.userLanguage;
}


function localize(){
    // The idea is that some html-entities are marked for translation (class 'i18n'). The content text of these html-entities (= english text) is used as a key in translation dict (localizedStrings) and it is checked for possible translation available and replaced if available. 
    // This is enough for us, but would not scale for larger program. (Homonyms in english would translate identically for differing purposes.)

    // Ensure language code is in the format aa-AA:
	// var lang = OPTIONS.language.replace(/_/, '-').toLowerCase();
	
	Language = guess_language();
	localStorage.Language = Language;
	
	lang = Language;
	
	if (lang.length > 3) {
		lang = lang.substring(0, 3) + lang.substring(3).toUpperCase();
	} else if (lang.length == 2) {
	    lang = lang+'-'+lang.toUpperCase();   
	}
	
	//if (lang=='en-EN') return;
	
    jQuery.ajax("i18n/localized_"+lang+".js", {
        dataType: "json",
        isLocal: true,     
        error: function(jqXHR, textStatus, errorThrown){
            debug('i18n failed:jqXHR='+jqXHR+' textStatus:'+textStatus+' errorThrown:'+errorThrown);
            return jqXHR;
        },
        complete: function(data) {
            // Change all of the static strings in index.html
            var place;
            localizedStrings=$.parseJSON(data.responseText);
			try {
				debug(''+Object.keys(localizedStrings).length+' translation keys available');
            }
			catch(error) { }
			
			$('.i18n').each(function (i) {
                $(this).html(i18n($(this).html(), lang));
            })
			
            $('.i18n_title').each(function (i) {
                $(this).attr('title', i18n($(this).attr('title'), lang));
            })
			
            $('.i18n_placeholder').each(function (i) {
                $(this).attr('placeholder', i18n($(this).attr('placeholder'), lang));
            })
			
            $('.i18n_value').each(function (i) {
                $(this).attr('value', i18n($(this).attr('value'), lang));
            })
			
            $('input.topic').each(function () {
            if ($(this).val() == 'Enter topic') { 
                $(this).val(i18n('Enter topic'), lang);
            }
            });
            }
        }           
    );
}

function getJson(url, post, finished, onError, dontDebugRespond) {
	debug('Start json request ' + PHP_LIB + url);
	post.Language = Language;
	if(User) {
		post.email = User.Email;
		post.pin = User.Pin;
	}
	$.ajax({
		type: 'POST',
		url: PHP_LIB + url,
		data: post,
		dataType: 'json',
		success: function (data) {
	
			if(!dontDebugRespond) 
				debug('Requested ' + url + ', PHP responds: ' + JSON.stringify(data));
			
			finished(data);
		}
	});
}

// Useful
// Get $_GET[]-variables from url
function getUrlVars(url) {
	if(!url)
		url = window.location.href;
	
	url = url.split('?');
	url.splice(0,1);
	
	var vars = url.join().split("&");
	var result = [];
	for(v in vars) {
		vars[v] = vars[v].split("=");
		result[vars[v][0]] = vars[v][1];
	}
	return result;
}

// Add zeros in front of numbers if needed
// 3:2.4 -> 03:02.004
function zeronify(n, length) {
	n = String(n);
	if(!length)
		length = 2;	
	while(n.length < length) {
		n = '0' + n;
	}
	return n;
}

// Clamp
// Restrict value between minimum and maximum
function clamp(val, min, max)
{ return Math.max(min, Math.min(val, max)); }