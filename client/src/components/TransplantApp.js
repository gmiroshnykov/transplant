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
      revsets: [],
      translpantInProgress: false,
      result: null,
      done: false
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

  handleTransplant: function() {
    this.setState({
      translpantInProgress: true,
      result: null,
      done: false
    });

    var self = this;
    setTimeout(function() {
      self.setState({
        translpantInProgress: false,
        result: {
          alert: 'success',
          message: 'Done'
        },
        done: true
      });
    }, 3000);
  },

  handleReset: function() {
    this.setState({
      revsets: [],
      translpantInProgress: false,
      result: null,
      done: false
    });
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
        <div>
          {this.renderResult()}
          {this.renderButton()}
        </div>
      </div>
    );
  },

  renderButton: function() {
    return !this.state.done
      ? this.renderTransplantButton()
      : this.renderResetButton()
  },

  renderTransplantButton: function() {
    if (this.state.revsets.length < 1) {
      return;
    }

    var translpantInProgress = this.state.translpantInProgress;
    var disabled = translpantInProgress;
    var text = 'Transplant';
    if (translpantInProgress) {
      text = 'Transplanting...';
    }

    return (
      <button type="button"
        disabled={disabled}
        onClick={this.handleTransplant}
        className="btn btn-primary btn-lg col-md-2 pull-right">{text}</button>
    );
  },

  renderResetButton: function() {
    return (
      <button type="button"
        onClick={this.handleReset}
        className="btn btn-warning btn-lg col-md-2 pull-right">Reset</button>
    )
  },

  renderResult: function() {
    var result = this.state.result;
    if (!result) {
      return;
    }

    var classes = ['alert', 'pull-left'];
    classes.push('alert-' + result.alert);

    return (
      <div className={classes.join(' ')} role="alert">{result.message}</div>
    );
  },
});

module.exports = TransplantApp;
