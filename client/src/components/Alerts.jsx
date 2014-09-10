/**
 * @jsx React.DOM
 */

var React = require('react'),
    _ = require('underscore');

var Alert = require('./Alert.jsx');

var Alerts = React.createClass({
  handleAlertClose(id) {
    this.props.onAlertClose(id);
  },

  render() {
    var alerts = _.map(this.props.items, (item, id) => {
      return <Alert
          key={id}
          type={item.type}
          message={item.message}
          onClose={_.partial(this.handleAlertClose, id)} />
    });

    return (
      <div className="alerts">
        {alerts}
      </div>
    );
  }
});

module.exports = Alerts;
