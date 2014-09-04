/**
 * @jsx React.DOM
 */

var _ = require('underscore');

var RepositoriesListField = require('./RepositoriesListField');

var TransplantForm = React.createClass({
  getInitialState: function() {
    return {
      sourceRepository: '',
      targetRepository: ''
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

  render: function() {
    var sourceRepository = this.state.sourceRepository;
    var targetRepository = this.state.targetRepository;

    var sourceRepositories = targetRepository == ''
      ? this.props.repositories
      : _.reject(this.props.repositories, _.matches({name: targetRepository}));

    var targetRepositories = sourceRepository == ''
      ? this.props.repositories
      : _.reject(this.props.repositories, _.matches({name: sourceRepository}));

    return (
      <form className="transplantForm" role="form">
        <RepositoriesListField
          name="source"
          title="Source"
          value={this.state.sourceRepository}
          repositories={sourceRepositories}
          onChange={this.handleChangeSourceRepository}/>
        <RepositoriesListField
          name="target"
          title="Target"
          value={this.state.targetRepository}
          repositories={targetRepositories}
          onChange={this.handleChangeTargetRepository}/>
      </form>
    );
  }
});

module.exports = TransplantForm;
