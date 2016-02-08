
pica.WW = false;

/**
 * Halve dimensions of image, this uses the fast in 4x4 averaging of colors in browser
 * @param 
 * @returns 
 */
function down_stepping(canvas) {
  var newCanvas = document.createElement('canvas');
  newCanvas.width = canvas.width / 2;
  newCanvas.height = canvas.height / 2;
  var context = newCanvas.getContext('2d');
  context.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height) ;
  return newCanvas;
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
  context.drawImage(image, 0, 0);
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
 * Computes hash of image using "difference hashing (original)"
 *
 * @param image
 * @returns [Number] bit vector
 */
function image_hash(image) {
  var canvas = image_to_canvas(image);
  // down_step to min 16 pixel image
  while (canvas.height >= 16 && canvas.width >= 16) {
    canvas = down_stepping(canvas);
  }
  var result = document.createElement('canvas');
  result.width = 9;
  result.height = 8;
  var bits = [];
  // resize with high quality to 8x8 image
  pica.resizeCanvas(canvas, result, {quality: 3}, function(_e, d) {
    var context = result.getContext('2d');

    var grayScaled = grayscale(context, 9, 8);
    for (var i = 0; i < 8; i++ ) {
      for (var j = 1; j < 9; j++ ) {
        bits.push(grayScaled[i + j] < grayScaled[i + j - 1] ? 1 : 0);
      }
    }
  });
  
  var result = document.createElement('canvas');
  result.width = 8;
  result.height = 9;

  pica.resizeCanvas(canvas, result, {quality: 3}, function(_e, d) {
    var context = result.getContext('2d');

    var grayScaled = grayscale(context, 8, 9);
    for (var i = 0; i < 9; i++ ) {
      for (var j = 1; j < 8; j++ ) {
        bits.push(grayScaled[i + j] < grayScaled[i + j - 1] ? 1 : 0);
      }
    }
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

function time_diff(date1, date2) {
   if (!date1 || !date2) {
     return Infinity;
   }
   return Math.abs(date1.getTime() - date2.getTime());
}

/**
 * Compare all hashes
 *
 * @param hashes [String] Array of hashes
 * @param dates_taken [Dates]   Date/time of photo
 * @param max_distance Number   Maximum hamming distance
 * @returns [(Int, Int, Int)] Pairs with index, 
 */
function compare_hashes(hashes, dates_taken, max_distance, max_time_diff) {  
  // Compute distances between images
  var distLists = hashes.map(function(hash, index) {
    var dists = [];
    for (var other = index + 1; other < hashes.length; other++) {
      var dist = hamming_distance(hashes[index], hashes[other]);
      if (dist <= max_distance && time_diff(dates_taken[index], dates_taken[other]) < max_time_diff) {
        dists.push([index, other]);
      }
    }
    
    return dists;
  });
  
  return [].concat.apply([], distLists)
}

function unique(array) {
   var u = Object.create(null), a = [];
   for(var i = 0, l = array.length; i < l; ++i){
      if (u[array[i]] !== undefined) {
        continue;
      }
      a.push(array[i]);
      u[array[i]] = 1;
   }
   return a;
}


function cluster_images(matches) {
  var clusters = [];
  var indices = {};
  matches.forEach(function(m) {
    if (indices[m[0]] !== undefined) {
      var index = indices[m[0]];
      clusters[index].push(m[1]);
      indices[m[1]] = index;
    }
    else if (indices[m[1]] !== undefined) {
      var index = indices[m[1]];
      clusters[index].push(m[0]);
      indices[m[0]] = index;
    }
    else {
      var newIndex = clusters.length
      indices[m[0]] = newIndex;
      indices[m[1]] = newIndex;
      clusters.push([]);
      clusters[newIndex].push(m[0]);
      clusters[newIndex].push(m[1]);
    }
  });
  return clusters.map(unique);
}
