var defaultCommitMessage = '';

var currentSrc = null;
var currentDst = null;
var currentRevset = null;
var currentCommits = [];

$(function() {
  populateRepositories('source', Object.keys(RULES));
  $('#source').change(populateDestionations);
  $('#source').change(refreshCommitInfo);
  $('#source').change(uiRevset);
  $('#revsets').keyup(uiRevset);
  $('#destination').change(uiGoToStep2);
  $('#revset-lookup').click(revsetLookup);
  $('#go-to-step-2').click(goToStep2);
  $('#transplant').click(transplant);
});

function populateDestionations() {
  var source = $('#source').val();
  var destionations = RULES[source] || [];
  populateRepositories('destination', destionations);
}

function populateRepositories(id, repositories) {
  $('#' + id + ' option:gt(0)').remove();
  var el = $('#' + id);
  repositories.forEach(function(name) {
    var info = getRepositoryInfo(name);
    el.append($('<option></option>').text(info).attr('value', name));
  });
}

function uiRevset() {
  var src = $('#source').val();
  var revsets = $('#revsets').val();

  if (!src || !revsets) {
    $('#revset-lookup').addClass('disabled');
  } else {
    $('#revset-lookup').removeClass('disabled');
  }
}

function revsetLookup(e) {
  e.preventDefault();

  var src = $('#source').val();
  var revsets = $('#revsets').val();

  if (!src || !revsets) {
    return;
  }

  revsets = parseRevsets(revsets);

  currentCommits = [];
  uiGoToStep2();
  $('#revset-lookup').button('loading');
  var url = '/repositories/' + src + '/commits/?revsets=' + encodeURIComponent(JSON.stringify(revsets));
  $.get(url, function(data, status, xhr) {
    populateCommits(data.commits);
  }).fail(function(xhr, status, error) {
    var json = xhr.responseJSON;
    if (!json || !json.error) {
      showCommitsError(xhr.responseText);
    } else {
      showCommitsError(json.error);
    }
  }).always(function() {
    $('#revset-lookup').button('reset');
  });
}

function populateCommits(commits) {
  var table = $('#table-commits');
  table.find('tbody tr').remove();
  commits.forEach(function(commit) {
    var message = commit.message;
    var offset = message.indexOf("\n");
    if (offset !== -1) {
      message = message.substr(1, offset - 1);
    }

    var row = '<tr>';
    row += '<td>' + commit.node.substr(0, 12) + '</td>';
    row += '<td>' + commit.date + '</td>';
    row += '<td>' + commit.author + '</td>';
    row += '<td>' + message + '</td>';
    row += '</tr>';
    table.find('tbody').append(row);
  });

  currentCommits = commits;
  uiGoToStep2();
}

function showCommitsError(message) {
  var table = $('#table-commits');
  table.find('tbody tr').remove();
  var row = '<tr class="danger">';
  row += '<td colspan="4">';
  row += message;
  row += '</td>';
  row += '</tr>';
  table.find('tbody').append(row);
}

function uiGoToStep2() {
  var dst = $('#destination').val();
  if (!currentCommits || currentCommits.length < 1 || !dst) {
    $('#go-to-step-2').addClass('disabled');
  } else {
    $('#go-to-step-2').removeClass('disabled');
  }
}

function goToStep2(e) {
  e.preventDefault();

  currentSrc = $('#source').val();
  currentDst = $('#destination').val();

  $('#transplant-step-1').addClass('hidden');
  $('#transplant-step-2').removeClass('hidden');

  var srcInfo = getRepositoryInfo(currentSrc);
  var dstInfo = getRepositoryInfo(currentDst);

  $('#step-2-src').text(srcInfo);
  $('#step-2-dst').text(dstInfo);

  var stepTwoCommits = $('#transplant-step-2-commits');
  currentCommits.forEach(function(commit) {
    var commitId = commit.node.substr(0, 12);
    var author = commit.author;
    if (commit.author_email) {
      author += ' <' + commit.author_email + '>';
    }

    var uiCommitId = $('<div />').text(commitId).html();
    var uiAuthor = $('<div />').text(author).html();
    var uiDate = $('<div />').text(commit.date).html();
    var uiMessage = $('<div />').text(commit.message).html();

    var row = '<div class="panel panel-default">';
    row += '<div class="panel-heading">Commit ' + uiCommitId + '</div>';
    row += '<div class="panel-body">';
      row += '<div class="form-group">';
        row += '<label for="date-' + uiCommitId + '" class="control-label">Date</label>';
        row += '<p id="date-' + uiCommitId + '" class="form-control-static">' + uiDate + '</p>';
      row += '</div>';
      row += '<div class="form-group">';
        row += '<label for="author-' + uiCommitId + '" class="control-label">Author</label>';
        row += '<p id="author-' + uiCommitId + '" class="form-control-static">' + uiAuthor + '</p>';
      row += '</div>';
      row += '<div class="form-group">';
          row += '<label for="message-' + uiCommitId + '" class="control-label">Message</label>';
          row += '<textarea id="message-' + uiCommitId + '" rows="3" class="form-control">' + uiMessage + '</textarea>';
      row += '</div>';
    row += '</div>'; // panel-body
    row += '</div>'; // panel
    stepTwoCommits.append(row);
  });
}

function refreshCommitInfo() {
  var src = $('#source').val();
  var commitId = $('#commit').val();

  if (!src || !commitId) {
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

  var payload = {
    src: currentSrc,
    dst: currentDst,
    commits: []
  };

  currentCommits.forEach(function(commit) {
    var commitId = commit.node.substr(0, 12);
    var uiCommitId = $('<div />').text(commitId).html();
    payload.commits.push({
      id: commit.node,
      message: $('#message-' + uiCommitId).val()
    });
  });

  $('#transplant').button('loading');

  $.ajax('/transplant', {
    type: 'POST',
    data: JSON.stringify(payload),
    contentType: 'application/json'
  }).success(function(data, status, xhr) {
    var msg = 'Success: new tip = ' + data.tip;
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

function parseRevsets(rawRevsets) {
  var revsets = rawRevsets.split("\n")
    .map(function(s) {
      return String.prototype.trim.call(s)
    })
    .filter(function(s) {
      return s;
    });
  return revsets;
}

function getRepositoryInfo(name) {
  var path = REPOSITORIES[name];
  var info = name + ' (' + path + ')';
  return info;
}
