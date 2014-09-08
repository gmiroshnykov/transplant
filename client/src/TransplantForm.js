/**
 * @jsx React.DOM
 */

var React = require('react'),
    _ = require('underscore');

var Api = require('./api');

var RepositoriesListField = require('./RepositoriesListField'),
    RevsetField = require('./RevsetField'),
    Alerts = require('./Alerts');

var TransplantForm = React.createClass({
  lastAlertId: 0,

  getInitialState: function() {
    return {
      sourceRepository: '',
      targetRepository: '',
      addInProgress: false,
      alerts: {},
      revsets: []
    };
  },

  handleChangeSourceRepository: function(sourceRepository) {
    console.log('handleChangeSourceRepository:', sourceRepository);
    this.setState({sourceRepository: sourceRepository});
  },

  handleChangeTargetRepository: function(targetRepository) {
    console.log('handleChangeTargetRepository:', targetRepository);
    this.setState({targetRepository: targetRepository});
  },

  handleAddRevset: function(revset) {
    console.log('handleAddRevset:', revset);

    var sourceRepository = this.state.sourceRepository;
    if (!sourceRepository || !revset) {
      return;
    }

    this.setState({addInProgress: true});

    var self = this;
    return Api.lookup(sourceRepository, revset, function(err, result) {
      self.setState({addInProgress: false});

      if (err) {
        self.alertAdd('danger', err.message, 'error');
        return;
      }

      console.log(self.props.children);

      console.log(result);
      self.alertAdd('success', 'Yay!', 'success');
      self.refs.revsetField.reset();
      //this.props.onAddRevset(revset);
    });
  },

  alertAdd: function(type, message, id) {
    id = id || this.lastAlertId++;

    var alerts = this.state.alerts;
    alerts[id] = {
      type: type,
      message: message
    };
    this.setState({alerts: alerts});
  },

  alertRemove: function(id) {
    var alerts = this.state.alerts;
    delete alerts[id];
    this.setState({alerts: alerts});
  },

  render: function() {
    var sourceRepository = this.state.sourceRepository;
    var targetRepository = this.state.targetRepository;

    var sourceRepositories = targetRepository == ''
      ? this.props.repositories
      : _.reject(this.props.repositories, _.matches({name: targetRepository}));

    var targetRepositories = sourceRepository == ''
      ? this.props.repositories
      : _.reject(this.props.repositories, _.matches({name: sourceRepository}));

    var canAdd = !!sourceRepository;

    return (
      <form className="transplantForm" role="form">
        <RepositoriesListField
          name="source"
          title="Source"
          value={this.state.sourceRepository}
          repositories={sourceRepositories}
          onChange={this.handleChangeSourceRepository} />
        <RepositoriesListField
          name="target"
          title="Target"
          value={this.state.targetRepository}
          repositories={targetRepositories}
          onChange={this.handleChangeTargetRepository} />
        <RevsetField
          ref="revsetField"
          canAdd={canAdd}
          addInProgress={this.state.addInProgress}
          onAdd={this.handleAddRevset} />
        <Alerts items={this.state.alerts}
          onAlertClose={this.alertRemove} />
      </form>
    );
  }
});

module.exports = TransplantForm;


var LAST_ALERT_ID = 0;

function createAlert(type, message) {
  return {
    id: LAST_ALERT_ID++,
    type: type,
    message: message
  };
}
