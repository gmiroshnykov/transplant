/**
 * @jsx React.DOM
 */

var React = require('react'),
    _ = require('underscore');

var Alert = require('./Alert');

var Alerts = React.createClass({
  handleAlertClose: function(id) {
    this.props.onAlertClose(id);
  },

  render: function() {
    var self = this;
    var alerts = _.map(this.props.items, function(item, id) {
      return <Alert
          key={id}
          type={item.type}
          message={item.message}
          onClose={self.handleAlertClose.bind(self, id)} />
    });

    return (
      <div className="alerts">
        {alerts}
      </div>
    );
  }
});

module.exports = Alerts;
