var express = require("express"),
  path = require("path"),
  fs = require("fs"),
  formidable = require("formidable"),
  readChunk = require("read-chunk"),
  fileType = require("file-type"),
  bodyParser = require("body-parser"),
  request = require("request-promise"),
  base64Img = require("base64-img");

var app = express();
app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
// Tell express to serve files from the directories
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

if (!fs.existsSync(path.join(__dirname, "uploads/"))) {
  fs.mkdirSync(path.join(__dirname, "uploads/"));
}

var photos = null;
// index route
app.get("/", function(req, res) {
  var filesPath = path.join(__dirname, "uploads/");
  fs.readdir(filesPath, function(err, files) {
    if (err) {
      console.log(err);
      return;
    }
    files.forEach(function(file) {
      fs.stat(filesPath + file, function(err, stats) {
        if (err) {
          console.log(err);
          return;
        }
        var createdAt = Date.parse(stats.ctime),
          days = Math.round((Date.now() - createdAt) / (1000 * 60 * 60 * 24));
      });
    });
  });
  res.render("index", { uploaded_photos: null });
});

// Upload photos
app.post("/upload_photos", function(req, res) {
  var photos = [],
    form = new formidable.IncomingForm();
  form.multiples = true;
  form.uploadDir = path.join(__dirname, "uploads");
  form.on("file", function(name, file) {
    var buffer = null,
      type = null,
      filename = "";

    buffer = readChunk.sync(file.path, 0, 262);
    type = fileType(buffer);
    if (buffer.length == 0 && type === null) {
      res.redirect(307, "/");
    }

    // Check the file type as it must be either png,jpg or jpeg
    if (
      type !== null &&
      (type.ext === "png" || type.ext === "jpg" || type.ext === "jpeg")
    ) {
      filename = Date.now() + "-" + file.name;
      fs.renameSync(file.path, path.join(__dirname, "uploads/" + filename));
      console.log("renamed complete");
      photos.push({
        status: true,
        filename: filename,
        type: type.ext,
        relativePath: "uploads/" + filename,
        publicPath: __dirname + "/uploads/" + filename,
        base64: base64Img.base64Sync(__dirname + "/uploads/" + filename)
      });
    } else {
      photos.push({
        status: false,
        filename: file.name,
        message: "Invalid file type"
      });
      fs.unlink(file.path);
    }
  });

  form.on("error", function(err) {
    console.log("Error occurred during processing - " + err);
  });
  form.on("end", function() {
    request.post(
      {
        url: "http://127.0.0.1:5000/predict_images",
        json: photos
      },
      (error, response, body) => {
        console.log(error);
        console.log(body);
        photos.map((x, i) => {
          x.mean_pred = body["Mean Scores"][i].toFixed(2);
          x.std_pred = body["Std Scores"][i].toFixed(2);
          return x;
        });
        photos = photos.sort(function(a, b) {
          return b.mean_pred - a.mean_pred;
        });
        res.render("upload_photos", { uploaded_photos: photos });
      }
    );
    console.log("All the request fields have been processed.");
  });
  form.parse(req, function(err, fields, files) {
    console.log("it is parsed.");
    //res.status(200).json(photos);
  });
});

app.listen(app.get("port"), function() {
  console.log("Express started at port " + app.get("port"));
});
