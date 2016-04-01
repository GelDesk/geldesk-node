'use strict';

module.exports = [
  'commands:CommandSet', null,
  ['app', {text: '_File'}, 
    ['open', {text: '_Open', enabled: false}], 
    ['exit', {text: 'E_xit'}]
  ],
  ['edit', {text: '_Edit'}, 
    ['undo', {text: '_Undo', group: 'hist'}],
    ['redo', {text: '_Redo'}],
    ['cut', {text: 'Cu_t', group: 'clip'}], 
    ['copy', {text: '_Copy'}], 
    ['paste', {text: '_Paste'}]
  ],
  ['view', {text: '_View'}, 
    ['things', {text: '_Things'}]
  ],
  ['help', {text: '_Help'}, 
    ['about', {text: '_About'}]
  ]
];
