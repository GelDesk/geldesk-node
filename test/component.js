'use strict';
var sys = {
  fs: require('fs')
};
var geldesk = require('../index.js');
var Component = geldesk.Component;
var Window = geldesk.ui.Window;
var Menu = geldesk.ui.Menu;

// #region old
//var json = sys.fs.readFileSync('./test/support/winAndMenu.json');
//var data = JSON.parse(json);
//var root = Component.build(data);
//if (!(root instanceof geldesk.ui.Window))
//  throw new Error('Expected geldes.ui.Window');
//var child = root._componentChildren[0];
//if (!(child instanceof geldesk.ui.Menu))
//  throw new Error('Expected geldesk.ui.Menu');
//child = child._componentChildren[0];
//if (!(child instanceof geldesk.ui.MenuItem))
//  throw new Error('Expected geldesk.ui.MenuItem');
//console.dir(root);
// #endregion

var win = window();

var data = Component.serialize(win);

console.dir(data, {depth: null});

console.log('OK');

function window() {
  var win = new Window('main', {
    title: 'main',
    startPosition: 'center'
  });
  var menu = Component.build([
    // Name and Type
    'menu:Menu', 
    // Properties
    null,
    // Items (default type:MenuItem).
    ['file', {text: '_File'}, 
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
  ]) || new Menu();

  win.add(menu);
  return win;
}
