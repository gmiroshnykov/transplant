/**
 * @jsx React.DOM
 */

var TransplantForm = require('./TransplantForm');

var TransplantApp = React.createClass({
  handleSubmit: function(data) {
    console.log('submit:', data);
  },

  render: function() {
    return (
      <div className="transplantApp">
        <h1>Transplant</h1>
        <TransplantForm
          repositories={this.props.repositories}
          onSubmit={this.handleSubmit} />
      </div>
    );
  }
});

module.exports = TransplantApp;
