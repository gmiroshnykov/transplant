/**
 * @jsx React.DOM
 */

var React = require('react'),
    _ = require('underscore');
var EditableCommit = require('./EditableCommit');

var SQUASH_SEPARATOR = "\n----------------\n";

var TransplantRevset = React.createClass({
  generateSquashedMessage: function() {
    return _.pluck(this.props.revset.commits, 'message').join(SQUASH_SEPARATOR);
  },

  handleChangeSquash: function(e) {
    var flag = e.target.checked;
    this.props.onChangeSquash(flag);
  },

  handleChangeSquashedMessage: function(e) {
    var squashedMessage = e.target.value;
    this.props.onChangeSquashedMessage(squashedMessage);
  },

  render: function() {
    var revset = this.props.revset;
    var commitsCount = revset.commits.length;

    return (
      <div className="panel panel-default">
        <div className="panel-heading clearfix">
            <div className="pull-left">
              Revision Set <code>{revset.revset}</code> (commits: {commitsCount})
            </div>
            <div className="form-inline pull-right" role="form">
              {this.renderSquashCheckbox()}
              <button type="button" className="btn btn-danger btn-xs"
                onClick={this.props.onDelete}>delete</button>
            </div>
        </div>
        <div className="list-group">
          {revset.squash ? this.renderSquashedForm() : this.renderCommits()}
        </div>
      </div>
    );
  },

  renderSquashCheckbox: function() {
    var revset = this.props.revset;
    if (revset.commits.length < 2) {
      return;
    }

    return (
      <div className="checkbox" style={{'padding-right': 15}}>
        <label>
          <input type="checkbox"
            checked={revset.squash}
            onChange={this.handleChangeSquash} /> squash
        </label>
      </div>
    );
  },

  renderSquashedForm: function() {
    var squashedMessage = this.props.revset.squashedMessage;
    if (squashedMessage === null) {
      squashedMessage = this.generateSquashedMessage();
    }

    return (
      <div className="list-group-item">
        <form role="form">
          <div className="form-group">
            <label>Squashed message</label>
            <textarea className="form-control" rows="5"
              value={squashedMessage}
              onChange={this.handleChangeSquashedMessage} />
          </div>
        </form>
      </div>
    );
  },

  renderCommits: function() {
    var self = this;
    var revset = this.props.revset;
    return revset.commits.map(function(commit) {
      return (
        <div key={commit.node} className="list-group-item">
          <EditableCommit
            commit={commit}
            onChange={_.partial(self.props.onChangeCommit, commit.node)} />
        </div>
      );
    });
  },
});

module.exports = TransplantRevset;
