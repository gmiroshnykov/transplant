/**
 * @jsx React.DOM
 */

var React = require('react')

var RevsetField = React.createClass({
  getInitialState: function() {
    return {
      value: ''
    };
  },

  handleKeyDown: function(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.handleAdd();
    }
  },

  handleChange: function(e) {
    var value = e.target.value.trim();
    this.setState({value: value});
  },

  handleAdd: function() {
    if (this.state.value === '') {
      return;
    }

    this.props.onAdd(this.state.value);
  },

  reset: function() {
    this.setState({value: ''});
    var node = this.refs.revset.getDOMNode();
    node.focus();
  },

  render: function() {
    var buttonText = 'Add';

    var canAdd = this.props.canAdd;
    var addInProgress = this.props.addInProgress;
    if (addInProgress) {
      buttonText = 'Adding...';
      canAdd = false;
    }

    var value = this.state.value;
    var addButtonDisabled = (canAdd && value) ? '' : 'disabled';

    return (
      <div className="form-group">
        <label htmlFor="revset">Revset</label>
        <div className="input-group">
          <input
            ref="revset"
            placeholder="Revset"
            type="text"
            value={value}
            onKeyDown={this.handleKeyDown}
            onChange={this.handleChange}
            className="form-control" />
          <span className="input-group-btn">
            <button onClick={this.handleAdd}
              disabled={addButtonDisabled}
              type="button"
              style={{width: '100px'}}
              className="btn btn-default">{buttonText}</button>
          </span>
        </div>
      </div>
    );
  }
});

module.exports = RevsetField;
