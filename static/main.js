var defaultCommitMessage = '';

$(function() {
  populateSelect('source', Object.keys(RULES));
  $('#source').change(populateDestionations);
  $('#source').change(refreshCommitInfo);
  $('#destination').change(refreshCommitInfo);
  $('#transplant-form').submit(transplant);
  $('#commit').keyup(_.debounce(refreshCommitInfo, 500));
});

function populateDestionations() {
  var source = $('#source').val();
  var destionations = RULES[source] || [];
  populateSelect('destination', destionations);
}

function populateSelect(id, values) {
  $('#' + id + ' option:gt(0)').remove();
  var el = $('#' + id);
  values.forEach(function(value) {
    el.append($('<option></option>').text(value));
  });
}

function refreshCommitInfo() {
  var src = $('#source').val();
  var dst = $('#destination').val();
  var commitId = $('#commit').val();

  if (!src || !dst || !commitId) {
    return;
  }

  console.log('commit ID: %s', commitId);
  showCommitInfoProgress();
  setDefaultCommitMessage('');

  var url = '/repositories/' + src + '/commits/' + commitId;
  $.get(url, function(data, status, xhr) {
    showCommitInfoSuccess();
    setDefaultCommitMessage(data.message);
  }).fail(function(xhr, status, error) {
    showCommitInfoError();
  });
}

function showCommitInfoProgress() {
  resetCommitInfoStatus();

  $('#commit-form-group').addClass('has-feedback');
  $('#commit-info-progress').removeClass('hidden');
}

function showCommitInfoSuccess() {
  resetCommitInfoStatus();

  $('#commit-form-group')
    .addClass('has-feedback')
    .addClass('has-success');
  $('#commit-info-success').removeClass('hidden');
}

function showCommitInfoError() {
  resetCommitInfoStatus();

  $('#commit-form-group')
    .addClass('has-feedback')
    .addClass('has-error');
  $('#commit-info-error').removeClass('hidden');
}

function resetCommitInfoStatus() {
  $('#commit-form-group')
    .removeClass('has-feedback')
    .removeClass('has-success')
    .removeClass('has-error');

  $('#commit-info-progress').addClass('hidden');
  $('#commit-info-success').addClass('hidden');
  $('#commit-info-error').addClass('hidden');
}

function setDefaultCommitMessage(message) {
  defaultCommitMessage = message;
  $('#message').val(message);
}

function transplant(e) {
  e.preventDefault();

  var src = $('#source').val();
  var dst = $('#destination').val();
  var commit = $('#commit').val();
  var message = $('#message').val();

  var payload = {
    src: src,
    dst: dst,
    commit: commit
  };

  if (message.length > 0 && message != defaultCommitMessage) {
    payload.message = message;
  }

  $('#transplant').button('loading');

  $.post('/transplant', payload, function(data, status, xhr) {
    var msg = 'Tip: ' + data.tip;
    showSuccess(msg);
  }).fail(function(xhr, status, error) {
    var msg = xhr.responseText;
    var json = xhr.responseJSON;
    if (json && json.error) {
      msg = 'Error: ' + json.error + "<br />\n";
      if (json.details) {
        msg += "Details:<br />\n<pre>";
        msg += "command: " + json.details.cmd.join(' ') + "\n";
        msg += "returncode: " + json.details.returncode + "\n";
        msg += "stdout: " + json.details.stdout + "\n";
        msg += "stderr: " + json.details.stderr + "\n";
        msg += "</pre>";
      }
      showHtmlError(msg);
    } else {
      showPlainError(msg);
    }
  }).always(function() {
    $('#transplant').button('reset');
  });
}

function showSuccess(msg) {
  $('#msgSuccess').html(msg).show();
  $('#msgError').html('').hide();
}

function showHtmlError(msg) {
  $('#msgError').html(msg).show();
  $('#msgSuccess').html('').hide();
}

function showPlainError(msg) {
  $('#msgError').text(msg).show();
  $('#msgSuccess').html('').hide();
}
