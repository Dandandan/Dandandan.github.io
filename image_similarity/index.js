// Output results
function append_filenames(matched, files) {
  var res = '';
  matched.forEach(function(v) {
    res += "<br>Matched " + files[v[0]].name + " with " + files[v[1]].name + ", distance: " + v[2];
  });
  if (matched.length === 0) {
    res += "<br>No matches found";
  }
  $('#results').html(res);
}

// Processing imagets
$().ready(function() {
  var sensitivity = 8;
  
  var hashes = [];
  var files;
  
  $('#fileInput').change(function(e) {
    var URL = window.URL || window.webkitURL;
    files = e.target.files;
    if (files.length === 0) {
      $('#results').html('No images given');
    }
    hashes = [];
    var index = 0;
    function process(index) {
      $('#progress').html('Processing: ' + index + ' of ' + files.length);

      var file = files[index];
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function() {
        var hash = image_hash(this);
        hashes.push(hash);
        if (hashes.length === files.length) {
          var matched = compare_hashes(hashes, sensitivity);
          append_filenames(matched, files)
        }
        else process(index + 1);
      }
      img.src = url;
    }
    process(0);
  });
  
  $('#sensitivity').mousemove(function() {
    sensitivity = $(this).val();
    $('#sensVal').html(sensitivity);
    if (hashes.length == 0) {
      return;
    }
    var matched = compare_hashes(hashes, sensitivity);
    append_filenames(matched, files)
  });
});
