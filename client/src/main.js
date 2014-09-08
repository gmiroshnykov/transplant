/**
 * @jsx React.DOM
 */

var React = require('react');
var TransplantApp = require('./TransplantApp');

React.renderComponent(
  <TransplantApp repositories={REPOSITORIES} />,
  document.getElementById('app')
);
