const express = require('express');
const router = express.Router();
const request = require('request');
const rp = require('request-promise');
const colors = require('colors');
const fs = require('fs');
const prettyjson = require('prettyjson');
const bigXml = require('big-xml');


function parseXml () {
  let reader = bigXml.createReader('./example.xml', /^(post)$/, {gzip: false});

  reader.on('record', (record) => {
    console.log('\n>>>> Record Found <<<<'.success);
    console.log(record);
    return record;
  });

  reader.on('error', (err) => {
    console.log('\n!!!! Error with parser !!!!'.error);
    console.log(err);
  });
}

const parse = async () => {
  await parseXml();
};


module.exports = parse();
