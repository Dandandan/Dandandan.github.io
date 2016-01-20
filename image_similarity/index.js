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
  $('#fileInput').change(function(e) {
    var URL = window.URL || window.webkitURL;
    var files = e.target.files;
    if (files.length === 0) {
      $('#results').html('No images given');
    }
    var hashes = [];
    var index = 0;
    function process(index) {
      $('#results').html('Processing: ' + index + ' of ' + files.length);

      var file = files[index];
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function() {
        var hash = image_hash(this);
        hashes.push(hash);
        if (hashes.length === files.length) {
          var matched = compare_hashes(hashes);
          append_filenames(matched, files)
        }
        else process(index + 1);
      }
      img.src = url;
    }
    process(0);
  })
});
