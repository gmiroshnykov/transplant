$(function() {
  populateSelect('source', Object.keys(RULES));
  $('#source').change(populateDestionations);
  $('#transplant-form').submit(transplant);
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

function transplant(e) {
  e.preventDefault();

  var src = $('#source').val();
  var dst = $('#destination').val();
  var rev = $('#revision').val();
  var payload = {
    src: src,
    dst: dst,
    rev: rev
  };

  $('#transplant').button('loading');

  $.post('/transplant', payload, function(data, status, xhr) {
    var msg = 'Tip: ' + data.tip;
    showSuccess(msg);
  }).fail(function(xhr, status, error) {
    var msg = xhr.responseText;
    showError(msg);
  }).always(function() {
    $('#transplant').button('reset');
  });
}

function showSuccess(msg) {
  $('#msgSuccess').text(msg).show();
  $('#msgError').text('').hide();
}

function showError(msg) {
  $('#msgError').text(msg).show();
  $('#msgSuccess').text('').hide();
}
