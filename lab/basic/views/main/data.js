'use strict';

module.exports = [
  'data:ObjectSet', 
  null,
  ['root', {
    explorer: {
      nodes: [
        {text: 'Hello', nodes: [{text: 'Hi'}]},
        {text: 'Goodbye', nodes: [{text: 'Bye'}]}
      ]},
    status: {
      main: 'Ready',
      user: 'You'
    }
  }]
];
