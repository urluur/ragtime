function Base64ToSmfPlayer() {
	// base64 to midi data
	// var smfDataz = JZZ.lib.fromBase64(smfDatazBase64);
	// var rcvSmf = JZZ.MIDI.SMF(smfDataz);

	// generateSmfPlayer(rcvSmf);
	// var b64 = midiDataToBase64(rcvSmf);
	// midiSessionGenerateFile(recordingName + '.mid', smfDatazBase64);
}

/**
 * Asks you to enter a value with a message
 * Checks value with slovene paragraph regex, prompts until correct input
 * @param {string} message - Prints out in a prompt
 * @param {string} value - Variable that is printed alongside a message (e.g. current name)
 * @returns {string} - RegEx matching user input
 */
function promptAndReturnString(message, value = '') {
	let regex = /^[a-zA-Z0-9_čšćđžČŠĆĐŽ]{1,10}( ?[a-zA-Z0-9_čšćđžČŠĆĐŽ]{1,10}){0,3}$/;
	do {
		var answer = prompt(message, value);
	} while (!answer.match(regex));
	if (answer === null || answer == '') {
		return false;
	} else {
		return answer;
	}
}

/**
 * Sets a name for a recording
 * @returns {string} - Your final name for a recording
 */
function midiSessionHasName() {
	if (!midiSessionName) {
		midiSessionName = promptAndReturnString('Name your recording');
	}
	return midiSessionName;
}

/**
 * Appends new recording to Recordings list
 * @param {string} author - Name of the user that started recording
 * @param {string} name - Recording's name (prompted earlier)
 * @param {string} b64dataz - Name of the file on server (needed for download URI)
 */
function addToRecordingsList(author, name, b64dataz) {
	var itemName = author + ' - ' + name;

	var uri = 'data:audio/midi;base64,' + b64dataz; // data URI
	$("#recordingsList").append('<a data-recording-author="' + author + '" data-recording-name="' + name + '" class="list-group-item list-group-item-action p-2 mb-2" data-toggle="list" href="' + uri + '">' + itemName + '</a>');
	// console.log(author, name, b64dataz);
};

/**
 * Adds new player
 * TODO: check all player's names in class
 * TODO: receive new player's name and instrument
 * @param {string} playerName - New player's name
 * @returns {boolean} True on success | False on fail
 */
function addDynamicPlayerHtml(playerName) {
	console.log('inside function: ' + arguments.callee.name);

	if (playerName == myName) {
		return false;
	}

	var newPlayerHtml = `

	<div id="remotePlayerDynamic" data-participant-name="` + playerName + `" class="container-fluid p-3">
		<div id="remotePlayerStatusBar" class="row rounded-top bg-secondary text-white">
			<div class="col">
				<button type="button" class="btn btn-sm btn-secondary">
					<span id="playerName">` + decodeURI(playerName) + `</span> <span id="playerRtt" class="badge badge-light">0 ms</span>
				</button>
			</div>
		 </div>
		<div id="remotePlayerPianoroll" class="row rounded-bottom bg-secondary text-white">
			<div class="col">
				<div id="remotePlayerDynamicPiano" data-participant-name="` + playerName + `" class="my-1 pianoroll"></div>
			</div>
		</div>
	</div>

	`;

	$('#klaviature').append(newPlayerHtml);

	// https://learn.jquery.com/using-jquery-core/faq/how-do-i-pull-a-native-dom-element-from-a-jquery-object/
	var domElement = $('#remotePlayerDynamicPiano[data-participant-name="' + playerName + '"]')[0];

	var dynamicPiano = JZZ.input.Kbd({ at: domElement, ...dynamicPianoOptions });

	if (isValidParticipant(playerName)) {
		participants[playerName]['piano'] = dynamicPiano;
	} else {
		alert('error in ' + arguments.callee.name + ', check out console.trace() message');
		console.trace();
		return false;
	}
	return true;
}

/**
 * Removes guest player
 * @param {string} playerName - Name of the player you want to delete 
 * @returns {bool} True on success | False on fail
 */
function removeDynamicPlayerHtml(playerName) {
	if (isValidParticipant(playerName)) {
		$('#remotePlayerDynamic[data-participant-name="' + playerName + '"]').remove();
		return true;
	} else {
		return false;
	}

}

/**
 * Check if user is defined
 * @param {string} user - Name of the user you want to check
 * @returns {bool} True if the user is valid | False if user is invalid
 */
function isValidParticipant(user) {
	// console.log('inside function: ' + arguments.callee.name);
	return typeof (participants[user]) !== 'undefined' ? true : false;
}

function isValidParticipantPiano(user) {
	// console.log('inside function: ' + arguments.callee.name);
	return typeof (participants[user]['piano'] !== 'undefined') ? true : false;
}

/**
 * Copies invite link to clipboard
 */
function copyShareUrlToClipboard() {
	var inputc = document.body.appendChild(document.createElement("input"));
	inputc.value = window.location.href;
	inputc.focus();
	inputc.select();
	document.execCommand('copy');
	inputc.parentNode.removeChild(inputc);
	$('#shareSession').html('<i class="fas fa-share-alt"></i> Link copied to clipboard!');
	setTimeout(function () { $('#shareSession').html('<i class="fas fa-share-alt"></i> Share this session'); }, 2000);
}

/**
 * - Prompts user for new session name.
 * * Joins other classes or changes current class name
 */
function promptAndJoinSession() {
	var newSessionName = promptAndReturnString('Type session name', '');
	if (newSessionName !== null && newSessionName != '') {
		// tuki je treba še dodat da se recording iz te seje prenakne v novo
		window.location.hash = newSessionName;
		setCookie('sessionName', newSessionName, 3650);
		location.reload();
	} else {
		console.log("Refused to change session!");
	}
}

