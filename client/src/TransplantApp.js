/**
 * @jsx React.DOM
 */

var React = require('react');
var TransplantForm = require('./TransplantForm'),
    TransplantRevsets = require('./TransplantRevsets');

var TransplantApp = React.createClass({
  getInitialState: function() {
    return {
      revsets: []
    };
  },

  handleAddRevset: function(revset) {
    console.log('handleAddRevset:', revset);
  },

  render: function() {
    return (
      <div className="transplantApp">
        <h1>Transplant</h1>
        <TransplantForm
          repositories={this.props.repositories}
          onAddRevset={this.handleAddRevset} />
        <TransplantRevsets
          revsets={this.state.revsets} />
      </div>
    );
  }
});

module.exports = TransplantApp;
