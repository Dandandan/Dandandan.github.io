var SIMILARITY_TRESHOLD = 5;

pica.WW = false;

/**
 * Resize image to specified dimension
 *
 * @param image  Image                    Image to scale 
 * @param width  Number                   Width of resized picture
 * @param height Number                   Height of resized picture
 * @returns      CanvasRenderingContext2D Rendering context
 */
function resize(image, width, height) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);
  return context;
}

/**
 * Convert image to Canvas
 *
 * @param Image image
 * @returns 
 */
function image_to_canvas(image) {
  var canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  var context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, image.width, image.height);
  return canvas;
}


/**
 * Convert to image to gray scale number
 * @param context CanvasRenderingContext2D  Rendering context
 * @param width   Number                    Width of resized picture
 * @param height  Number                    Height of resized picture
 * @returns [Number]                        Values of grayscale pictures
 */
function grayscale(context, width, height) {
  var imageData = context.getImageData(0, 0, width, height);
  var pixels = imageData.data;
  var nPixels = [];
  var length = width * height * 4;
  for (var i = 0; i < length; i += 4) {
    var r = pixels[i];
    var g = pixels[i+1];
    var b = pixels[i+2];
    
    // Convert to grayscale using some weights (human sensitivity to colors)
    var gray = r * .3 + g * .59 + b * .11;
    nPixels.push(gray);
  }
  return nPixels;
}

/**
 * Computes hash of image using "avarage hashing"
 *
 * @param image
 * @returns [Number] bit vector
 */
function image_hash(image) {
  var canvas = image_to_canvas(image);
  var result = document.createElement('canvas');
  result.width = 8;
  result.height = 8;
  var bits;
  pica.resizeCanvas(canvas, result, {quality: 3}, function(_e, d) {
    var context = result.getContext('2d');

    var grayScaled = grayscale(context, 8, 8);
    
    var sum = grayScaled.reduce(function(a, b) {
      return a + b;
    });

    var average = sum / grayScaled.length;
    
    // compute whether value is lower than average value
    bits = grayScaled.map(function(v) {
      return v < average ? 1 : 0;
    });
  });
  return bits;
  }

/**
 * Computes hamming distance
 *
 * @param hash [Number] First hash
 * @param hash [Number] Second hash
 * @returns Number      Distance between the two
 */
function hamming_distance(hash1, hash2) {
  var dist = 0;
  for (var h = 0; h < hash1.length; h++) {
    dist += Math.abs(hash1[h] - hash2[h])
  }
  return dist;
}

/**
 * Compare all hashes
 *
 * @param [Images]
 * @returns [(Int, Int, Int)] Pairs with index, 
 */
function compare_hashes(hashes) {  
  // Compute distances between images
  var distLists = hashes.map(function(hash, index) {
    var dists = [];
    for (var other = index + 1; other < hashes.length; other++) {
      var dist = hamming_distance(hashes[index], hashes[other]);
      if (dist <= SIMILARITY_TRESHOLD) {
        dists.push([index, other, dist]);
      }
    }
    
    return dists;
  });
  
  return [].concat.apply([], distLists)
}

function append_filenames(matched, files) {
  matched.forEach(function(v) {
    document.body.innerHTML += "<br>Matched " + files[v[0]].name + " with " + files[v[1]].name + ", distance: " + v[2];
  });
  if (matched.lenght == 0) {
    document.body.innerHTML += "No matches found";
  }
}

// Uploading code
$().ready(function() {
  $('#fileInput').change(function(e) {
    let URL = window.URL || window.webkitURL;
    let files = e.target.files;
    let hashes = [];
    for (var f = 0; f < files.length; f++) {
      let file = files[f];
      let url = URL.createObjectURL(file);
      let img = new Image();
      img.onload = function() {
        let hash = image_hash(this);
        hashes.push(hash);
        if (hashes.length == e.target.files.length) {
          var matched = compare_hashes(hashes);
          append_filenames(matched, files)
        }
      }
      img.src = url;
    }
  })
});