// 0 - play my notes from MIDI-IN
// 1 - play my notes from server
var playMeFromServer = 0;

var sendProgramChangeEvents = true;

var rttSendTime = 0;
var rttReceived = 0;
var rttMeasured = 0;
var rttTimer;

var lastMidi;
var jmidi2;

var participants = {};
var requiredInstruments = {};

var input;
var output;

var pianoIn;
var pianoOut;

var virtualKbdDynamic = {};

JZZ.MIDI.prototype.isNoteEvent = function () {
	var c = this[0];
	if (typeof c == 'undefined' || c < 0x80 || c > 0x9f)
		return false;
	return this[1] >= 0;
};

JZZ.MIDI.prototype.isProgramChangeEvent = function () {
	var c = this[0];
	if (typeof c == 'undefined' || c < 0xc0 || c > 0xcf)
		return false;
	return this[1] >= 0;
};

var synth;
synth = JZZ.synth.MIDIjs({ soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/", instrument: "acoustic_grand_piano" })
	.or(function () { console.log("JZZ.synth.MIDIjs() soundfontUrl loading..."); alert('Cannot load MIDI.js!\n' + this.err()); })
	.and(function () { console.log("JZZ.synth.MIDIjs() soundfontUrl loaded"); });

// MIDI.loadPlugin({
// 		soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/",
// 		instruments: [ 'acoustic_grand_piano', 'marimba', 'viola' ],
// 		onprogress: function(state, progress) {
// 			console.log(state, progress);
// 		},
// 		onsuccess: function() {
// 			MIDI.setVolume(0, 127);
// 		}
// 	});

/**
 * Loads an instrument
 * @param {string} instrumentName - Name of the instrument you want to load
 */
async function loadAndChangeTo(instrumentName) {
	MIDI.loadPlugin({
		// soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/",
		soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/FatBoy/",
		// soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/",
		instrument: instrumentName,
		onprogress: function (state, progress) {
			console.log(state, progress);
		},
		onsuccess: function () {
			console.log("loadAndChangeTo onsuccess: " + instrumentName);
			MIDI.setVolume(0, 127);
			MIDI.programChange(0, MIDI.GM.byName[instrumentName].number);
			let check = `<i class="bi bi-check-lg me-1"></i>`;
			$('#check_spin').empty();
			$('#check_spin').append(check);
		}
	});
}

function GmIdToName(numeric) {
	var instrumentName = MIDI.GM.byId[numeric].id;
	loadAndChangeTo(instrumentName);
};

var smf;
var trk;
var isMidiSession = false;

var bpm = 120;
var ppqn = 96;
var midiTicks = 0;
var midiTicksLastEvent = 0;

var midiTimer;
var midiSessionFirstNote = true;
var midiSessionName;

var smfTempo = JZZ.MIDI.smfBPM(bpm);
var smfEndOfTrack = JZZ.MIDI.smfEndOfTrack();

var player;

var debug = false;

var responsivePianoOptions = {
	ww: 18,
	bw: 10,
	wl: 100,
	bl: 70,
	from: 'A1', to: 'C8',
	320: {},
	450: { from: 'A3', to: 'C7' },
	620: { from: 'A2', to: 'C7' },
	750: { from: 'A2', to: 'C8' },
	880: { from: 'A1', to: 'C8' },
	1000: { from: 'A1', to: 'C9' },
	1100: { from: 'A1', to: 'C8' },
	1220: { from: 'A1', to: 'C9' }
}

var mainPianoOptions = {
	...responsivePianoOptions,
	onCreate: function () {
		this.getWhiteKeys().setStyle({ backgroundColor: '#ffe' }, {});
		this.getKeys().setStyle({}, { backgroundColor: '#c6f' });
	}
}

var dynamicPianoOptions = {
	...responsivePianoOptions,
	onCreate: function () {
		this.getWhiteKeys().setStyle({ backgroundColor: '#ffe' }, {});
		this.getKeys().setStyle({}, { backgroundColor: '#6ff' });
	}
}

var myName;

/**
 * Display console.info(msg) if debug option is turned on.
 * @param {*} msg - Error message
 */
function myDebug(msg) {
	if (debug) {
		console.info(msg);
	}
}

/**
 * Calculates tick duration
 * @param {int} bpm - Beats per minute
 * @param {*} ppqn - Parts (or pulses) per quarter note
 * @returns {float} - Tick duration
 */
var tickDuration = (bpm, ppqn) => 60000 / (bpm * ppqn);

/**
 * - Starts midi timer
 */
function startTicker() {
	midiTimer = setInterval(function () { midiTicks++; }, tickDuration(bpm, ppqn));
}

/**
 * Stops midi timer
 */
function stopTicker() {
	clearInterval(midiTimer);
	midiTimer = null;
}

// function midiSessionStop() {
// 	console.log('inside function: ' + arguments.callee.name);
// 	if (!isMidiSession) { return false; }

// 	// endOfTrack ob zadnjem MIDI eventu, ker drugač predn folk stisne
// 	// STOP RECORDING lahko traja par sekund in tega nočmo na posnetku
// 	smf[0].add(midiTicksLastEvent, smfEndOfTrack);

// 	stopTicker();
// 	midiTicks = 0;
// 	isMidiSession = false;
// 	midiSessionFirstNote = true;

// }


function midiSessionAddNote(jmidi) {
	if (!isMidiSession) { return false; }
	smf[0].add(midiTicks, jmidi);
	midiTicksLastEvent = midiTicks;

	if (midiSessionFirstNote) {
		startTicker();
		midiSessionFirstNote = false;
	}

}

// var dt = setInterval(function() { console.log(myName);}, 50);

let fixStartingToPlay;
let connectStaff;

$(document).ready(function () {

	/*
	TODO
	- DONE -> če midi session že obstaja in stisneš record potem stari session prepiši z novim
	- DONE -> custom participant name
	- DONE -> join session gumb
	- DONE -> custom session name
	- DONE -> multi recordings per session -> NEEDFIX (popravi crappy implementacijo topic + payload msgja)
	- DONE -> audible metronom, dodaj settinge (tempo in imena: legato, allegro, vivace...)
	- DONE: NEEDFIX: CANNOT_REPRODUCE -> če narobe napišeš instrument v loadAndChangeTo() te vrže vn (mqtt pomoje) [luka's note: sm naredu dropdown da se ćlouk ne more zmotit]
	- NEEDFIX: TESTIRAJ -> če odpreš session medtem ko nekdo igra in še ni inicializiran piano potem gre neki na bad zarad incoming midi eventa, ki ga nima kam dat
	- NEEDFIX: TESTIRAJ -> če daš playMeFromServer=1 potem neki mqtt zajamra in se vrže dol
	- NEEDFIX: audio routing omfg - kam se bo zdej predvajal midiSession; na 'Web Audio' ali midi soundfonts?
	- NEEDFIX: izbereš en recording, daš play, izbereš drug recording, daš play = igrata oba = treba popravt!
	- NEEDFIX: če maš recordingse in daš change class name potem se recordingi ne prenesejo
	- IMPROVEMENT: var smf (oziroma midi session data) spremeni da bo objektno
	- IMPROVEMENT: namest prompt naredi modal window in dodaj kakšn input validation [luka's note: regex že je, modal se pa lahko še naredi]
	- IMPROVEMENT: metronom start naj dejansko zacne od zacetka, ker sedaj je resume in lahko traja preden slisis prvi tick takoj po startu
	- FEATURE_REQUEST: stisneš record in snemaš unga k igra
	- FEATURE_REQUEST: chord builder, npr stisneš F in ti nardi kaj vem... F major 7 flat 5
	- FEATURE_REQUEST: s tapkanjem stop ugotovi tempo
	- FEATURE_REQUEST: ime tonov na tipke - ko je tipka pritisnjena (by Patrik)
	- FEATURE_REQUEST: prikaz vrstnega reda katero tipko si pritisnil (by Patrik)
	- FEATURE_REQUEST: prva in zadnja nota na keyboardu za renderirat pianoroll
	- FEATURE_REQUEST: arpeggiator
	- FEATURE_REQUEST: če držiš shift ti izpiše katera nota je to (by Patrik)
	- FEATURE_REQUEST: ko igraš po posnetku ti prikaže noto in jo ne spusti dokler ti ne zaigraš iste, potem gre naprej
	- FEATURE_REQUEST: pofejki to stran in any way possible https://www.imusic-school.com/en/tools/piano-chords/
	*/

	/**
	 * TODO: loadAndChangeTo needs an alternative
	 * - Changes to your selected instrument in "#select_instruments" form
	 */
	function applySound() {
		$('#check_spin').empty();
		let spin = `
			<div class="spinner-border spinner-border-sm me-1" role="status">
				<span class="sr-only">Loading...</span>
			</div>
		`;
		$('#check_spin').append(spin);
		loadAndChangeTo(document.getElementById("select_instruments").value); // NEEDFIX: deprecated?
	}

	// get/set session name
	var [url, sessionName] = window.location.href.split('#');
	if (typeof (sessionName) === 'undefined') {
		var sessionName = getCookie('sessionName') || randomName();
		setCookie('sessionName', sessionName, 3650);
		// set window URL
		// window.history.replaceState(null, null, '#' + sessionName);
		window.location.hash = sessionName;
	}

	shareUrl = url + '#' + sessionName;

	// $('#sessionName').html('Session name: <a href="'+shareUrl+'">'+sessionName+'</a>');
	// copyShareUrlToClipboard();

	// brisi cookie myName in raje nastavi mojeIme
	var checkName = getCookie('myName');
	if (checkName) {
		console.log('setCookie ' + checkName + ' 3650 days');
		setCookie('mojeIme', checkName, 3650);
	}

	myName = getCookie('mojeIme') || randomName();

	loadAndChangeTo('acoustic_grand_piano'); // deprecated?

	setCookie('mojeIme', myName, 3650);
	showMyName(myName);

	$('demo').on('click', myLoop);
	$('#midiPlayerStop').click(midiPlayerStop);
	$('#midiPlayerPlay').click(midiPlayerPlay);
	$('#midiSessionRecord').click(midiSessionToggle);
	$('#midiSessionPublish').click(midiSessionPublish);
	$('#apply_instrument_btn').click(applySound);

	$('#myName').on('click', changeMyName);
	$('#className').text(decodeURI(sessionName));

	// $('body').on('taphold', 'div#recordingsList > a', function (event) { 
	// 	var myel = $(this)[0];
	// 	var item = myel.innerText;
	// 	myel.remove();
	// });

	// click event handler za vse dinamicne elemente kreirane z addToRecordingsList()
	$('body').on('click', 'div#recordingsList > a', function (event) {

		var element = $(this);
		var smfAuthor = element.attr('data-recording-author');
		var smfName = element.attr('data-recording-name');

		// ctrl or meta + click = delete and remove from server
		if (event.ctrlKey || event.metaKey) {
			mqttPub(tMidiSessions + '/' + smfName, '', true);	//retained = true
			element.remove();
			return true;
		}

		var hrefData = $(this).attr('href');
		var [header, smfDatazBase64] = hrefData.split(',');

		var smfDataz = JZZ.lib.fromBase64(smfDatazBase64);
		var newSmf = JZZ.MIDI.SMF(smfDataz);

		generateSmfPlayer(newSmf);

	});

	// $('#recordingsList > a').click(function(e) {
	// 	console.log('we are here');
	// 	var hrefData = $(this).attr('href');
	// 	var [header, smfDatazBase64] = hrefData.split(',');

	// 	var smfDataz = JZZ.lib.fromBase64(smfDatazBase64);
	// 	var newSmf = JZZ.MIDI.SMF(smfDataz);

	// 	console.log(hrefData);
	// 	console.log(header);
	// 	console.log(smfDatazBase64);
	// 	console.log(smfDataz);
	// 	console.log(newSmf);

	// 	generateSmfPlayer(newSmf);
	// });

	metronome = new metronome();
	$('#metronomeButton').on('click', toggleMetronome);

	var spinner = $("input#metronomeBpmValue").inputSpinner();
	$("input#metronomeBpmValue").on('input', function (event) {
		bpm = spinner.val();
		changeMetronomeMarking(bpm);
		metronome.setTempo(bpm);
	});

	$("input#metronomeBpmValue").on('change', function (event) {
		bpm = spinner.val();
		changeMetronomeMarking(bpm);
		metronome.setTempo(bpm);
	});

	/**
	 * Changes metronome marking according to 
	 * @param {int} value - Metronome BPM
	 */
	function changeMetronomeMarking(value) {
		var marking;
		if (value < 25) { marking = 'Larghissimo'; }
		else if (value < 45) { marking = 'Grave'; }
		else if (value < 60) { marking = 'Lento'; }
		else if (value < 70) { marking = 'Larghetto'; }
		else if (value < 77) { marking = 'Adagietto'; }
		else if (value < 85) { marking = 'Marcia moderato'; }
		else if (value < 98) { marking = 'Andante moderato'; }
		else if (value < 109) { marking = 'Andante'; }
		else if (value < 120) { marking = 'Allegro moderato'; }
		else if (value < 156) { marking = 'Allegro'; }
		else if (value < 176) { marking = 'Vivace'; }
		else if (value < 200) { marking = 'Presto'; }
		else { marking = 'Prestissimo'; }
		$('#metronomeMarking').text(marking);
	}


	JZZ();
	JZZ.synth.Tiny.register('Web Audio');


	pianoIn = JZZ.input.Kbd({ at: 'pianoIn_space', ...mainPianoOptions });
	// pianoOut = JZZ.input.Kbd({ at:'pianoOut_space', ...mainPianoOptions });

	JZZ.input.ASCII({
		at: 'pianoIn_space', 2: 'C#5', 3: 'D#5', 5: 'F#5', 6: 'G#5', 7: 'A#5', 9: 'C#6', 0: 'D#6', '+': 'F#6',
		Q: 'C5', W: 'D5', E: 'E5', R: 'F5', T: 'G5', Y: 'A5', U: 'B5', I: 'C6', O: 'D6',
		P: 'E6', '[': 'F6', ']': 'G6', S: 'C#4', D: 'D#4', G: 'F#4', H: 'G#4', J: 'A#4',
		L: 'C#5', ':': 'D#5', Z: 'C4', X: 'D4', C: 'E4', V: 'F4', B: 'G4', N: 'A4', M: 'B4',
		'<': 'C5', '>': 'D5', '?': 'E5'
	}).connect(pianoIn);


	JZZ.addMidiIn('HTML Piano In', pianoIn);

	input = JZZ.gui.SelectMidiIn({ at: 'sel_in' });
	output = JZZ.gui.SelectMidiOut({ at: 'sel_out' });

	// handle incoming events from JZZ.gui.SelectMidiIn() device
	input.connect(midiHandler);

	function jebalaTeFunkcija(pek) {
		console.log('inside function: ' + arguments.callee.name);
		return typeof (participants[pek]) !== 'undefined' ? true : false;
	}

	/**
	 * TODO: FIXME: var smf is global, please do something about it
	 * - Ştop recording midi session
	 * - Save 
	 * @returns True on success | False on fail
	 */
	function midiSessionStop() {
		// add midi footer, stop ticker, toggle record button, ask for session name, generate player, publish to server, generate downloadable file
		console.log('inside function: ' + arguments.callee.name);

		// session not running?
		if (!isMidiSession) { return false; }

		// endOfTrack ob zadnjem MIDI eventu, ker drugač predn folk stisne
		// STOP RECORDING lahko traja par sekund in tega nočmo na posnetku
		smf[0].add(midiTicksLastEvent, smfEndOfTrack);

		stopTicker();
		midiTicks = 0;
		isMidiSession = false;
		midiSessionFirstNote = true;

		buttonRecordToggle(isMidiSession);

		// posnetku damo ime
		if (msName = midiSessionHasName()) {
			// FIXME: var smf is global, please do something about it
			generateSmfPlayer(smf);
			var b64 = midiDataToBase64(smf);
			midiSessionPublish(msName, b64);
			midiSessionGenerateFile(msName + '.mid', b64);
		} else {
			alert('msName error inside function: ' + arguments.callee.name);
			return false;
		}
		return true;
	}

	/**
	 * Starts recording midi session
	 * @returns True on success | False on fail
	 */
	function midiSessionRecord() {
		console.log('inside function: ' + arguments.callee.name);

		// session already running?
		if (isMidiSession) { return false; }

		// midi file header
		smf = new JZZ.MIDI.SMF(0, ppqn);
		trk = new JZZ.MIDI.SMF.MTrk();

		smfTempo = JZZ.MIDI.smfBPM(bpm);
		console.log(bpm);
		console.log(smfTempo);

		smf.push(trk);
		smf[0].add(0, smfTempo);

		isMidiSession = true;
		midiSessionName = null;
		buttonRecordToggle(isMidiSession);
		return true;
	}


	/**
	 * Toggles metronome on/off
	 */
	function toggleMetronome() {
		console.log('inside function: ' + arguments.callee.name);
		if (!metronome.isRunning) {
			metronomeStart();
		} else {
			metronomeStop();
		}
	}

	/**
	 * Starts metronome
	 */
	function metronomeStart() {

		// var tempo = promptAndReturnString('Set beats per minute', bpm);

		// if (!tempo) {
		// 	// alert('canceled');
		// 	return false;
		// }

		// bpm = tempo;

		metronome.setTempo(bpm);
		metronome.start();
		$('#metronomeButton').removeClass('btn-outline-light');
		$('#metronomeButton').addClass('btn-light');
		$('#metronomeButton').html('<i class="fas fa-drum"></i> Stop');
	}

	/**
	 * Stops metronome
	 */
	function metronomeStop() {
		metronome.stop();
		$('#metronomeButton').removeClass('btn-light');
		$('#metronomeButton').addClass('btn-outline-light');
		$('#metronomeButton').html('<i class="fas fa-drum"></i> Start');
	}

	/**
	 * * Prompts user for a new name
	 * - Changes user's name
	 * @returns True on success | False on fail 
	 */
	function changeMyName() {
		let myNewName = promptAndReturnString('Type your nickname below', myName);
		if (myNewName === null || myNewName == '') {
			return false;
		} else {
			myNewName = encodeURI(myNewName);
			setCookie('mojeIme', myNewName, 3650);
			showMyName(myNewName);
			delete requiredInstruments[myName];
			// tuki je treba poslat svoje ime in instrument ker je kot da smo prsli na novo
			myName = myNewName;
		}
		return true;
	}


	/**
	 * Shows your name in the #myName field
	 * @param {string} name - Your name
	 */
	function showMyName(name) {
		$('#myName').text(decodeURI(name));
	}

	/**
	 * Sends played note to MQTT
	 * @param {JZZ.MIDI} jmidi 
	 */
	function publishMyNote(jmidi) {
		var note = jmidi.getNote();
		var channel = jmidi.getChannel();
		var velocity = jmidi.getVelocity();

		msg = myName + ':' + jmidi[0] + ',' + jmidi[1] + ',' + jmidi[2];
		mqttPub(tNoteEvents, msg);
	}

	//* Od Markota pcn
	function publishMyPcn(jmidi) {
		msg = myName + ':' + jmidi[0] + ',' + jmidi[1];
		mqttPub(tPcnEvents, msg);
	}

	/**
	 * Sends a message to MQTT server.
	 * @param {*} topic - Topics on the MQTT server:
	 * - tMidiSessions (MIDI Recordings)
	 * - tNoteEvents (Information when a key is pressed)
	 * - tPcnEvents (Information about instrument change)
	 * @param {string} payload - Message sent over MQTT
	 * @param {bool} retained - The broker stores the last retained message and the corresponding QoS for that topic.
	 */
	function mqttPub(topic, payload, retained = false) {
		if (client.isConnected()) {
			message = new Paho.MQTT.Message(payload);
			message.destinationName = topic;
			message.retained = retained;
			client.send(message);
		}
	}

	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	async function myLoop() {
		//21 .. 108
		var jmidi;
		for (note = 21; note <= 108; note += 3) {

			jmidi = JZZ.MIDI.noteOn(0, note, 127);
			midiHandler(jmidi);

			await sleep(15);

			jmidi = JZZ.MIDI.noteOff(0, note, 127);
			setTimeout(midiHandler, 15, jmidi);

			await sleep(40);

		}
	}

	/**
	 * Plays the middle C note
	 * TODO: Cannot call this function from dynamically added HTML elements!
	 */
	async function playMiddleC() {
		var jmidi;
		let note = 60;

		jmidi = JZZ.MIDI.noteOn(0, note, 127);
		midiHandler(jmidi);
		await sleep(1000);

		jmidi = JZZ.MIDI.noteOff(0, note, 127);
		setTimeout(midiHandler, 15, jmidi);

		await sleep(40);
	}

	/**
	 * Plays the C major scale
	 * TODO: Cannot call this function from dynamically added HTML elements!
	 */
	async function playScale() {
		var jmidi;
		let playOnlyWhiteKeys = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1];
		let key = 0;
		for (let note = 60; note <= 73; note++) {
			if (playOnlyWhiteKeys[key] == 1) {
				jmidi = JZZ.MIDI.noteOn(0, note, 127);
				midiHandler(jmidi);
				await sleep(300);
				jmidi = JZZ.MIDI.noteOff(0, note, 127);
				setTimeout(midiHandler, 15, jmidi);
				await sleep(40);
			}
			key++;
		}
	}

	fixStartingToPlay = () => {
		$('playMiddleC').on('click', playMiddleC);
		$('playScale').on('click', playScale);
	}

	connectStaff = () => {
		JZZ.synth.Tiny.register();
		var out = JZZ().openMidiOut();

		var staff = JZZ.input.Kbd({
			keys: [
				['c', 'c5'], ['d', 'd5'], ['e', 'e5'], ['f', 'f5'], ['g', 'g5'], ['a', 'a5'], ['b', 'b5']
			], onCreate: function () {
				this.getKeys().setStyle({ backgroundColor: 'rgba(255,255,255,0.3)' }, { backgroundColor: 'rgba(0,0,0,0.3)' });
			}
		}).or(function () { alert('Cannot open MIDI In!\n' + this.err()); });

		var piano = JZZ.input.Kbd({ at: 'piano', from: 'C5', to: 'B5', ww: 64, bw: 36 })
			.or(function () { alert('Cannot open MIDI In!\n' + this.err()); });

		piano.connect(staff).connect(out);
		staff.connect(piano); // circular connection is ok!
	}


	function midiPlayerPlay() {
		console.log('inside function: ' + arguments.callee.name);
		// if player is populated with midi session data
		if (typeof (player) !== 'undefined' && !player.playing) {
			player.connect(output);
			player.play();
			buttonPlaySwitch(player.playing)
		}
	}

	// function midiPlayerStop() {
	// 	console.log('inside function: ' + arguments.callee.name);
	// 	if (isMidiSession) {

	// 		// posnetku damo ime
	// 		if (msName = midiSessionHasName()) {
	// 			midiSessionStop();
	// 			// FIXME: var smf is global, please do something about it
	// 			generateSmfPlayer(smf);
	// 			var b64 = midiDataToBase64(smf);
	// 			midiSessionPublish(msName, b64);
	// 			midiSessionGenerateFile(msName + '.mid', b64);
	// 			buttonRecordToggle(isMidiSession);
	// 		} else {
	// 			alert('msName error inside function: ' + arguments.callee.name);
	// 			return false;
	// 		}

	// 	}
	// 	if (typeof(player) !== 'undefined' && player.playing) {
	// 		player.stop();
	// 		buttonPlaySwitch(player.playing);
	// 	}
	// 	if (metronome.isRunning) {
	// 		metronomeStop();
	// 	}
	// }


	function midiPlayerStop() {
		console.log('inside function: ' + arguments.callee.name);
		if (isMidiSession) {
			midiSessionStop();
		}
		if (typeof (player) !== 'undefined' && player.playing) {
			player.stop();
			buttonPlaySwitch(player.playing);
		}
		if (metronome.isRunning) {
			metronomeStop();
		}
	}


	function buttonRecordToggle(weRecording) {
		if (weRecording) {
			$('#midiSessionRecord').removeClass('btn-outline-danger');
			$('#midiPlayerStop').removeClass('btn-outline-light');
			$('#midiSessionRecord').addClass('btn-danger');
			$('#midiPlayerStop').addClass('btn-light');
		} else {
			$('#midiSessionRecord').removeClass('btn-danger');
			$('#midiPlayerStop').removeClass('btn-light');
			$('#midiSessionRecord').addClass('btn-outline-danger');
			$('#midiPlayerStop').addClass('btn-outline-light');
		}
	}

	function buttonPlaySwitch(wePlaying) {
		if (wePlaying) {
			$('#midiPlayerPlay').removeClass('btn-outline-light');
			$('#midiPlayerStop').removeClass('btn-outline-light');
			$('#midiPlayerPlay').addClass('btn-light');
			$('#midiPlayerStop').addClass('btn-light');
		} else {
			$('#midiPlayerPlay').removeClass('btn-light');
			$('#midiPlayerStop').removeClass('btn-light');
			$('#midiPlayerPlay').addClass('btn-outline-light');
			$('#midiPlayerStop').addClass('btn-outline-light');
		}
	}

	// function midiSessionToggle() {
	// 	console.log('inside function: ' + arguments.callee.name);
	// 	if (isMidiSession) {
	// 		midiSessionStop();
	// 		generateSmfPlayer(smf);
	// 		var b64 = midiDataToBase64(smf);
	// 		midiSessionPublish('onlySession1', b64);
	// 		midiSessionGenerateFile('ragtime.mid', b64);
	// 		buttonRecordToggle(isMidiSession);
	// 	} else {
	// 		midiSessionRecord();
	// 		buttonRecordToggle(isMidiSession);
	// 	}
	// }

	function midiSessionToggle() {
		console.log('inside function: ' + arguments.callee.name);
		if (isMidiSession) {
			midiSessionStop();
		} else {
			midiSessionRecord();
		}
	}

	function midiDataToBase64(smf) {
		console.log('inside function: ' + arguments.callee.name);
		var str = smf.dump(); // MIDI file dumped as a string
		var b64 = JZZ.lib.toBase64(str); // convert to base-64 string
		return b64;
	}

	function midiSessionGenerateFile(filename, b64) {
		console.log('inside function: ' + arguments.callee.name);
		var uri = 'data:audio/midi;base64,' + b64; // data URI
		$('#midiFileOut').attr('href', uri);
		$('#midiFileOut').attr('download', filename);
		$('#midiFileOut').text('Download recording', filename);
	}

	function generateSmfPlayer(smfDataz) {
		console.log('inside function: ' + arguments.callee.name);
		player = JZZ.MIDI.SMF(smfDataz).player();
		player.onEnd = function () { buttonPlaySwitch(player.playing); };
		player.connect(pianoIn);
	}

	function midiSessionPublish(smfName, smfDataz) {
		console.log('inside function: ' + arguments.callee.name);
		msg = myName + ':' + smfDataz;
		mqttPub(tMidiSessions + '/' + smfName, msg, true);	//retained = true
	}

	function midiSessionReceive(recordingAuthor, recordingName, smfDatazBase64) {
		console.log('inside function: ' + arguments.callee.name);

		// base64 to midi data
		// var smfDataz = JZZ.lib.fromBase64(smfDatazBase64);
		// var rcvSmf = JZZ.MIDI.SMF(smfDataz);

		// generateSmfPlayer(rcvSmf);
		// var b64 = midiDataToBase64(rcvSmf);
		// midiSessionGenerateFile(recordingName + '.mid', smfDatazBase64);

		addToRecordingsList(recordingAuthor, recordingName, smfDatazBase64);
	}


	function midiHandler(jmidi) {

		lastMidi = jmidi;

		var inputIsVirtual = input._name == 'HTML Piano In' ? true : false;

		// https://github.com/jazz-soft/JZZ/blob/master/javascript/JZZ.js#L2158

		// MIDI note event received (off=0x80-0x8f, on=0x90-0x9f)
		// if ( jmidi.isNoteOn() || jmidi.isNoteOff() ) {
		if (jmidi.isNoteEvent()) {
			// send to server ASAP
			publishMyNote(jmidi);

			// play my notes right now - otherwise they are played when received back from server
			if (!playMeFromServer) {
				playReceivedNote(output, jmidi);
			}

			// show keystrokes that are not from 'HTML Piano In'		
			if (!inputIsVirtual) {
				showReceivedNote(pianoIn, jmidi);
			}

			// are we recording?
			if (isMidiSession) {
				// getNoteDuration(jmidi);
				midiSessionAddNote(jmidi);
			}
		}

		//* Od Markota pcn.. zdi se mi da ko spremeniš inštrument ubistvu sploh ne spremeniš programa, ker ta stvar se nikoli ne pošlje
		// MIDI program change messages 0xc0 .. 0xcf
		else if (program = jmidi.isProgramChangeEvent()) {
			output.program(0, jmidi[1]);
			if (sendProgramChangeEvents) {
				publishMyPcn(jmidi);
			}
		}

		else {
			var data = jmidi[0];

			switch (data) {
				case JZZ.MIDI.start()[0]: {
					console.log('MIDI start received: ' + jmidi);
					midiPlayerPlay();
					break;
				}
				case JZZ.MIDI.stop()[0]: {
					console.log('MIDI stop received: ' + jmidi);
					midiPlayerStop();
					break;
				}
				case JZZ.MIDI.continue()[0]: {
					console.log('MIDI continue received: ' + jmidi);
					midiSessionToggle();
					break;
				}

				default: {
					console.log('MIDI dataz received: ' + jmidi);
					break;
				}
			}
		}
	};


	function mylogger(message) {
		console.log(new Date() + ' ' + message);
		// console.log(mylogger.caller + ' ' + message);
		// console.trace();
	}


	// Create a client instance
	var mqttSrv = 'test.mosquitto.org';
	var mqttPort = 8081;
	// var mqttSrv = 'fandangoc.dmz6.net';
	// var mqttPort = 8081;

	var tBaseName = 'mididerp/sessions/' + sessionName;
	var tClients = tBaseName + '/clients';
	var tNoteEvents = tBaseName + '/noteEvents';
	var tRTT = tBaseName + '/rtt';
	var tPcnEvents = tBaseName + '/pcnEvents';
	var tMidiSessions = tBaseName + '/midiSessions';

	client = new Paho.MQTT.Client(mqttSrv, mqttPort, myName);

	lwt = new Paho.MQTT.Message('');
	lwt.destinationName = tClients + '/' + myName;
	lwt.retained = true;


	// set callback handlers
	client.onConnectionLost = onConnectionLost;
	client.onMessageArrived = onMessageArrived;

	var mqttOptions = {
		useSSL: true,
		reconnect: false,
		timeout: 3,
		onSuccess: onConnect,
		userName: 'monophonicBernstein12',
		password: 'polyrhythmicSchubert83'
	};

	// connect mqtt client
	client.connect(mqttOptions);

	function initRttTimer() {
		console.log('inside function: ' + arguments.callee.name);
		if (typeof (rttTimer) === 'number') {
			clearInterval(rttTimer);
		}
		rttTimer = setInterval(sendRttProbe, 500);
	}

	// called when the client connects
	function onConnect() {
		// Once a connection has been made, make a subscription and send a message.
		mylogger('MQTT onConnect');
		client.subscribe(tNoteEvents);
		client.subscribe(tRTT);
		client.subscribe(tMidiSessions + '/+');
		client.subscribe(tPcnEvents);

		// RTT timer
		initRttTimer();
	}

	function sendRttProbe() {
		rttSendTime = Date.now();
		mqttPub(tRTT, myName + ':' + rttMeasured);
	}

	function parseIncomingRttProbe(payloadString) {

		var [sender, rttReported] = payloadString.split(':');

		// me
		if (sender == myName) {
			rttReceived = Date.now();
			rttMeasured = rttReceived - rttSendTime;
			//$('#rttValue').html('RTT: ' + rttMeasured + ' ms');
		}
		updateRttTable(sender, rttReported);
	}

	function updateRttTable(sender, rtt) {
		// console.log('inside function: ' + arguments.callee.name);

		var isNew = false;

		// add new
		if (!isValidParticipant(sender)) {
			participants[sender] = {};
			addDynamicPlayerHtml(sender);
			// isNew = true;
		}

		// update properties
		participants[sender]['rtt'] = rtt + ' ms';
		participants[sender]['lastUpdate'] = Date.now();

		// if (isNew) {
		// }

	}

	/**
	 * Removes old entries:
	 * - from html pianorolls
	 * - from participants object
	 * - from requiredInstruments object
	 */
	function purgeRttTable() {
		for (let user in participants) {
			if (Date.now() - participants[user]['lastUpdate'] > 5000) {
				removeDynamicPlayerHtml(user);
				delete participants[user];
				delete requiredInstruments[user];
			} else if (Date.now() - participants[user]['lastUpdate'] > 1500) {
				participants[user]['rtt'] = 'stale';
			}
		}
	}

	function renderRttTable() {
		// $('#participants').html('Participants:<br>');
		for (let user in participants) {
			// tole je zaradi addDynamicPlayerHtml();
			if (user == myName) {
				$('#myRtt').text(participants[user]['rtt']);
				$('#remotePlayerDynamic[data-participant-name="' + myName + '"]').find('#playerRtt').text(participants[user]['rtt']);
				// $('#myName').text(user);
				// $('#participants').append(user + ' (me) - ' + participants[user]['rtt'] + '<br>');
			} else {
				$('#remotePlayerDynamic[data-participant-name="' + user + '"]').find('#playerRtt').text(participants[user]['rtt']);
				// $('#participants').append(user + ' - ' + participants[user]['rtt'] + '<br>');
			}
		}
	}

	/**
	 * Called when the client loses its connection
	 * @param {*} responseObject Response object
	 */
	function onConnectionLost(responseObject) {
		if (responseObject.errorCode !== 0) {
			mylogger('MQTT onConnectionLost: ' + responseObject.errorMessage);
			//console.trace();
		}
	}

	/**
	 * Plays recieved note on the virtual piano roll
	 * @param {JZZ.input.Kbd} virtualKbd - A piano roll keyboard object
	 * @param {JZZ.MIDI} jmidi - Information about played notes
	 */
	function showReceivedNote(virtualKbd, jmidi) {
		// console.log('inside function: ' + arguments.callee.name);
		var note = jmidi.getNote();
		var channel = jmidi.getChannel();
		var velocity = jmidi.getVelocity();

		var jmidi = new JZZ.MIDI(jmidi);

		// display keypress events
		if (jmidi.isNoteOn()) {
			virtualKbd.noteOn(0, note, velocity);
		} else if (jmidi.isNoteOff()) {
			virtualKbd.noteOff(0, note, velocity);
		}
	}

	/**
	 * TODO: Work on this one :)
	 * Plays a note from jmidi to output device
	 * @param {JZZ.gui.SelectMidiOut} outputDevice - Output device
	 * @param {JZZ.MIDI} jmidi - Information about played notes
	 */
	function playReceivedNote(outputDevice, jmidi) {
		// send notes to output when (from others OR my notes after getting them back from server)
		// tole je za MIDI-OUT (Web Audio ali hardware)
		// if ( outputDevice.connected() ) {
		// 	outputDevice.send(jmidi);
		// }

		if (jmidi.isNoteOn()) {
			synth.noteOn(0, jmidi.getNote(), jmidi.getVelocity());
		} else if (jmidi.isNoteOff()) {
			synth.noteOff(0, jmidi.getNote(), jmidi.getVelocity());
		}

		// tole je za MIDI.loadplugin soundfont ozirona loadAndChangeTo()
		// if (jmidi.isNoteOn()) {
		// 	MIDI.noteOn(0, jmidi.getNote(), jmidi.getVelocity());
		// } else if (jmidi.isNoteOff()) {
		// 	MIDI.noteOff(0, jmidi.getNote(), 0);
		// }
	}

	/**
	 * Called when a message arrives from MQTT server
	 * @param {*} message - A message from the broker
	 */
	function onMessageArrived(message) {
		//mylogger("MQTT onMessageArrived:"+message.payloadString);
		// incoming MIDI note is received
		if (message.destinationName == tNoteEvents) {
			var [sender, midiData] = message.payloadString.split(':');
			// split by comma and map each element to Number
			var midiBytes = midiData.split(',').map(Number);


			// https://jazz-soft.net/doc/JZZ/jzzmidi.html
			// It accepts an array or a comma-separated list of the message bytes or another JZZ.MIDI object.
			var jmidi = new JZZ.MIDI(midiBytes);

			// if (jmidi.isNoteOn() || jmidi.isNoteOff() ) {
			if (jmidi.isNoteEvent()) {

				// if sender not me OR (implied) sender is me and PlayMeFromServer
				if (sender != myName) {
					if (isValidParticipantPiano(sender)) {
						playReceivedNote(output, jmidi);
						showReceivedNote(participants[sender]['piano'], jmidi);
					}
				} else if (playMeFromServer == 1) {
					playReceivedNote(output, jmidi);
					var inputIsVirtual = input._name == 'HTML Piano In' ? true : false;
					// show keystrokes that are not from 'HTML Piano In'		
					if (!inputIsVirtual) {
						showReceivedNote(pianoIn, jmidi);
					}
				}
			}
		}
		//* moj pcn receive
		else if (message.destinationName == tPcnEvents) {
			console.log("Dobil si tPcnEvent: (spodaj)");
			console.log(message);
		}
		// RTT probe received
		else if (message.destinationName == tRTT) {
			parseIncomingRttProbe(message.payloadString);
			purgeRttTable();
			renderRttTable();
		}
		// midi session received
		else if (message.destinationName.startsWith(tMidiSessions)) {
			// topic=mididerp/sessions/alternativePaganini4/midiSessions/onlySession1
			// payload=tranceWagner53:TVRoZAAAAAYAAAABAGBNVHJrAAAASwD/UQMHoSAAkCR/EYAkahOQJH8YgCRSFZAmfxOAJk8UkCR/F4AkZxeQJ38VgCdaEZAkfxeAJGoSkCl/GYApTRGQJ38UgCdqS/8vAA==

			recordingName = message.destinationName.split('/')[4];
			var [recordingAuthor, recordingSmfDatazBase64] = message.payloadString.split(':');
			// midiSessionReceive(recordingAuthor, recordingName, recordingSmfDatazBase64);

			if (recordingAuthor != '') {
				addToRecordingsList(recordingAuthor, recordingName, recordingSmfDatazBase64);
			}
		}
	}
});