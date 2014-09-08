/**
 * @jsx React.DOM
 */

var React = require('react');
var TransplantRevsets = React.createClass({
  render: function() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">Revision Sets to transplant</div>
        <div className="panel-body">
          No revision sets.
        </div>
      </div>
    );
  }
});

module.exports = TransplantRevsets;
