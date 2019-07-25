var http = require('http');
var fs = require('fs');
var url = require('url');

var app = http.createServer(function (request, response) {
    //request.url로 browser에 접근하는 url을 가져옴
    var _url = request.url;

    //url.parse(urlString[, parseQueryString[, slashesDenoteHost]]) url을 분석한다
    var queryData = url.parse(_url, true).query;
    var title = queryData.id;
    console.log(queryData.id);
    if (_url == '/') {
        var title = 'Welcome'
    }
    if (_url == '/favicon.ico') {
        response.writeHead(404);
        response.end();
        return;
    }
    response.writeHead(200);
    fs.readFile(`data/${queryData.id}`,'utf-8', function(err, description) {
        var template = `
    <!doctype html>
    <html>
    <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1><a href="/">WEB</a></h1>
            <ol>
                <li><a href="/?id=HTML">HTML</a></li>
                <li><a href="/?id=CSS">CSS</a></li>
                <li><a href="/?id=JavaScript">JavaScript</a></li>
            </ol>
        <h2>${title}</h2>
        <p>${description}</p>
    </body>
    </html>
    `
    // fs.readFileSync(__dirname + url) 사용자가 접속한 url에 따라서  __dirname + url을 읽어옴
    response.end(template);
    });

});
app.listen(3000);