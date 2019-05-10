/* jspsych-text.js
 * Josh de Leeuw
 *
 * This plugin displays text (including HTML formatted strings) during the experiment.
 * Use it to show instructions, provide performance feedback, etc...
 *
 * documentation: docs.jspsych.org
 *
 * Modified by Ian Eisenberg to allow timing response to be set
 */

jsPsych.plugins["poldrack-text"] = (function() {

  var plugin = {};
  
  plugin.info = {
    name: 'poldrack-text',
    parameters: {
      text: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        default: undefined
      },
      cont_key: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        default: undefined
      },
      timing_post_trial: {
        type: jsPsych.plugins.parameterType.INT,
        default: 0
      },
      timing_response: {
        type: jsPsych.plugins.parameterType.INT,
        default: 180000
      }
    }
  }

  plugin.trial = function(display_element, trial) {
    trial.timing_response = trial.timing_response || -1;
    trial.cont_key = trial.cont_key || [];
    trial.timing_post_trial = (typeof trial.timing_post_trial === 'undefined') ? 1000 : trial.timing_post_trial;

    // set the HTML of the display target to replaced_text.
    display_element.innerHTML = trial.text;

    var after_response = function(info) {
      clearTimeout(t1);
      display_element.innerHTML = ''; // clear the display

      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      var block_duration = trial.timing_response
      if (info.rt != -1) {
          block_duration = info.rt
      }

      var trialdata = {
        "text": trial.text,
        "rt": info.rt,
        "key_press": info.key,
        "block_duration": block_duration,
        "timing_post_trial": trial.timing_post_trial
      }

      jsPsych.finishTrial(trialdata);

    };

    var mouse_listener = function(e) {
      clearTimeout(t1);
      var rt = (new Date()).getTime() - start_time;

      display_element.unbind('click', mouse_listener);

      after_response({
        key: 'mouse',
        rt: rt
      });

    };

    // check if key is 'mouse' 
    if (trial.cont_key == 'mouse') {
      display_element.click(mouse_listener);
      var start_time = (new Date()).getTime();
    } else {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.cont_key,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }

    // end trial if time limit is set
    if (trial.timing_response > 0) {
      var t1 = setTimeout(function() {
        after_response({
          key: -1,
          rt: -1
        });
      }, trial.timing_response);
    }

  };

  return plugin;
})();
