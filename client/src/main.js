/**
 * @jsx React.DOM
 */

var TransplantApp = require('./TransplantApp');

React.renderComponent(
  <TransplantApp repositories={REPOSITORIES} />,
  document.getElementById('app')
);
