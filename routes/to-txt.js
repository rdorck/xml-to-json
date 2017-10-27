const express = require('express');
const router = express.Router();
const request = require('request');
const rp = require('request-promise');
const colors = require('colors');
const fs = require('fs');
const prettyjson = require('prettyjson');
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


/**
 * Read a large XML file from stream
 *
 * @param uri
 */
function writeToText (uri) {
  console.log('\n>>>> Reading large xml file...'.pending);
  // NOTE - Regex a deeper (author/post) || just post

  let reader = bigXml.createReader(uri, /^(email)$/, { gzip: false });

  reader.on('record', record => {
    console.log('\n>>>> Record Found <<<<'.success);
    console.log(record.text);

    // TODO: Add .pause .resume methods

    // TODO: Write emails in line-by-line list to txt
    fs.writeFile('./tmp/disqus-users.txt', record.text, (err) => {
      if (err) {
        console.log('\n!!!! Error writing to text file !!!!');
        console.log(err);
      }

      console.log('Successful write');
    });

  });

  // XML Parse Error
  reader.on('error', error => {
    console.log('\n!!!! Error parsing large data set !!!!'.error);
    console.log(error);
  });
}


/**
 * Router to write xml to txt files
 */
router.get('/', (req, res, next) => {
  console.log('Hello toText');
  writeToText('./disqus.xml');
  res.send('Done writing to file.');
});

module.exports = router;
