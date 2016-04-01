'use strict';

module.exports = [
  'menu:Menu', 
  null,
  ['app', {text: '_File'}, 
    ['open', {text: '_Open'}], 
    ['exit', {text: 'E_xit'}]
  ],
  ['edit', {text: '_Edit'}, 
    ['cut', {text: 'Cu_t'}], 
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
