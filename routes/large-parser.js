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
  flags: 'wxa',
  defaultEncoding: 'utf8',
  fd: null,
  mode: 0o666,
  autoClose: true
};


const jsonWrite = (author) => {
  console.log('>>>> Writing to json file...'.pending);
  let jsonFileOpts = {space: 2, flags: 'wxa'};
  jsonfile.writeFile('./tmp/authors.json', author, jsonFileOpts, function (err) {
    if (err) {
      console.log('\n!!!! Error writing to json file !!!!'.error);
      console.log(err);
    }
    console.log('>>>> Successfully wrote to json file...'.success);
  });

  // let outStream = fs.createWriteStream('./tmp/authors.json', writeStreamOptions);
  // outStream.write(author);
  // outStream.end();
};


/**
 * Read a large XML file from stream
 *
 * @param uri
 * @param verbose
 * @param debug
 */
function parseLargeStream (uri, verbose=false, debug=false) {
  console.log('\n>>>> Reading large xml file...'.pending);
  // NOTE - Regex a deeper (author/post) || just post
  // TODO - Setup async/await

  let reader = bigXml.createReader(uri, /^(post)$/, { gzip: false });

  reader.on('record', record => {
    console.log('\n>>>> Record Found <<<<'.success);
    console.log(record);

    // if (record.children[0].text == 'rmetente@philly.com') {
    //
    // }
    //
    // var author = {
    //   name: record.children[0].text,
    //   email: record.children[1].text
    // };
    //
    // jsonWrite(author);

    if (verbose) {
      console.log(JSON.stringify(record).cyan);
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
  console.log('\n**** Commence Parsing ****'.underline.success);

  let reader = bigXml.createReader('./disqus.xml', /^(post)$/, {gzip: false});

  reader.on('record', function (record) {
    console.log('\n>>>> Start Record <<<<'.success);
    console.log(record);
    console.log(JSON.stringify(record).cyan);
    console.log('>>>> End Record <<<<'.error);
    res.send('Done.');
  });

  reader.on('error', function (error) {
    console.log('\n!!!! Error on author reader !!!!'.error);
    console.log(error);
  });


  //parseLargeStream('./disqus.xml', true);
});

module.exports = router;
