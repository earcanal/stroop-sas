/* ************************************ */
/* Define helper functions */
/* ************************************ */
function assessPerformance() {
	var experiment_data = jsPsych.data.getTrialsOfType('poldrack-categorize')
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
	var attn_correct_pct = evalAttentionChecks()
	
	credit_var = (missed_pct < 0.4 && avg_rt > 200 && responses_ok && accuracy > 0.6)
	jsPsych.data.addDataToLastTrial({"credit_var": credit_var})
	
	results = {
			missed_pct: missed_pct, 
			accuracy: accuracy, 
			attn_correct_pct: attn_correct_pct, 
			credit_var: credit_var
			};
	
	return(results);
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
		'</p></div>'
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0

/*
/* High contrast, color-blind safe colors
/*	RED = #f64747
/*	BLUE = #00bfff
/*	YELLOW = #F1F227
*/

// task specific variables
var congruent_stim = [{
	stimulus: '<div class = centerbox><div class = stroop-stim style = "font-weight:bold;color:#f64747">RED</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'congruent',
		stim_color: 'red',
		stim_word: 'red',
		correct_response: 86 // V
	},
	key_answer: 86
}, {
	stimulus: '<div class = centerbox><div class = stroop-stim style = "font-weight:bold;color:#00bfff">BLUE</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'congruent',
		stim_color: 'blue',
		stim_word: 'blue',
		correct_response: 66 // B
	},
	key_answer: 66
},{
	stimulus: '<div class = centerbox><div class = stroop-stim style = "font-weight:bold;color:#F1F227">YELLOW</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'congruent',
		stim_color: 'yellow',
		stim_word: 'yellow',
		correct_response: 78 // N
	},
	key_answer: 78
}];

var incongruent_stim = [{
	stimulus: '<div class = centerbox><div class = stroop-stim style = "font-weight:bold;color:#f64747">BLUE</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'incongruent',
		stim_color: 'red',
		stim_word: 'blue',
		correct_response: 86
	},
	key_answer: 86
}, {
	stimulus: '<div class = centerbox><div class = stroop-stim style = "font-weight:bold;color:#f64747">YELLOW</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'incongruent',
		stim_color: 'red',
		stim_word: 'yellow',
		correct_response: 86
	},
	key_answer: 86
}, {
	stimulus: '<div class = centerbox><div class = stroop-stim style = "font-weight:bold;color:#00bfff">RED</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'incongruent',
		stim_color: 'blue',
		stim_word: 'red',
		correct_response: 66
	},
	key_answer: 66
}, {
	stimulus: '<div class = centerbox><div class = stroop-stim style = "font-weight:bold;color:#00bfff">YELLOW</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'incongruent',
		stim_color: 'blue',
		stim_word: 'yellow',
		correct_response: 66
	},
	key_answer: 66
}, {
	stimulus: '<div class = centerbox><div class = stroop-stim style = "font-weight:bold;color:#F1F227">RED</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'incongruent',
		stim_color: 'yellow',
		stim_word: 'red',
		correct_response: 78
	},
	key_answer: 78
}, {
	stimulus: '<div class = centerbox><div class = stroop-stim style = "font-weight:bold;color:#F1F227">BLUE</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'incongruent',
		stim_color: 'yellow',
		stim_word: 'blue',
		correct_response: 89
	},
	key_answer: 89
}];
// High proportion congruency: twice as many congruent as incongruent
var stims = [].concat(congruent_stim, congruent_stim, congruent_stim, congruent_stim, incongruent_stim)
var practice_len = 18
var practice_stims = jsPsych.randomization.repeat(stims, practice_len / 18, true)
var exp_len = 72
var test_stims = jsPsych.randomization.repeat(stims, exp_len / 18, true)
var choices = [66, 82, 89]
var exp_stage = 'practice'

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */

