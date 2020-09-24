var express = require("express");
var mongoose = require("mongoose");
var app = express();

var port = process.env.PORT || 8080;
var mongoUrl =
  process.env.MONGOLAB_URI || "mongodb://localhost:27017/url-shortener";

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((err) => {
    console.error(err);
  });

var urlmon = require("./urlSchema");

app.get("/", function (req, res) {
  res.status(200).end(
    `
<div style="font-family: Arial,sans-serif;margin: 20px;font-size: 110%;">
<h1>API Basejump: WhoAmI microservice</h1>
<hr>
<h2>User stories:</h2>
<p>
<ul>
<li>I can pass a URL as a parameter and I will receive a shortened URL in the JSON response</li>
<li>If I pass an invalid URL that doesn't follow the valid http://www.example.com format, the JSON response will contain an error instead</li>
<li>When I visit that shortened URL, it will redirect me to my original link</li>
</ul>
</p>
<p>
To see all URLs: <a target="_blank" href="/urls" style="background: #f9f2f4;color: #c7254e">` +
      req.headers["x-forwarded-proto"] +
      `://` +
      req.headers.host +
      `/urls</a>
</p>
<p>
Usage: ` +
      req.headers["x-forwarded-proto"] +
      `://` +
      req.headers.host +
      `/new/{Your Valid URL}<br><br>
Run at <a href="/new/https://google.com" target="_blank" style="background: #f9f2f4;color: #c7254e">` +
      req.headers["x-forwarded-proto"] +
      `://` +
      req.headers.host +
      `/new/https://google.com</a>
</p>
<div>Example creation output:
<p style="color: lightcoral;margin: 20px;">{ "original_url":"https://google.com", "short_url":"` +
      req.headers["x-forwarded-proto"] +
      `://` +
      req.headers.host +
      `/8170"}</p>
Usage:
<p style="color: lightcoral;margin: 20px;">` +
      req.headers["x-forwarded-proto"] +
      `://` +
      req.headers.host +
      `/8170</p>
Will redirect to:
<p style="color: lightcoral;margin: 20px;">https://google.com</p>
</div>
</div>
`
  );
});

app.get("/urls", function (req, res) {
  var json = {},
    output = "";
  urlmon.find({}, { original_url: 1, short_url: 1, _id: 0 }, function (
    err,
    data
  ) {
    if (err) throw err;
    res.json(data);
  });
});

app.get("/new/*", function (req, res) {
  var url = req.originalUrl.slice(5),
    json = {},
    number = Math.floor(Math.random() * 1000);
  if (
    /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
      url
    )
  ) {
    urlmon.find({}, function (err, data) {
      if (err) throw err;
      var flag = 1;
      data.forEach(function (val) {
        if (val.original_url == url) {
          json.original_url = val.original_url;
          json.short_url = val.short_url;
          flag = 0;
        } else {
          var existing = val.short_url.match(/\/\d+/).slice(1);
          while (number == existing) {
            number = Math.floor(Math.random() * 1000);
          }
        }
      });
      if (flag) {
        json.original_url = url;
        json.short_url =
          req.headers["x-forwarded-proto"] +
          "://" +
          req.headers["host"] +
          "/" +
          number;
        urlmon.create(json, function (err, data) {
          if (err) throw err;
        });
      }
      res.json(json);
    });
  } else {
    res.status(400).end("Invalid Url");
  }
});

app.get("/:number", function (req, res) {
  var number = req.params.number;
  if (/\d+/.test(number)) {
    urlmon.find({}, function (err, data) {
      if (err) throw err;
      var flag = 0,
        val;
      if (data.length) {
        for (var i = 0; i < data.length; i++) {
          val = data[i];
          var existing = val.short_url.match(/\/\d+/)[0].slice(1);
          if (existing == number) {
            val = val.original_url;
            flag = 1;
            break;
          }
        }
        if (flag) {
          res.redirect(val);
        } else {
          res.status(400).end("This Url does not exist!");
        }
      } else {
        res.status(400).end("This Url does not exist!");
      }
    });
  } else {
    res.status(400).end("Bad Request");
  }
});

app.listen(port, function () {
  console.log("App listening on port " + port + "!");
});
