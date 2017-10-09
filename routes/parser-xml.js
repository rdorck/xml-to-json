var express = require('express');
var router = express.Router();
var colors = require('colors');
var fs = require('fs');
var prettyjson = require('prettyjson');
var xml2js = require('xml2js');
var jsonfile = require('jsonfile');
var json2csv = require('json2csv');
var jq = require('node-jq');


colors.setTheme({
  action: 'rainbow',
  pending: 'yellow',
  success: 'green',
  data: 'magenta',
  error: 'red'
});


/**
 * Convert XML to Organized JSON
 *
 * @param xml
 * @returns {{}}
 */
function xmlToJson (xml) {
  // Create the return object
  var obj = {};

  if (xml.nodeType == 1) { // element
    console.log('One one one');
    // do attributes
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (var j = 0; j < xml.attributes.length; j++) {
        var attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType == 3) { // text
    obj = xml.nodeValue;
  }

  // do children
  // If just one text node inside
  if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
    obj = xml.childNodes[0].nodeValue;
  }
  else if (xml.hasChildNodes()) {
    for(var i = 0; i < xml.childNodes.length; i++) {
      var item = xml.childNodes.item(i);
      var nodeName = item.nodeName;

      if (typeof(obj[nodeName]) == "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof(obj[nodeName].push) == "undefined") {
          var old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  console.log(obj);

  /* Handle Error: xml.hasChildNodes() is not a function */
  var xmlDom = new DOMParser().parseFromString(xml, 'text/xml');
  console.log(xmlDom);

  return obj;
}

/**
 * Writes JSON data to .json file in directory
 *
 * @param file
 * @param data
 */
function writeJsonFile (file, data) {
  console.log('>>>> Writing JSON to ' + file + ' '.action);
  jsonfile.writeFileSync(file, data, {}, function (err) {
    if (err) {
      console.log('\n>> !! Error writing JSON to file !! <<'.error);
      console.log(err);
    }
    console.log('\n>>>> Successfully wrote JSON to file!'.success);
  });
}

/**
 * Write JSON data to a converted CSV file
 *
 * @param file
 * @param data
 */
function writeCsvFile (file, data) {
  console.log('\n>>>> Writing to CSV...'.action);

  var csvFields = [
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

  var csvFieldNames = [
    'Id',
    'Comment',
    'Thread',
    'Is Spam',
    'Date Created',
    'IP Address',
    'Commenter Username',
    'Commenter Email',
    'Parent'
  ];

  var csvOptions = {
    data: data,
    fields: csvFields,
    unwindPath: 'author'
    //fieldNames: csvFieldNames
  };

  var csv = json2csv(csvOptions);

  fs.writeFileSync(file, csv, {}, function (err) {
    if (err) {
      console.log('>> !! Error writing to CSV !! <<'.error);
      console.log(err);
    }
    console.log('>>>> Successfully wrote to CSV!'.success);
  });
}


/* Get Parsed XML Data */
router.get('/', function (req, res, next) {
  console.log('>>>> Reading XML file...'.action);

  fs.readFile('./disqus.xml', function (err, xml) {
    console.log('>>>> Successfully read file!'.success);

    var parserOptions = {
      ignoreAttrs: true,
      explicitArray: false
    };

    var parser = new xml2js.Parser(parserOptions);

    parser.parseString(xml, function (err, results) {
      if (err) {
        console.log('\n\t>> !! Error parsing XML string !! <<'.error);
        console.log(err.error);
      }

      var postArray = results.disqus.post;
      var posts = JSON.stringify(postArray);

      console.log('\n>>>> Parse Results <<<<'.success);
      console.log(posts.data);
      console.log('**** END Parse Results ****\n'.success);

      var prettyOptions = {
        keysColor: 'cyan',
        dashColor: 'magenta',
        stringColor: 'yellow',
        numberColor: 'white'
      };
      var prettyJson = prettyjson.render(posts, prettyOptions);

      console.log('\n>>>> JSON Results <<<<'.success);
      console.log(prettyJson);
      console.log('**** END JSON Results ****\n'.success);

      // Export to file
      var file = './tmp/comments.csv';
      //writeJsonFile(file, results);
      writeCsvFile(file, postArray);

      res.send(JSON.stringify(results.disqus.post));
    });
  });
});


module.exports = router;
