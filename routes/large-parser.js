const express = require('express');
const router = express.Router();
const request = require('request');
const rp = require('request-promise');
const colors = require('colors');
const fs = require('fs');
const prettyjson = require('prettyjson');
const xml2js = require('xml2js');
const jsonfile = require('jsonfile');
const json2csv = require('json2csv');
const xmlStream = require('xml-stream');
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

let writeStreamOptions = {
  flags: 'wx',
  defaultEncoding: 'utf8',
  fd: null,
  mode: 0o666,
  autoClose: true
};


/**
 * Read a large XML file from stream
 *
 * @param uri
 * @param verbose
 * @param debug
 */
function parseLargeStream (uri, verbose=false, debug=false) {
  let reader = bigXml.createReader(uri, /^(author)$/, { gzip: false });

  reader.on('record', record => {
    console.log('\n>>>> Record Found <<<<'.success);
    let author = {
      name: record.children[0].text,
      email: record.children[1].text
    };

    if (verbose) {
      console.log(JSON.stringify(author).cyan);
    }

    if (debug) {
      let prettyJson = prettyjson.render(record, prettyOptions);
      console.log('\n>>>> Pretty Json <<<<'.success);
      console.log(prettyJson);
      console.log('**** END Pretty Json ****\n'.success);
    }
  });

  reader.on('error', error => {
    console.log('\n!!!! Error parsing large data set !!!!'.error);
    console.log(error);
  });
}


/* Router */
router.get('/', function (req, res, next) {
  parseLargeStream('./example.xml', true);
  res.send('Done.');
});

module.exports = router;
