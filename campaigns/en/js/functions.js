$(document).ready(function () {
  changeSlide();
  setInterval(changeSlide, 5000);
  $('.menu-button').on('click', toggle_menu);
  $('.main-nav-menu').on('click', '.touch-button', toggle_submenu);
  $(window).on('resize', function () {
    $('.main-nav-menu').removeClass('open-menu');
    $('.touch-button').remove();
    $('.main-nav-menu ul').removeClass('open');
  });
  $(':radio, :checkbox').prop('checked', false);
  $('#show-quiz').on('click', show_quiz);
  $('#next-quest').on('click', next_page);
  $('#prev-quest').on('click', prev_page);
  $('#quiz :radio').on('change', quiz_radio);
  $('.single-check :checkbox').on('change', single_check);
  $('#new-search').on('click', new_search);
});
function changeSlide() {
  if (!$('.slide:visible').length) {
    $('.slide:first').show();
  } else {
    var current = $('.slide:visible');
    current.hide();
    if (current.next().length) {
      current.next().show();
    } else {
      $('.slide:first').show();
    }
  }
}
function toggle_menu(e) {
  e.preventDefault();
  $('.main-nav-menu').toggleClass('open-menu');
  if ($('.main-nav-menu').hasClass('open-menu')) {
    var button = '<span class="touch-button fa fa-chevron-circle-down active"></span>';
    $('.main-nav-menu ul').after(button);
  } else {
    $('.touch-button').remove();
  }
}
function toggle_submenu(e) {
  var menu = $(this).prev('ul');
  $(menu).toggleClass('open');
}
function show_quiz(e) {
  e.preventDefault();
  $('#slides').addClass('open-quiz');
  $('#quiz').addClass('open');
  $('#quiz-cta, #new-search').hide();
}
function hide_quiz() {
  $('#slides').removeClass('open-quiz');
  $('#quiz').removeClass('open');
}
function quiz_radio() {
  var current_page = $('.quiz-page.current');
  var index = $('.quiz-page').index(current_page);
  var value = parseInt($('progress').prop('value'));

  if (value <= index) {
    value++;
    $('progress').prop('value', value);
    $('progress').text(value + '/' + $('progress').attr('max'));
  }
}
function single_check() {
  if ($(this).is(':checked')) {
    $(this).parents('.single-check').find(':checkbox').not($(this)).prop('checked', false);
  }
}
function next_page(e) {
  e.preventDefault();
  var current_page = $('.quiz-page.current');
  var index = $('.quiz-page').index(current_page);
  if (current_page.find(':radio').length && current_page.find(':checked').length == 0) {
    return;
  }
  if (index < $('.quiz-page').length - 1) {
    $('.quiz-page').removeClass('current');
    current_page.next().addClass('current');
  } else {
    //show results
    select_product();
  }
  //last page check
  var value = parseInt($('progress').prop('value'));
  current_page = $('.quiz-page.current');
  index = $('.quiz-page').index(current_page);

  if (index >= 2 && value <= index) {
    value++;
    console.log(current_page.find(':checked').length);
  } else if (current_page.find(':checked').length) {
    value = index + 1;
  }
  $('progress').prop('value', value);
  $('progress').text(value + '/' + $('progress').attr('max'));
}
function prev_page(e) {
  e.preventDefault();
  var current_page = $('.quiz-page.current');
  var index = $('.quiz-page').index(current_page);
  if (index > 0) {
    $('.quiz-page').removeClass('current');
    current_page.prev().addClass('current');

    var value = index;
    $('progress').prop('value', value);
    $('progress').text(value + '/' + $('progress').attr('max'));
  } else {
    hide_quiz();
  }
}
function new_search(e) {
  e.preventDefault();
  $('progress, #next-quest, #prev-quest, #quiz-pages').show();
  $('#quiz-results, #quiz-cta, #new-search').hide();
  $('#quiz :radio, #quiz :checkbox').prop('checked', false);
  $('.quiz-page').removeClass('current');
  $('.quiz-page:first').addClass('current');
  $('progress').prop('value', 0);
  $('progress').text('0/' + $('progress').attr('max'));
}
function select_product() {
  var products = {
    'i3x': {
      'img': 'result-i3x.png',
      'link': 'https://www.moleculardevices.com/quote-request?pid=spectramax-i3x-multi-mode-microplate-reader&cmp=70170000001LWlW',
      'name': 'SpectraMax i3x Multi-Mode Microplate Reader',
      'description': 'The SpectraMax® i3x is a multi-mode microplate reader system that evolves with your future needs and offers an unlimited breadth of application possibilities.'
    },
    'Paradigm': {
      'img': 'spectramax-paradigm_cartinsert.png',
      'link': 'https://www.moleculardevices.com/quote-request?pid=spectramax-paradigm-multi-mode-microplate-reader&cmp=70170000000dHvR',
      'name': 'SpectraMax Paradigm Multi-Mode Microplate Reader',
      'description': 'The SpectraMax Paradigm is a compact, capable, and user-upgradeable microplate reader that enables you to do more, with less.'
    },
    'FlexStation3': {
      'img': 'flexstation-3.png',
      'link': 'https://www.moleculardevices.com/quote-request?pid=flexstation-3-microplate-readers&cmp=70170000001LWlq',
      'name': 'FlexStation 3 Multi-Mode Microplate Reader',
      'description': 'With advanced dual optical systems operating above and below your microplates, the FlexStation® 3 Reader measures absorbance, fluorescence intensity, fluorescence polarization, luminescence, and time-resolved fluorescence.  '
    },
    'M-series': {
      'img': 'spectramax-m-series-transp-shadow.png',
      'link': 'https://www.moleculardevices.com/quote-request?pid=spectramax-m-series-multi-mode-microplate-readers&cmp=70170000001LWlb',
      'name': 'SpectraMax M Series',
      'description': 'With six different models to choose from, it\'s easy to find the one you want for your lab. Every SpectraMax® M Series Multi-Mode Microplate Reader does UV and visible absorbance, and fluorescence intensity measurements on microplates and cuvettes, standard.'
    },
    /*'M3':{
        'img':'SpectraMaxM5e_web_image.png',
        'link':''
        },
    'M2/2E':{
        'img':'SpectraMaxM5e_web_image.png',
        'link':''
        },*/
    'Plus 384': {
      'img': 'spectramax-abs-plus.png',
      'link': 'https://www.moleculardevices.com/quote-request?pid=spectramax-abs-and-abs-plus-absorbance-elisa-microplate-readers&cmp=70170000000dHvq',
      'name': 'SpectraMax Plus ABS Plus Microplate Reader',
      'description': 'Get absorbance measurements from 190 to 1000 nm quickly for samples in test tubes, cuvettes, and 96- or 384-well microplates. '
    },
    '340 PC 384': {
      'img': 'spectramax-abs-plus.png',
      'link': 'https://www.moleculardevices.com/quote-request?pid=spectramax-abs-and-abs-plus-absorbance-elisa-microplate-readers&cmp=70170000000dHvq',
      'name': 'SpectraMax Plus ABS Plus Microplate Reader',
      'description': 'Get absorbance measurements from 190 to 1000 nm quickly for samples in test tubes, cuvettes, and 96- or 384-well microplates. '
    },
    'versamax': {
      'img': 'spectramax-abs-plus.png',
      'link': 'https://www.moleculardevices.com/quote-request?pid=spectramax-abs-and-abs-plus-absorbance-elisa-microplate-readers&cmp=70170000000dHvq',
      'name': 'SpectraMax Plus ABS Plus Microplate Reader',
      'description': 'Get absorbance measurements from 190 to 1000 nm quickly for samples in test tubes, cuvettes, and 96- or 384-well microplates. '
    },
    'Gemini': {
      'img': 'Gemini_0.png',
      'link': 'https://www.moleculardevices.com/quote-request?pid=gemini-xps-and-em-microplate%20readers&cmp=70170000000dHtf',
      'name': 'Gemini EM Microplate Reader',
      'description': 'Create custom fluorescence assays without having to purchase expensive filter sets. The top- and bottom-reading Gemini EM Microplate Reader with dual monochromators lets you determine the optimal excitation and emission settings for your creative new fluorescence intensity assays. '
    },
    'SpectraMax L': {
      'img': 'spectraMax-l-lumi.png',
      'link': 'https://www.moleculardevices.com/quote-request?pid=spectramax-l-microplate-readers&cmp=70170000000dHuE',
      'name': 'SpectraMax L Microplate Reader',
      'description': 'Measure flash and glow assays, including dual luciferase reporter gene, G protein-coupled receptor (GPCR) via aequorin, bioluminsescence resonance energy transfer (BRET), and acridinium ester flash assays, in both 96- and 384-well plates.'
    },
    'Emax Plus': {
      'img': 'spectramax-abs-plus.png',
      'link': 'https://www.moleculardevices.com/quote-request?pid=spectramax-abs-and-abs-plus-absorbance-elisa-microplate-readers&cmp=70170000000dHvq',
      'name': 'SpectraMax Plus ABS Plus Microplate Reader',
      'description': 'Get absorbance measurements from 190 to 1000 nm quickly for samples in test tubes, cuvettes, and 96- or 384-well microplates. '
    },
    'QuickDrop': {
      'img': 'quickdrop.png',
      'link': 'https://www.moleculardevices.com/quote-request?pid=spectramax-quickdrop-micro-volume-spectrophotometers',
      'name': 'SpectraMax QuickDrop Micro-Volume Spectrophotometer',
      'description': 'Rapid, accurate DNA, RNA, and protein quantitation in a one-touch, full-spectrum micro-volume absorbance reader.'


    }
  };

  $.ajax({
    //url:'data/product_selector.json',
    url: 'data/product_selector_old.json',
    dataType: 'JSON',
    success: function (data) {
      var step1 = $('[name="quest1"]:checked').val();
      var step2 = $('[name="quest2"]:checked').val();
      var step3 = [];
      $('[name="quest3[]"]:checked').each(function () {
        step3.push($(this).val());
      });

      var product_result;
      var results = [];
      var lowest = 99;
      if (step3.length == 0) {
        step3 = [0];
      }
      $.each(step3, function (n, s) {
        var key = data[step1][step2][s].selections[0].result;
        results.push(key);
        var index = Object.keys(products).indexOf(key);
        if (index < lowest) {
          lowest = index;
          product_result = key;
        }
      });

      $('progress, #next-quest, #prev-quest, #quiz-pages').hide();
      $('#quiz-results, #quiz-cta, #new-search').show();

      var product_info = products[product_result];
      if (product_info != null) {
        $('#product-pic').attr('src', 'img/' + product_info.img);
        $('#quiz-cta').attr('href', product_info.link);
        $('#result-spotlight h3').text(product_info.name);
        $('#result-spotlight p').text(product_info.description);
      }

      /* add/remove cmp to all links */
      const isPPCpage = window.location.pathname.includes('chart-your-own-course-ppc');
      const isSalesTrainingPage = window.location.pathname.includes('chart-your-own-course-sales-training');
      const cmpValue = isPPCpage ? '701Rn00000OwhGZIAZ' : '701Rn00000JuHpdIAF';
      $('#quiz-results a, #quiz-cta, #new-search').each(function () {
        const url = new URL($(this).attr('href'), window.location.origin);
        if (isSalesTrainingPage) {
          url.searchParams.delete('cmp');
        } else {
          url.searchParams.set('cmp', cmpValue);
        }
        $(this).attr('href', url.toString());
      });
    }
  });
}
