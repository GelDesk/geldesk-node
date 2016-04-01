'use strict';

module.exports = [
  ':Panel', {
    dock:'left-split', 
    padding: 6
  },
  [':TextBox', {dock: 'top', placeholder: 'Entry 1', label: 'Optional Label'}],
  [':TextBox', {dock: 'top', placeholder: 'Entry 2'}],
  [':TextBox', {dock: 'top', placeholder: 'Entry 3'}],
  [':ComboBox', {dock: 'top', placeholder: 'Entry 4', 
    label: 'Select an Item',
    items: ['Item 1', 'Item 2', 'Item 3']
  }],
  [':CheckBox', {dock: 'top', text: 'Check 1', checked: true}],
  [':CheckBox', {dock: 'top', text: 'Check 2', checked: true}],
  [':CheckBox', {dock: 'top', text: 'Check 3', checked: false}],
  [':Button', {dock: 'top', bind: 'app/exit'}],
  [':TreeView', {
    dock: 'fill',
    nodes: [
      {text: 'Node 1', nodes: [
        {text: 'Child 1 of Node 1'},
        {text: 'Child 2 of Node 1'}
      ]},
      {text: 'Node 2', nodes: [
        {text: 'Child 1 of Node 2'},
        {text: 'Child 2 of Node 2'}
      ]},
      {text: 'Node 3', nodes: [
        {text: 'Child 1 of Node 3'},
        {text: 'Child 2 of Node 3'}
      ]}
    ]
  }]
];
