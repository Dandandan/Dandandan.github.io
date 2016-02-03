// Output results
function present_results(matched, urls) {
  var res = '';
  matched.forEach(function(v) {
    res += '<img width="40" height ="40" src="' + urls[v[0]] + '"></img>';
    res += '<img width="40" height ="40" src="' + urls[v[1]] + '"></img>';
    res += '<br>';
  });
  if (matched.length === 0) {
    res += '<br>No matches found';
  }
  $('#results').html(res);
}

// Processing imagets
$().ready(function() {
  var sensitivity = $('#sensitivity').val();
  
  var hashes = [];
  var files;
  var urls;
  var dates;
  var max_time = 15000;
  
  function update_results() {
    if (hashes.length == 0) {
      return;
    }

    if (!$('#limitTime').is(":checked")) {
      max_time = Infinity;
    }
    var matched = compare_hashes(hashes, dates, sensitivity, max_time);
    present_results(matched, urls);
  }
  
  $('#fileInput').change(function(e) {
    var URL = window.URL || window.webkitURL;
    files = e.target.files;
    if (files.length === 0) {
      $('#results').html('No images given');
    }
    hashes = [];
    dates = [];
    urls = [];
    var index = 0;
    function process(index) {
      $('#progress').html('Processing: ' + index + ' of ' + files.length);

      var file = files[index];
      var url = URL.createObjectURL(file);
      urls.push(url);
      var img = new Image();
      img.onload = function() {
        var hash = image_hash(this);
        hashes.push(hash);
        EXIF.getData(this, function() {
          date = EXIF.getTag(this, 'DateTimeOriginal');
          if (date) {
            date = date.split(' ');
            date[0] = date[0].replace(/:/g, ',');

            dates.push(new Date(date[0] + ' ' + date[1]));
          } else {
            dates.push(null);
          }
          update_results();
          
          if (hashes.length !== files.length) {
            process(index + 1);
          }
          else {
            $('#progress').html('');
          }
        });
      }
      img.src = url;
    }
    process(0);
  });
  
  $('#sensitivity').mousemove(function() {
    sensitivity = $(this).val();
    $('#sensVal').html(sensitivity);
    update_results();
  });
  
  $('#limitTime').change(update_results);
  
  $('#maxTime').mousemove(function() {
    max_time = $(this).val() * 1000;
    $('#maxTimeVal').html($(this).val());
    update_results();
  });
});
