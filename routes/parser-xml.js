let express = require('express');
let router = express.Router();
let request = require('request');
let rp = require('request-promise');
let colors = require('colors');
let fs = require('fs');
let prettyjson = require('prettyjson');
let xml2js = require('xml2js');
let jsonfile = require('jsonfile');
let json2csv = require('json2csv');
let xmlStream = require('xml-stream');

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
 * Convert Request data to stream then read stream
 *  and convert to xml data
 *
 * @param link
 */
function streamXML (link) {
  console.log('>>>> Starting stream of XML...'.action);

  let writeStreamOptions = {
    flags: 'wx',
    defaultEncoding: 'utf8',
    fd: null,
    mode: 0o666,
    autoClose: true
  };

  rp(link)
  .then(function (results) {
    console.log('\n>>>> Successfully got results from request-promise');
    console.log(results);
    return results;
  }).catch(function (err) {
    console.log('\n>>>> Error request promise '.error);
    console.log(err);
  });

  // var reqStream = request.get(link).pipe(fs.createWriteStream('./tmp/stream.xml', writeStreamOptions));
  // reqStream.on('error', function (error) {
  //   console.log('\n>> !! Error Streaming from ' + link + ''.error);
  //   console.log(error);
  // });
  //
  // reqStream.on('finish', function () {
  //   console.log('\n>>>> Request finished <<<<'.success);
  //   var readStream = fs.createReadStream('./tmp/stream.xml');
  //   var xml = new xmlStream(readStream);
  //   var writeStream = fs.createWriteStream('./tmp/stream.txt');

  //   writeStream.write(postFields.join('\t') + '\n');
  //
  //   xml.preserve('post');
  //   xml.collect('post');
  //   xml.on('endElement: post', function (post) {
  //     console.log('\t>> Found post!'.rainbow);
  //     var line = [];
  //
  //     postFields.forEach(function (field) {
  //       line.push(post[field]);
  //     });
  //
  //     console.log('Line'.yellow);
  //     console.dir(line);
  //     writeStream.write(line.join('\t') + '\n');
  //   });
  //
  //   xml.on('end', function () {
  //     writeStream.end();
  //     console.log('\n**** Successfully completed xml stream ****'.success);
  //   });
  // });
}

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
  console.log('>>>> Writing to JSON file...'.action);

  let filePath = './tmp/' + file + '.json';
  jsonfile.writeFile(filePath, data, function (err) {
    if (err) {
      console.log('\n>> !! Error writing JSON to file !! <<'.error);
      console.log(err);
    }
    console.log('\n>>>> Successfully wrote JSON to file!'.success);
    return true;
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
    unwindPath: 'author',
    fieldNames: csvFieldNames
  };

  var csv = json2csv(csvOptions);
  let filePath = './tmp/' + file + '.csv';

  fs.writeFile(filePath, csv, function (err) {
    if (err) {
      console.log('>> !! Error writing to CSV !! <<'.error);
      console.log(err);
    }
    console.log('>>>> Successfully wrote to CSV!'.success);
    return true;
  });
}

/* Initial Entry Route; /parse */
router.get('/example', function (req, res, next) {
  console.log('>>>> Determining parser methods...');
  let path = req.path;
  let from = req.query.from;
  let to = req.query.to;
  console.log(`Converting ` + path.action + ': From - ' + from.action + ': To - ' + to.action);

  if (from === 'xml' && to === 'json') {
    console.log('\n>>>> Converting from XML to JSON...'.action);
  }

  if (from === 'json' && to === 'xml') {
    console.log('\n>>>> Converting JSON to XML...'.action);
  }
});

/* Get Parsed XML Data */
router.get('/xml', function (req, res, next) {
  console.log('>>>> Getting Disqus Comments... Kick back, this could take a bit...'.action);

  //streamXML('http://media.disqus.com/uploads/exports/phillydotcom-2017_09_20_17-00116457.xml.gz');

  streamXML('https://www.w3schools.com/xml/note.xml')
  .then(function (results) {
    console.log('\n>>>> Successful streamXML!'.success);
    console.log(results);
    res.send('Done.');
  })
  .catch(function (error) {
    console.log('\n!!!! Error executing streamXML !!!!'.error);
    console.log(error.error);
  });


  // fs.readFile('./theory.xml', function (err, xml) {
  //   console.log('>>>> Successfully read file!'.success);
  //
  //   var parserOptions = {
  //     ignoreAttrs: true,
  //     explicitArray: false
  //   };
  //
  //   var parser = new xml2js.Parser(parserOptions);
  //   parser.parseString(xml, function (err, results) {
  //     if (err) {
  //       console.log('\n\t>> !! Error parsing XML string !! <<'.error);
  //       console.log(err.error);
  //     }
  //     // console.log('\n>>>> RAW Parse String Results <<<<'.success);
  //     // console.log(results);
  //     // console.log('>>>> END RAW Results <<<<'.success);
  //
  //     var postArray = results.disqus.post;
  //     var posts = JSON.stringify(postArray);
  //
  //     console.log('\n>>>> Parse Results <<<<'.success);
  //     console.log(posts.data);
  //     console.log('**** END Parse Results ****\n'.success);
  //
  //     var prettyJson = prettyjson.render(posts, prettyOptions);
  //
  //     console.log('\n>>>> JSON Results <<<<'.success);
  //     console.log(prettyJson);
  //     console.log('**** END JSON Results ****\n'.success);
  //
  //     // Export to file
  //     var file = 'comments';
  //
  //     //writeJsonFile(file, postArray[0]);
  //     //writeCsvFile(file, postArray);
  //
  //     res.send('Done.');
  //   });
  // });
});


module.exports = router;
