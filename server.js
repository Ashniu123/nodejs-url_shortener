var express = require('express');
var app = express();

var port = process.env.PORT || 8080;

app.get('/',function(req,res){
    res.status(200).end(`
<div style="font-family: Arial,sans-serif;margin: 20px;font-size: 110%;">
<h1>API Basejump: WhoAmI microservice</h1>
<h2>User stories:</h2>
<p>
<ul>
<li>I can pass a URL as a parameter and I will receive a shortened URL in the JSON response</li>
<li>If I pass an invalid URL that doesn't follow the valid http://www.example.com format, the JSON response will contain an error instead</li>
<li>When I visit that shortened URL, it will redirect me to my original link</li>
</ul>
</p>
<p>
Run at <a href="/new" target="_blank" style="background: #f9f2f4;color: #c7254e">`+req.headers["x-forwarded-proto"]+`://`+req.headers.host+`/new/https://google.com</a>
</p>
<div>Example creation output:
<p style="color: lightcoral;margin: 20px;">{ "original_url":"https://google.com", "short_url":"`+req.headers["x-forwarded-proto"]+`://`+req.headers.host`/8170"}</p>
Usage:
<p style="color: lightcoral;margin: 20px;">`+req.headers["x-forwarded-proto"]+`://`+req.headers.host`/8170</p>
Will redirect to:
<p style="color: lightcoral;margin: 20px;">https://google.com</p>
</div>
</div>
`);
});

app.get('/new/:url',function(req,res){
    var url=req.params.url;
    res.status(200).end("New");
});

app.listen(port, function () {
    console.log('App listening on port '+port+"!");
});