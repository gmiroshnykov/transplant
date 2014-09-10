/**
 * @jsx React.DOM
 */

var React = require('react');

var Alert = React.createClass({
  handleClose() {
    this.props.onClose(this.props.key);
  },

  render() {
    var classes = ['alert'];

    var dismissable = this.props.dismissable;
    if (dismissable) {
      classes.push('alert-warning');
    }

    var type = this.props.type || 'info';
    classes.push('alert-' + type);

    return (
      <div ref="alert" role="alert" className={classes.join(' ')}>
        <button type="button" className="close"
          onClick={this.handleClose}><span aria-hidden="true">&times;</span><span className="sr-only">Close</span></button>
        {this.props.message}
      </div>
    );
  }
});

module.exports = Alert;
