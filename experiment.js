// generic task variables
var sumInstructTime    = 0 // ms
var instructTimeThresh = 0 // in seconds

// query string variables
var group = group || 'high'; // 'high' = 75% congruent, 'low' = 0% congruent

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text + '</p></div>'
}

// High contrast, color-blind safe colors
var stimuli = [
	{
		colour: 'red',
		neutral: 'jkm',
		hex: '#f64747',
		key: 86 // V
	},
	{
		colour: 'blue',
		neutral: 'xtqz',
		hex: '#00bfff',
		key: 66 // B
	},
	{
		colour: 'yellow',
		neutral: 'fpstw',
		hex: '#f1f227',
		key: 78 // N
	}	
];

congruent_stim   = makeCongruentStimuli(stimuli);   // 3 words * 1 colour  = 3
incongruent_stim = makeIncongruentStimuli(stimuli); // 3 words * 2 colours = 6
neutral_stim     = makeNeutralStimuli(stimuli);     // 3 words * 3 colours = 9

// multiply up to get 36 critical trials of each stimulus type ...
stims = [].concat(Array(6).fill(incongruent_stim).flat(), Array(4).fill(neutral_stim).flat());
if (group == 'high') { // ... except there are no congruent stimuli in 0% congruent condition
	stims = stims.concat(Array(12).fill(congruent_stim).flat());
}

if (Debug == 0) {
	test_trials = 288
} else {
	test_trials = stims.length
}

// filler trials
if (group == 'high') { // 75% congruent
	filler = Array((test_trials - stims.length) / congruent_stim.length).fill(makeCongruentStimuli(stimuli)).flat()
} else {              // 0% congruent
	filler = Array((test_trials - stims.length) / incongruent_stim.length).fill(makeIncongruentStimuli(stimuli)).flat()
}
filler.forEach((item, index) => {
  item.data.critical = false;
});

var test_stims = jsPsych.randomization.repeat([].concat(stims, filler), 1, true);


// practice_trials: 12 congruent, 36 neutral
var practice_congruent_stims = jsPsych.randomization.repeat(Array(4).fill(congruent_stim).flat(), 1, true);
var practice_neutral_stims   = jsPsych.randomization.repeat(Array(4).fill(neutral_stim).flat(), 1, true);

var choices = [66, 78, 86]
var exp_stage = 'practice'

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */

/* define static blocks */
var response_keys =
	'<ul class="list-text"><li><span class="large" style="color:#f64747;font-weight:bold">WORD/NON-WORD</span>: press "V"</li><li><span class="large" style="color:#00bfff;font-weight:bold">WORD/NON-WORD</span>: press "B"</li><li><span class="large" style="color:#F1F227;font-weight:bold">WORD/NON-WORD</span>: press "N"</li></ul>'

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
	type: 'poldrack-instructions',
	data: {
		trial_id: "instruction"
	},
	pages: [
		'<div class=centerbox style="height:80vh">' +
		'<p class=block-text>In this game you will see words (RED, BLUE, YELLOW) and non-words (JKM, XTQZ, FPSTW) appear one at a time. The words and non-words will be coloured. For example, you may see: <span class="large" style = "color:#f64747;font-weight:bold">RED</span>, <span class="large" style="color:#f1f227;font-weight:bold">XTQZ</span>, <span class="large" style="color:#00bfff;font-weight:bold">BLUE</span> or <span class="large" style="color:#f64747;font-weight:bold">BLUE</span>.</p>' +
		'<p class=block-text>Your task is to press the button corresponding to the <strong><u>colour</u></strong> of the word.</p>' +
		'<p class=block-text>Respond as <u><strong>quickly and accurately</strong></u> as possible.</p>' +
		'<p class=block-text>The response keys are as follows:</p>' +
		response_keys +
		'<p class=block-text>If your dominant hand is your right hand, V=first finger, B=second finger, N=third finger.</p>' +
		'<p class=block-text>If your dominant hand is your left hand, V=third finger, B=second finger, N=first finger.</div>'
	],
	allow_keys: false,
	show_clickable_nav: true,
	timing_post_trial: 1000
};

