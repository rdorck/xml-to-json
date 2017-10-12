const express = require('express');
const router = express.Router();
const request = require('request');
const rp = require('request-promise');
const colors = require('colors');
const fs = require('fs');
const prettyjson = require('prettyjson');
const jsonfile = require('jsonfile');
const expat = require('node-expat');
const bigXml = require('big-xml');

// Set Console Colors
colors.setTheme({
  action: 'rainbow',
  pending: 'yellow',
  success: 'green',
  data: 'magenta',
  error: 'red'
});

// Set prettyjson Colors
let prettyOptions = {
  keysColor: 'cyan',
  dashColor: 'magenta',
  stringColor: 'yellow',
  numberColor: 'white'
};


/* Router */

router.get('/', function (req, res, next) {
  let disqusExportPath = './disqus.xml';
  let expatParser = new expat.Parser('UTF-8');

  expatParser.on('startElement', function (name, attrs) {
    console.log(name);
    console.log('End name'.red);
    console.log(attrs);
    console.log('End attrs'.red);
  });

  expatParser.on('endElement', function (name) {
    console.log('\n>>>> endElement <<<<'.success);
    console.log(name.cyan);
    console.log('endElement Complete'.error);
  });

  expatParser.on('text', function (text) {
    console.log('\n>>>> text'.success);
    console.log(text);
    console.log('text Complete'.error);
  });

  expatParser.on('comment', function (s) {
    console.log('\n>>>> Comment <<<<'.success)
    console.log(s);
    console.log('comment Complete'.error);
  });

  expatParser.on('', function () {});

  expatParser.on('error', function (err) {
    console.log('\n!!!! Error on expat parser !!!!'.error);
    console.log(err);
  });

  expatParser.write('./example.xml');
});


module.exports = router;
