function open_popup(images, urls) {
  $('#enlarged-duplicate').html(
    `<div class="selected">
      <img src="${urls[images[0]]}" alt="" />
    </div>
    <div class="info">
      <h4 class="graphite">img-299.jpg</h4>
      <p>May 05, 2015 at 13:11 &bull; Edited with VSCO cam</p>
    </div>
    <div class="angled-bg"></div>'`);

    $('#duplicate-selection').html(
      `<a href="#" class="thumbnail current select">
        <span></span>
        <img src="${urls[images[0]]}" alt"">
      </a>`
    );
    $('#duplicate-selection').append(
      images.slice(1).map(image =>
        `<a href="#" class="thumbnail select">
          <span></span>
          <img src="${urls[image]}" alt"">
        </a>
        `
      )
    );
    $( ".navigation a" ).click(function() {
      var src = $(this).find('img').attr('src');
      $('.enlarged-duplicate img').attr("src", src);
      $('.current').removeClass('current');
      $(this).addClass('current');
    });
  
    $( ".navigation a.select span" ).click(function() {
      $(this).parent('a').toggleClass('selected');
    });
    
    $('#close-duplicate-popup').click(function() {
      $('#selection-popup').hide();
    });

    $('#selection-popup').show();
}

// Output results
function present_results(matched, urls) {
  var res = '';
  matched.forEach(function(images) {
    images.forEach(function(imgIndex) {
      res += '<a class="thumbnail" href="#" onclick="open_popup([' + images +  '], [\'' + urls.join('\',\'') + '\'])">';
      res += '<img width="40" height ="40" src="' + urls[imgIndex] + '"></img>';
      res += '</a>';
    });
    res += '<br>';
  });
  if (matched.length === 0) {
    res += '<br>No matches found';
  }
  $('#results').html(res);
}

// Processing imagets
$().ready(function() {
  var hashes = [];
  var files;
  var urls;
  var dates;
  
  function update_results() {
    if (hashes.length == 0) {
      return;
    }

    if (!$('#limitTime').is(":checked")) {
      max_time = Infinity;
    }
    var matched = compare_hashes(hashes, dates, $('#sensitivity').val(), $('#maxTime').val() * 1000);
    var clustered = cluster_images(matched);
    present_results(clustered, urls);
  }
  
  $('#fileInput').change(function(e) {
    var URL = window.URL || window.webkitURL;
    files = e.target.files;
    $('#results').html('');
    if (files.length === 0) {
      $('#results').html('No images given');
    }
    hashes = [];
    dates = [];
    urls = [];
    var index = 0;
    function process(index) {
      $('#progress').html(`Processing: ${index} of ${files.length}...`);

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
          
          if (hashes.length !== files.length) {
            process(index + 1);
          }
          else {
            $('#progress').html('');
            
            update_results();
          }
        });
      }
      img.src = url;
    }
    process(0);
  });
  
  $('#sensitivity').mousemove(function() {
    $('#sensVal').html($(this).val());
    update_results();
  });
  
  $('#limitTime').change(update_results);
  
  $('#maxTime').mousemove(function() {
    $('#maxTimeVal').html($(this).val());
    update_results();
  });
});
