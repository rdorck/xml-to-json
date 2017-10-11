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

let postFields = [
  'id',
  'message',
  'thread',
  'isSpam',
  'createdAt',
  'ipAddress',
  'author.name',
  'author.email',
  'parent'
];
let csvFieldNames = [
  'Id',
  'Comment',
  'Thread',
  'Is Spam',
  'Date Created',
  'IP Address',
  'Username',
  'Email',
  'Parent'
];


/**
 * Writes to CSV File the array of json data
 * @param json
 */
function writeJsonToCsv (json) {
  console.log('\n>>>> Converting json into csv... <<<<'.pending);
  let csvOptions = {
    data: json,
    fields: postFields,
    //fieldNames: authorFieldNames,
    unwindPath: 'author',
    excelStrings: true
  };

  let csv = json2csv(csvOptions);
  let filePath = './tmp/json2csv.csv';

  fs.writeFile(filePath, csv, function (err) {
    if (err) {
      console.log('>> !! Error writing to CSV !! <<'.error);
      console.log(err);
    }
    console.log('>>>> Successfully wrote to CSV!'.success);
  });
}

function readXmlWriteJson (req, res) {
  fs.readFile('./example.xml', function (err, xml) {
    console.log('>>>> Successfully reading file...'.success);

    let parserOptions = {
      ignoreAttrs: true,
      explicitArray: false
    };

    let parser = new xml2js.Parser(parserOptions);
    parser.parseString(xml, function (err, results) {
      if (err) {
        console.log('\n!!!!! Error parsing XML string !!!!'.error);
        console.log(err.error);
      }

      let postArray = results.disqus.post;
      console.log(postArray);
      let posts = JSON.stringify(postArray);

      console.log('\n>>>> Raw results.disqus.post <<<<'.success);
      console.log(posts.data);
      console.log('**** END Parse Results ****\n'.success);

      let prettyJson = prettyjson.render(postArray, prettyOptions);
      console.log('\n>>>> Pretty Json <<<<'.success);
      console.log(prettyJson);
      console.log('**** END Pretty Json ****\n'.success);

      // Export to file
      //var file = 'comments';
      //writeJsonFile(file, postArray[0]);
      //writeCsvFile(file, postArray);

      writeJsonToCsv(postArray);

      res.send('Done.');
    });
  });
}

function reserveStaff (src, dest) {
  console.log('\n>>>> Reserving staff writers...'.trap.rainbow);
  let inStream = fs.createReadStream(src);
  let outStream = fs.createWriteStream(dest, writeStreamOptions);
  let xml = new xmlStream(inStream);

  outStream.write(csvFields.join('\t') + '\n');

  xml.on('startElement: post', function (post) {
    console.log('\n>>>> Start Post <<<<'.pending);
  });

  xml.collect('post');
  xml.preserve('post');

  xml.on('endElement: post', function (post) {
    console.log('>>>> Post data <<<<'.success);
    let author = post.author;
    console.log('Author'.underline.magenta);
    console.log(author);


    let prettyJson = prettyjson.render(author, prettyOptions);
    console.log('\n>>>> JSON Results <<<<'.success);
    console.log(prettyJson);
    console.log('**** END JSON Results ****\n'.success);

    // TODO: Get isolated Json object to pass as arg
    //writeJsonToCsv(authorObj);

    // var line = [];
    // csvFields.forEach(function (field) {
    //   console.log(field.magenta.underline);
    //   console.log(post[field]);
    //   line.push(post[field]);
    //   //writeJsonToCsv(line);
    // });
    //
    // outStream.write(line.join('\t') + '\n');
    console.log('>>>> End Post <<<<'.error + '\n');
  });

  // Parsing ended
  xml.on('end', function () {
    outStream.end();
    console.log('\n**** Successfully completed xml stream ****'.success);
  });

  // Error
  xml.on('error', function (error) {
    console.log('\n>> Error XML Stream ended <<'.error);
    console.log(error);
  });
}

/* Router */
router.get('/', function (req, res, next) {
  //let src = req.params.src;
  //let dest = req.params.dest;
  let src = './example.xml';
  let dest = './tmp/json2csv.csv';
  //reserveStaff(src, dest);

  readXmlWriteJson(req, res);
});


module.exports = router;