/* define static blocks */
var response_keys =
	'<ul class="list-text"><li><span class = "large" style = "color:#f64747;font-weight:bold">WORD</span>: "R key"</li><li><span class = "large" style = "color:#00bfff;font-weight:bold">WORD</span>: "B key"</li><li><span class = "large" style = "color:#F1F227;font-weight:bold">WORD</span>: "Y key"</li></ul>'


var feedback_instruct_text =
	'<div class = centerbox><p class = block-text>Let\'s play a color matching game! Focus will be important here, so before we begin please make sure you\'re ready for <u><strong>five minutes</strong></u> of uninterrupted game time!</p> <p class = block-text>Press <strong>enter</strong> to continue.</p></div>'
var feedback_instruct_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	cont_key: [13],
	text: getInstructFeedback,
	timing_post_trial: 0,
	timing_response: 180000
};

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
	type: 'poldrack-instructions',
	data: {
		trial_id: "instruction"
	},
	pages: [
		'<div class = centerbox style="height:80vh"><p class = block-text>In this game you will see "color" words (RED, BLUE, GREEN, YELLOW) appear one at a time. The "ink" of the words also will be colored. For example, you may see: <span class = "large" style = "color:#f64747;font-weight:bold">RED</span>, <span class = "large" style = "color:#00bfff;font-weight:bold">BLUE</span> or <span class = "large" style = "color:#f64747;font-weight:bold">BLUE</span>.</p><p class = block-text>Your task is to press the button corresponding to the <strong><u>font color</u></strong> of the word. Respond as <u><strong>quickly and accurately</strong></u> as possible. The response keys are as follows:</p>' +
		response_keys + '</div>'
	],
	allow_keys: false,
	show_clickable_nav: true,
	timing_post_trial: 1000
};

var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
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

var start_practice_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "practice_intro"
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = block-text>Let\'s start with a few practice trials. Remember, press the key corresponding to the <strong><u>font color</u></strong> of the word. </p><p class = block-text></p><p class = block-text>Press <strong>enter</strong> to begin the practice.</p></div>',
	cont_key: [13],
	timing_post_trial: 1000
};

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "test_intro"
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>Great job! Now that you\'ve had a bit of practice, let\'s play for real this time. Remember to respond as <u><strong>quickly and accurately</strong></u> as you can. </p><p class = center-block-text>Press <strong>enter</strong> to begin the test.</p></div>',
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
timeline.push(start_practice_block)
	/* define test trials */
for (i = 0; i < practice_len; i++) {
	timeline.push(fixation_block)
	var practice_block = {
		type: 'poldrack-categorize',
		practice_trial: i,
		stimulus: practice_stims.stimulus[i],
		data: practice_stims.data[i],
		key_answer: practice_stims.key_answer[i],
		is_html: true,
		correct_text: '<div class = fb_box><div class = center-text><font size = 20>correct</font></div></div>',
		incorrect_text: '<div class = fb_box><div class = center-text><font size = 20>WRONG!</font></div></div>',
		timeout_message: '<div class = fb_box><div class = center-text><font size = 20>GO FASTER!</font></div></div>',
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
				exp_stage: 'practice'
			})
		}
	}
	timeline.push(practice_block)
}

timeline.push(start_test_block)
	/* define test trials */
for (i = 0; i < exp_len; i++) {
	timeline.push(fixation_block)
	var test_block = {
		type: 'poldrack-categorize',
		stimulus: test_stims.stimulus[i],
		data: test_stims.data[i],
		key_answer: test_stims.key_answer[i],
		is_html: true,
		correct_text: '<div class = fb_box><div class = center-text><font size = 20>correct</font></div></div>',
		incorrect_text: '<div class = fb_box><div class = center-text><font size = 20>WRONG!</font></div></div>',
		timeout_message: '<div class = fb_box><div class = center-text><font size = 20>GO FASTER!</font></div></div>',
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
				exp_stage: 'test'
			})
		}
	}
	timeline.push(test_block)
}
timeline.push(end_block)