var express = require("express");
var argv = require('yargs').argv
var paths = require('path');
var app = express();
var contentFolder = '/build'



 /* serves all the static files */
app.get('/public/:folder?/*', function(req, res){ 
    res.sendFile(paths.join(__dirname, contentFolder, req.params.folder ? req.params.folder : '', req.params[0])); 
});

app.get('/*', function(req, res) {
    res.sendFile(paths.join(__dirname, contentFolder, '/index.html'));
});

var port = process.env.PORT || 5000;
if(argv.folder !== undefined) {
    contentFolder = argv.folder;
    console.log('Serving app from: ' + contentFolder);
}
app.listen(port, function() {
   console.log("Listening on " + port);
});
