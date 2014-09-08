var $ = require('jquery');

exports.lookup = function(repository, revset, callback) {
  var url = '/repositories/' + repository + '/lookup';
  var data = {revset: revset};
  $.ajax(url, {
    data: data
  }).done(function(data, status, xhr) {
    return callback(null, data);
  }).fail(handleFail(callback));
};

function handleFail(callback) {
  return function(xhr, status, error) {
    var data = $.parseJSON(xhr.responseText);
    return callback(new Error(data.error));
  };
}
