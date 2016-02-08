$(document).ready(function() {

  $( ".navigation a" ).click(function() {
    var src = $(this).find('img').attr('src');
    $('.enlarged-duplicate img').attr("src", src);

    $(this).toggleClass('current');
  });

  $( ".navigation a.select span" ).click(function() {
    $(this).parent('a').toggleClass('selected');
  });

});
