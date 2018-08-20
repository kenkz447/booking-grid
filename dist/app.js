'use strict';
var express = require('express');
var path = require('path');
var publicFolder = path.join(__dirname, 'static')

var app = express();

app.use('/static', express.static(publicFolder));

const encodeResToGzip = contentType => (req, res, next) => {
  req.url = req.url + '.gz';
  res.set('Content-Encoding', 'gzip');
  res.set('Content-Type', contentType);
  res.sendFile(req.url, { root: __dirname });
};

app.get("*.js", encodeResToGzip('text/javascript'));
app.get("*.css", encodeResToGzip('text/css'));

app.all('/*', function (req, res) {
  res.sendFile('index.html', { root: publicFolder });
})

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + server.address().port);
});