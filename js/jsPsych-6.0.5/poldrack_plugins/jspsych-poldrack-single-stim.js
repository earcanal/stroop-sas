/**
 * jspsych-poldrack-single-stim
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 * 
 * Modified by Ian Eisenberg to record more trial parameters
 **/


jsPsych.plugins["poldrack-single-stim"] = (function() {

  var plugin = {};

  // FIXME: Is this still required for image stimuli?
  //jsPsych.pluginAPI.registerPreload('poldrack-single-stim', 'stimulus', 'image');

  plugin.info = {
    name: 'poldrack-single-stim',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        default: undefined
      },
      is_html: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: undefined
      },
      choices: {
        type: jsPsych.plugins.parameterType.STRING,
        default: undefined
      },
      timing_response: {
        type: jsPsych.plugins.parameterType.INT,
        default: 180000
      },
      timing_post_trial: {
        type: jsPsych.plugins.parameterType.INT,
        default: 0
      },
      timing_stim: {
        type: jsPsych.plugins.parameterType.INT,
        default: 0
      }
    }
  }

  plugin.trial = function(display_element, trial) {
    // set default values for the parameters
    trial.choices = trial.choices || [];
    trial.response_ends_trial = (typeof trial.response_ends_trial == 'undefined') ? false : trial.response_ends_trial;
    trial.timing_stim = trial.timing_stim || -1;
    trial.timing_response = trial.timing_response || -1;
    trial.timing_post_trial = (typeof trial.timing_post_trial === 'undefined') ? 1000 : trial.timing_post_trial;
    trial.is_html = (typeof trial.is_html == 'undefined') ? false : trial.is_html;
    trial.prompt = trial.prompt || "";

    // this array holds handlers from setTimeout calls
    // that need to be cleared if the trial ends early
    var setTimeoutHandlers = [];

    // display stimulus
    var e;
    if (!trial.is_html) {
      e = document.createElement('img');
      e.setAttribute("src", trial.stimulus);
    } else {
      e = document.createElement('div');
      e.innerHTML = trial.stimulus;
    }
    e.setAttribute('id', 'jspsych-poldrack-categorize-stimulus');
    display_element.append(e);

    //show prompt if there is one
    if (trial.prompt !== "") {
      display_element.append(trial.prompt);
    }

    // store response
    var response = {
      rt: -1,
      key: -1
    };

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      for (var i = 0; i < setTimeoutHandlers.length; i++) {
        clearTimeout(setTimeoutHandlers[i]);
      }

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      //calculate stim and block duration
      var stim_duration = trial.timing_stim
      var block_duration = trial.timing_response
      if (trial.response_ends_trial & response.rt != -1) {
          block_duration = response.rt
      }
      if (stim_duration != -1) {
        stim_duration = Math.min(block_duration,trial.timing_stim)
      } else {
        stim_duration = block_duration
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key,
        "possible_responses": trial.choices,
        "stim_duration": stim_duration,
        "block_duration": block_duration,
        "timing_post_trial": trial.timing_post_trial
      };

      //jsPsych.data.write(trial_data);

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      $("#jspsych-poldrack-single-stim-stimulus").addClass('responded');

      // only record the first response
      if (response.key == -1) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (JSON.stringify(trial.choices) != JSON.stringify(["none"])) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }

    // hide image if timing is set
    if (trial.timing_stim > 0) {
      var t1 = setTimeout(function() {
        $('#jspsych-poldrack-single-stim-stimulus').css('visibility', 'hidden');
      }, trial.timing_stim);
      setTimeoutHandlers.push(t1);
    }

    // end trial if time limit is set
    if (trial.timing_response > 0) {
      var t2 = setTimeout(function() {
        end_trial();
      }, trial.timing_response);
      setTimeoutHandlers.push(t2);
    }

  };

  return plugin;
})();