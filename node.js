
var testfolder = './data';
var fs = require('fs');
fs.readFile('1.html', 'utf8', function(err, data){
  console.log(data);
});

fs.readdir(testfolder, function(err, filelist) {
    console.log(filelist);
})