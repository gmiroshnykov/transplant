/**
 * @jsx React.DOM
 */

var React = require('react'),
    _ = require('underscore');
var TransplantForm = require('./TransplantForm');
    TransplantRevsets = require('./TransplantRevsets');

var TransplantApp = React.createClass({
  getInitialState: function() {
    return {
      revsets: [{
        revset: 'tip',
        squash: false,
        squashedMessage: null,
        commits: [{
          node: 'deadbeaf1',
          date: null,
          message: 'Hello World!',
          author: 'George Miroshnykov',
          author_email: 'gmiroshnykov@mozilla.com'
        }, {
          node: 'deadbeaf2',
          date: null,
          message: 'Hello World!',
          author: null,
          author_email: null
        }]
      }, {
        revset: 'top',
        squash: true,
        squashedMessage: null,
        commits: [{
          node: 'deadbeaf1',
          date: null,
          message: 'Hello World!',
          author: null,
          author_email: null
        }, {
          node: 'deadbeaf2',
          date: null,
          message: 'Hello World!',
          author: null,
          author_email: null
        }]
      }]
    };
  },

  handleAddRevset: function(revset) {
    revset.squash = false;
    revset.squashedMessage = null;

    this.state.revsets.push(revset);
    this.forceUpdate();
  },

  handleDeleteRevset: function(revsetId) {
    this.state.revsets = _.reject(this.state.revsets, _.matches({revset: revsetId}));
    this.forceUpdate();
  },

  handleChangeSquash: function(revsetId, flag) {
    var revset = _.findWhere(this.state.revsets, {revset: revsetId});
    if (!revset) {
      return;
    }

    revset.squash = flag;
    this.forceUpdate();
  },

  handleChangeSquashedMessage: function(revsetId, squashedMessage) {
    var revset = _.findWhere(this.state.revsets, {revset: revsetId});
    if (!revset) {
      return;
    }

    revset.squashedMessage = squashedMessage;
    this.forceUpdate();
  },

  handleChangeCommit: function(revsetId, commitId, newCommit) {
    var revset = _.findWhere(this.state.revsets, {revset: revsetId});
    if (!revset) {
      return;
    }

    var oldCommit = _.findWhere(revset.commits, {node: commitId});
    if (!oldCommit) {
      return;
    }

    var index = _.indexOf(revset.commits, oldCommit);
    if (index === -1) {
      return;
    }

    revset.commits[index] = newCommit;
    this.forceUpdate();
  },

  render: function() {
    return (
      <div className="transplantApp clearfix">
        <h1>Transplant</h1>
        <TransplantForm
          repositories={this.props.repositories}
          revsets={this.state.revsets}
          onAddRevset={this.handleAddRevset} />
        <TransplantRevsets
          revsets={this.state.revsets}
          onChangeSquash={this.handleChangeSquash}
          onChangeCommit={this.handleChangeCommit}
          onChangeSquashedMessage={this.handleChangeSquashedMessage}
          onDelete={this.handleDeleteRevset} />
        {this.renderSubmit()}
      </div>
    );
  },

  renderSubmit: function() {
    if (this.state.revsets.length < 1) {
      return;
    }

    return (
      <input type="submit" value="Transplant"
        className="btn btn-primary btn-lg pull-right" />
    );
  }
});

module.exports = TransplantApp;