var instruction_node = {
	timeline: [instructions_block],
	/* stopping criteria */
	loop_function: function(data) {
		values = data.values()
		for (i = 0; i < values.length; i++) {
			if ((values[i].trial_type == 'poldrack-instructions') && (values[i].rt != -1)) {
				rt = values[i].rt
				sumInstructTime = sumInstructTime + rt
			}
		}
		if (sumInstructTime <= instructTimeThresh * 1000) {
			feedback_instruct_text =
				'You read through the instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text = 'Done with instructions. Press <strong>enter</strong> to continue.'
			return false
		}
	}
}

var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
    	exp_id: 'stroop'
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>Thanks for playing!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0,
	on_finish: assessPerformance
};

var start_congruent_practice_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "practice_contruent_intro"
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = block-text>Let\'s start with a few WORD practice trials. Remember, press the key corresponding to the <strong><u>color</u></strong> of the word.</p><p class = block-text></p><p class = block-text>Press <strong>enter</strong> to begin the practice.</p></div>',
	cont_key: [13],
	timing_post_trial: 1000
};

var start_neutral_practice_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "practice_neutral_intro"
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = block-text>Now let\'s practice some NON-WORD trials. Remember, press the key corresponding to the <strong><u>color</u></strong> of the non-word.</p><p class = block-text></p><p class = block-text>Press <strong>enter</strong> to begin the practice.</p></div>',
	cont_key: [13],
	timing_post_trial: 1000
};

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "test_intro"
	},
	timing_response: 180000,
	text: '<div class=centerbox><p class=center-block-text>Well done! Now that you\'ve had some practice, let\'s play for real.</p>' +
	'<p class=center-block-text>On some trials, you will see words which don\'t match the colour, e.g. <span class="large" style="color:#f64747;font-weight:bold">BLUE</span>. Try to <strong>ignore the word on each trial</strong>, and press the button matching the colour. Ignore the words even if they match the colour on some (or many) trials.</p>' +
	'<p class=center-block-text>We are only interested in trials where the word doesn\'t match the colour, but you will do better on these trials if you always try to <strong>ignore the words in favour of the colours</strong>.</p>' +
	'<p class=center-block-text>You will be observed, to ensure you don\'t look away from the word or squint your eyes during the task.</p>' +
	'<p class=center-block-text>Remember to respond as <u><strong>quickly and accurately</strong></u> as you can.</p>' +
	'<p class=center-block-text>The test lasts for about 10 minutes. Press <strong>enter</strong> to begin.</p></div>',
	cont_key: [13],
	timing_post_trial: 1000,
	on_finish: function() {
		exp_stage = 'test'
	}
};

var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation"
	},
	timing_post_trial: 500,
	timing_stim: 500,
	timing_response: 500,
	on_finish: function() {
		jsPsych.data.addDataToLastTrial({'exp_stage': exp_stage})
	},
}

/* create timeline */
timeline = []
if (! (Debug & 2) ) {
  timeline.push({
    type: 'fullscreen',
    message: '<div class="instructions"><p>Welcome to the experiment.</p><p>Press the button below to begin in full screen mode.</p></div>',
    fullscreen_mode: true
  });
}

timeline.push(instruction_node)

// make practice blocks
timeline.push(start_congruent_practice_block)
makeBlock('practice', practice_congruent_stims)

timeline.push(start_neutral_practice_block)
makeBlock('practice', practice_neutral_stims)

// make test block
timeline.push(start_test_block)
makeBlock('test', test_stims)

timeline.push(end_block)


/** functions **/

