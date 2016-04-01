'use strict';

var geldesk = require('../../index.js');

var app = geldesk.app();
var createView = require('./views/main/window.js');

app.start()
.then(main);

function main() {

  var win = createView();
  win.on('resized', function() {
    console.log('win resized (OK)');
  });

  // We don't want to have to do this:
  //win.component('menu/app/exit').on('clicked', function() {
  //  win.close();
  //});
  //win.component('tools/exit').on('clicked', function() {
  //  win.close();
  //});
  //win.component('tools/open').on('clicked', function() {
  //  main();
  //});
  // Instead, we want to assign handlers to Commands and bind our UI elements 
  // to the commands...
  
  // Show Window
  win.show()
    .then(function(result) {
      console.log(win.name() + ' window show,load (OK)');
    });
    //.then(waitAndDoStuff());
}

function waitAndDoStuff(win) {
  return function() {
    var n = 10;
    console.log('Waiting for ' + n + ' seconds...');
    //console.dir(win);
    setTimeout(function() {
    
      //app.process.quit();
    
      //win.close();
      //.then(console.log);

    }, n * 1000);
  };
}
