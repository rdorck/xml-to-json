var express = require('express');
var router = express.Router();
var fs = require('fs');
var parser = require('xml2json');

/* Get Parsed XML Data */
router.get('/', function(req, res, next) {
  console.log('Opening XML File...');

  fs.open('./test-xml', 'r+', function (err, fd) {
    if (err) {
      console.log('Error opening XML file');
      return console.error(err);
    }

    console.log('XML file successfully opened!');
    console.log('Attempting to read open XML file...');

    var data = fs.readFileSync('test-xml');
    console.log(data);

    var parserOption = {

    };

    var json = parser.toJson(data);

    // var json = xmlToJson(data);
    // console.log(json);

    //res.send(data);
    //res.render('parser', { title: 'XML Parser' });
  });
});


function xmlToJson(xml) {

  // Create the return object
  var obj = {};

  if (xml.nodeType == 1) { // element
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

module.exports = router;