// 500 + 2250 = 2750ms (max) per trial
function makeBlock(stage, stims) {
	for (i = 0; i < stims.stimulus.length; i++) {
		timeline.push(fixation_block)
		var block = {
			type: 'poldrack-categorize',
			stimulus: stims.stimulus[i],
			data: stims.data[i],
			key_answer: stims.key_answer[i],
			is_html: true,
			correct_text: '<div class = fb_box><div class = center-text><font size=20>correct</font></div></div>',
			incorrect_text: '<div class = fb_box><div class = center-text><font size=20>WRONG!</font></div></div>',
			timeout_message: '<div class = fb_box><div class = center-text><font size=20>GO FASTER!</font></div></div>',
			choices: choices,
			timing_response: 1500,
			timing_stim: -1,
			timing_feedback_duration: 500,
			show_stim_with_feedback: true,
			response_ends_trial: true,
			timing_post_trial: 250,
			on_finish: function() {
				jsPsych.data.addDataToLastTrial({
					trial_id: 'stim',
					exp_stage: stage
				})
			}
		}
		timeline.push(block)
	}
}

function makeCongruentStimuli(stimuli) {
	var config = [];
	stimuli.forEach((word, i) => {
		stimuli.forEach((colour, j) => {
			if (word == colour) {
				var stim = {
					stimulus: '<div class=centerbox><div class=stroop-stim style="font-weight:bold;color:' + colour.hex + '">' + word.colour.toUpperCase() + '</div></div>',
					data: {
						trial_id: 'stim',
						condition: 'congruent',
						stim_color: colour.colour,
						stim_word: word.colour,
						correct_response: colour.key,
						critical: true
					},
					key_answer: colour.key
				}
				config.push(stim);
			}
		});
	});
	return(config);
}

function makeIncongruentStimuli(stimuli) {
	var config = [];
	stimuli.forEach((word, i) => {
		stimuli.forEach((colour, j) => {
			if (word !== colour) {
				var stim = {
					stimulus: '<div class=centerbox><div class=stroop-stim style="font-weight:bold;color:' + colour.hex + '">' + word.colour.toUpperCase() + '</div></div>',
					data: {
						trial_id: 'stim',
						condition: 'incongruent',
						stim_color: colour.colour,
						stim_word: word.colour,
						correct_response: colour.key,
						critical: true
					},
					key_answer: colour.key
				}
				config.push(stim);
			}
		});
	});
	return(config);
}

function makeNeutralStimuli(stimuli) {
	var config = [];
	stimuli.forEach((word, i) => {
		stimuli.forEach((colour, j) => {
			var stim = {
				stimulus: '<div class=centerbox><div class=stroop-stim style="font-weight:bold;color:' + colour.hex + '">' + word.neutral.toUpperCase() + '</div></div>',
				data: {
					trial_id: 'stim',
					condition: 'neutral',
					stim_color: colour.colour,
					stim_word: word.neutral,
					correct_response: colour.key,
					critical: true
				},
				key_answer: colour.key
			}
			config.push(stim);
		});
	});
	return(config);
}

function assessPerformance() {
	var experiment_data = jsPsych.data.get().filter({trial_type: 'poldrack-categorize'}).values()
	var missed_count = 0
	var trial_count = 0
	var correct_count = 0
	var rt_array = []
	var rt = 0
		//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	for (var k = 0; k < choices.length; k++) {
		choice_counts[choices[k]] = 0
	}
	for (var i = 0; i < experiment_data.length; i++) {
		if (experiment_data[i].possible_responses != 'none') {
			trial_count += 1
			rt = experiment_data[i].rt
			key = experiment_data[i].key_press
			correct = experiment_data[i].correct
			choice_counts[key] += 1
			if(correct) correct_count += 1
			if (rt == -1) {
				missed_count += 1
			} else {
				rt_array.push(rt)
			}
		}
	}
	//calculate average rt
	var avg_rt = -1
	if (rt_array.length !== 0) {
		avg_rt = math.median(rt_array)
	} 
	//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > trial_count * 0.85) {
			responses_ok = false
		}
	})
	var missed_pct = missed_count/trial_count
	var accuracy = correct_count/trial_count
	
	credit_var = (missed_pct < 0.4 && avg_rt > 200 && responses_ok && accuracy > 0.6)
	jsPsych.data.addDataToLastTrial({"credit_var": credit_var})
	
	results = {
			missed_pct: missed_pct, 
			accuracy: accuracy, 
			credit_var: credit_var
			};
	
	return(results);
}