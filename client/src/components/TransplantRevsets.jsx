/**
 * @jsx React.DOM
 */

var React = require('react'),
    _ = require('underscore');
var TransplantRevset = require('./TransplantRevset.jsx');

var TransplantRevsets = React.createClass({
  render: function() {
    var self = this;
    return (
      <div className="transplantRevsets">
        {this.props.revsets.map(function(revset) {
          return (
            <TransplantRevset key={revset.revset}
              revset={revset}
              onChangeSquash={_.partial(self.props.onChangeSquash, revset.revset)}
              onChangeCommit={_.partial(self.props.onChangeCommit, revset.revset)}
              onChangeSquashedMessage={_.partial(self.props.onChangeSquashedMessage, revset.revset)}
              onDelete={_.partial(self.props.onDelete, revset.revset)} />
          );
        })}
      </div>
    );
  }
});

module.exports = TransplantRevsets;
