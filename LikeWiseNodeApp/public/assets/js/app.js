// Upload the photos using ajax request.

function uploadPhotos(formData) {
  console.log("Upload Photos");
  $.ajax({
    url: "/upload_photos",
    method: "post",
    data: formData,
    processData: false,
    contentType: false,
    xhr: function() {
      var xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", function(event) {
        var progressBar = $(".progress-bar");
        if (event.lengthComputable) {
          var percent = (event.loaded / event.total) * 100;
          progressBar.width(percent + "%");
          if (percent === 100) {
            progressBar.removeClass("active");
          }
        }
      });
      return xhr;
    }
  })
    .done(data => {
      console.log(data);
    })
    .fail(function(xhr, status) {
      alert(status);
    });
}

// Handle the upload response data from server and show uploaded images.
function showPhotos(response) {
  console.log("images are ready");
  if (response.length > 0) {
    var uploadImages = "";
    for (var i = 0; i < response.length; i++) {
      var upImage = response[i];
      if (upImage.status) {
        uploadImages +=
          '<div class="col-xs-6 col-md-4 thumbnail"><img src="' +
          upImage.relativePath +
          '" alt="' +
          upImage.filename +
          '"></div>';
      } else {
        uploadImages +=
          '<div class="col-xs-6 col-md-4 thumbnail">Invalid file type - ' +
          upImage.filename +
          "</div>";
      }
    }
    $("#uploadedPhotos").html(uploadImages);
  } else {
    alert("No image uploaded.");
  }
}

// Set the progress bar to 0 when a file(s) is selected.
$("#photos").on("change", function() {
  $(".progress-bar").width("0%");
});
