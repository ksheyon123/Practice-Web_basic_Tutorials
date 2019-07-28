var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');



function templateHTML(title, list, body, control) {
    return `
    <!doctype html>
    <html>
    <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1><a href="/">Web</a></h1>
        ${list}
        ${control}
        ${body}
    </body>
    </html>
    `;
}
//filelist라는 매개변수가 정의가 되어 있지 않아서 filelist호출
function templateList(filelist) {
    console.log(filelist);
    var list = '<ul>';
    var i = 0;
    while (i < filelist.length) {
        list = list + `<li><a href = "/?id=${filelist[i]}">${filelist[i]}</a></li>`
        i = i + 1;
    }
    list = list + '</ul>';
    return list;
}
//서버에서 함수를 호출(매개변수)하고 아래 만든 함수에서 변수를 선언하여 return값으로 호출된 곳에 전달
function createArticle() {
    var article = `
    <form action="http://localhost:3000/process_create" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p><textarea name="description" placeholder="description"></textarea></p>
        <p><input type="submit"></p>
    </form>
    `;
    return article;
};
function updateArticle(title, description) {
    var article = `
    <form action="http://localhost:3000/update_process" method="post">
        <input type="hidden" name ="id"  value="${title}">
        <p><input type="text" name="title" placeholder="title" value=${title}></p>
        <p><textarea name="description" placeholder="description">${description}</textarea></p>
        <p><input type="submit"></p>
    </form>
    `;
    return article;
}

var app = http.createServer(function (request, response) {
    //request.url로 browser에 접근하는 url을 가져옴
    var _url = request.url;

    //url.parse(urlString[, parseQueryString[, slashesDenoteHost]]) url을 분석한다
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    var articleCreated = createArticle();
    console.log(pathname);
    if (pathname === '/') {
        if (queryData.id === undefined) {
            fs.readdir('./data', function (err, filelist) {
                var title = 'Welcome';
                var description = 'Hello Node.js'
                var list = templateList(filelist);
                var template = templateHTML(title, list,
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a>`);
                response.writeHead(200);
                response.end(template);
            });
        } else {
            fs.readdir('./data', function (err, filelist) {
                fs.readFile(`data/${queryData.id}`, 'utf-8', function (err, description) {
                    var title = queryData.id;
                    var list = templateList(filelist);
                    var template = templateHTML(title, list,
                        `<h2>${title}</h2>${description}`,
                        ` <a href="/create">create</a> 
                          <a href="/update?id=${title}">update</a>
                          <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${title}">
                            <input type="submit" value="delete">
                          </form>`);
                    //링크는 delete를 누르면 해당 페이지로 이동.(queryString은 Get 방식)
                    response.writeHead(200);
                    response.end(template);
                });
            });
        }
    } else if (pathname === '/create') {
        fs.readdir('./data', function (err, filelist) {
            var title = 'Web-Create';
            var list = templateList(filelist);
            var template = templateHTML(title, list, articleCreated);
            response.writeHead(200);
            response.end(template);
        });
    } else if (pathname === '/process_create') {
        var body = '';
        //사용자가 요청한 data에 대하여 request.on, Nodejs는 포스트 방식으로 전달된 data 가 많을 경우 조각조각의 양을 서버에서 수신할 때마다 콜백함수를 호출하도록 약속되어 있으며, 이때 data라는 인자를 통해 수신한 정보를 전달
        request.on('data', function (data) {
            body = body + data;

        });
        //data전송이 끝났을 경우 end로 
        request.on('end', function () {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf-8', function (err) {
                if (err) {
                    console.log("File Write Err " + err);
                }
                response.writeHead(302, { Location: `/?id=${title}` });
                response.end();
            });
        });
    } else if (pathname === '/update') {
        fs.readdir('./data/', function (error, filelist) {
            fs.readFile(`data/${queryData.id}`, 'utf-8', function (err, description) {
                var title = queryData.id;
                var list = templateList(filelist);
                var articleUpdated = updateArticle(title, description);
                var template = templateHTML(title, list,
                    articleUpdated,
                    `<a href = "/create">create</a> <a href="update?id=${title}">update</a>`
                );
                response.writeHead(200);
                response.end(template);
            });
        });
    } else if (pathname === '/update_process') {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, function (error) {
                if (error) {
                    console.log("Rename 오류 ")
                }
                fs.writeFile(`data/${title}`, description, 'utf-8', function (err) {
                    if (err) {
                        console.log("File Write Err " + err);
                    }
                    response.writeHead(302, { Location: `/?id=${title}` });
                    response.end();
                });
            });
        });
    } else if (pathname === '/delete_process') {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;
            fs.unlink(`data/${id}`, function(error){
                console.log("삭제 Err " + error);
            });
            response.writeHead(302, {Location: `/`});
            response.end();
        });
    } else {
        response.writeHead(404);
        response.end('Not Found');
    }
});
app.listen(3000);