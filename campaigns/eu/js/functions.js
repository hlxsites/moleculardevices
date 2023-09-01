$(document).ready(function(){
    changeSlide();
    setInterval(changeSlide, 5000);
    $('.menu-button').on('click', toggle_menu);
    $('.main-nav-menu').on('click','.touch-button', toggle_submenu);
    $(window).on('resize', function(){
        $('.main-nav-menu').removeClass('open-menu');
        $('.touch-button').remove();
        $('.main-nav-menu ul').removeClass('open');
    });
    $(':radio, :checkbox').prop('checked',false);
    $('#show-quiz').on('click', show_quiz);
    $('#next-quest').on('click', next_page);
    $('#prev-quest').on('click', prev_page);
    $('#quiz :radio').on('change', quiz_radio);
    $('.single-check :checkbox').on('change',single_check);
    $('#new-search').on('click', new_search);
});
function changeSlide(){
    if (!$('.slide:visible').length){
        $('.slide:first').show();
    }else{
        var current = $('.slide:visible');
        current.hide();
        if (current.next().length){            
            current.next().show();
        }else{
            $('.slide:first').show();
        }
    }    
}
function toggle_menu(e){
    e.preventDefault();
    $('.main-nav-menu').toggleClass('open-menu');
    if ($('.main-nav-menu').hasClass('open-menu')){
        var button = '<span class="touch-button fa fa-chevron-circle-down active"></span>';
        $('.main-nav-menu ul').after(button);
    }else{
        $('.touch-button').remove();
    }
}
function toggle_submenu(e){
    var menu = $(this).prev('ul');    
    $(menu).toggleClass('open');
}
function show_quiz(e){
    e.preventDefault();
    $('#slides').addClass('open-quiz');
    $('#quiz').addClass('open');
    $('#quiz-cta, #new-search').hide();
}
function hide_quiz(){    
    $('#slides').removeClass('open-quiz');
    $('#quiz').removeClass('open');    
}
function quiz_radio(){
    var current_page = $('.quiz-page.current');
    var index = $('.quiz-page').index(current_page);
    var value = parseInt($('progress').prop('value'));

    if (value <= index){
        value++;
        $('progress').prop('value', value);
        $('progress').text(value+'/'+$('progress').attr('max'));
    }
}
function single_check(){
    if ($(this).is(':checked')){
        $(this).parents('.single-check').find(':checkbox').not($(this)).prop('checked', false);
    }
}
function next_page(e){
    e.preventDefault();    
    var current_page = $('.quiz-page.current');
    var index = $('.quiz-page').index(current_page);
    if (current_page.find(':radio').length && current_page.find(':checked').length == 0){
        return;
    }
    if (index < $('.quiz-page').length-1){        
        $('.quiz-page').removeClass('current');
        current_page.next().addClass('current');
    }else{
        //show results
        select_product();              
    }
    //last page check
    var value = parseInt($('progress').prop('value'));
    current_page = $('.quiz-page.current');
    index = $('.quiz-page').index(current_page);

    if (index >= 2 && value <= index){
        value++;
        console.log(current_page.find(':checked').length);              
    }else if (current_page.find(':checked').length){
        value = index+1;
    }   
    $('progress').prop('value', value);
    $('progress').text(value+'/'+$('progress').attr('max'));  
}
function prev_page(e){
    e.preventDefault();
    var current_page = $('.quiz-page.current');
    var index = $('.quiz-page').index(current_page);
    if (index > 0){
        $('.quiz-page').removeClass('current');
        current_page.prev().addClass('current');
        
        var value = index;        
        $('progress').prop('value', value);
        $('progress').text(value+'/'+$('progress').attr('max'));
    }else{
        hide_quiz();
    }
}
function new_search(e){
    e.preventDefault();
    $('progress, #next-quest, #prev-quest, #quiz-pages').show();
    $('#quiz-results, #quiz-cta, #new-search').hide();
    $('#quiz :radio, #quiz :checkbox').prop('checked', false);
    $('.quiz-page').removeClass('current');
    $('.quiz-page:first').addClass('current');
    $('progress').prop('value', 0);
    $('progress').text('0/'+$('progress').attr('max'));
}
function select_product(){
    var products = {
      'i3x':{
          'img':'result-i3x.png', 
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfdp7?cmp=70170000001DQtL',
          'name':'SpectraMax i3x Multi-Mode Microplate Reader',
          'description':'The SpectraMax® i3x is a multi-mode microplate reader system that evolves with your future needs and offers an unlimited breadth of application possibilities.'
        },
      'Paradigm':{
          'img':'SpectraMax Paradigm_cartinsert-TUNE.png', 
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfj5f?cmp=70170000001DQtp',
          'name':'SpectraMax Paradigm Multi-Mode Microplate Reader',
          'description':'The SpectraMax Paradigm is a compact, capable, and user-upgradeable microplate reader that enables you to do more, with less.'
        },
      'FlexStation3':{
          'img':'FlexStation3 TPBG.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-06/4vpywp?cmp=70170000001DQsr',
          'name':'FlexStation 3 Multi-Mode Microplate Reader',
          'description':'With advanced dual optical systems operating above and below your microplates, the FlexStation® 3 Reader measures absorbance, fluorescence intensity, fluorescence polarization, luminescence, and time-resolved fluorescence.  '
        },
      'M-series':{
          'img':'SpectraMaxM5e_web_image.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfhb5?cmp=70170000001DQta',
          'name':'SpectraMax M Series',
          'description':'With six different models to choose from, it\'s easy to find the one you want for your lab. Every SpectraMax® M Series Multi-Mode Microplate Reader does UV and visible absorbance, and fluorescence intensity measurements on microplates and cuvettes, standard.'
        },
      /*'M3':{
          'img':'SpectraMaxM5e_web_image.png',
          'link':''
        },
      'M2/2E':{
          'img':'SpectraMaxM5e_web_image.png',
          'link':''
        },*/
      'Plus 384':{
          'img':'SpectraMaxPlus384 TPBG.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wflq7?cmp=70170000001DQuJ',
          'name':'SpectraMax Plus 384 Microplate Reader',
          'description':'Get absorbance measurements from 190 to 1000 nm quickly for samples in test tubes, cuvettes, and 96- or 384-well microplates. '
        },
      '340 PC 384':{
          'img':'SpectraMax340PC384 TPBG.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfk5f?cmp=70170000001DQu4',
          'name':'SpectraMax 340PC384 Microplate Reader',
          'description':'Acquire data in endpoint, kinetic, and spectral scan modes using wavelegths from 340-850 nm, tunable in 1 nm increments. The SpectraMax® 340PC384 Microplate Reader comes with temperature control up to 45 °C, a robotics-compatible interface, and  SoftMax® Pro Data Analysis Software. PathCheck® Sensor technology automatically measures the liquid depth of each well, and can also be used to calculate concentrations without a standard curve and expand the dynamic range of your readings to 6+ OD.'
        },
      'versamax':{
          'img':'VersaMax TPBG.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfhb5?cmp=70170000001DQta',
          'name':'VersaMax Microplate Reader',
          'description':'Make the most of your budget with the VersaMax™ ELISA Microplate Reader, our affordable, visible spectrum absorbance reader for 96-well microplates. This richly featured reader gives you the speed, convenience, and economy of monochromator-based wavelength selection for visible absorbance measurements between 340 nm and 850 nm, so you can accomplish more, with less'
        },
      'Gemini':{
          'img':'Gemini_0.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfdjy?cmp=70170000001DQt6',
          'name':'Gemini EM Microplate Reader',
          'description':'Create custom fluorescence assays without having to purchase expensive filter sets. The top- and bottom-reading Gemini EM Microplate Reader with dual monochromators lets you determine the optimal excitation and emission settings for your creative new fluorescence intensity assays. '
        },
      'SpectraMax L':{
          'img':'SpectraMaxL-Lumi+ TPBG_edit.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wjjhm?cmp=70170000001DQun',
          'name':'SpectraMax L Microplate Reader',
          'description':'Measure flash and glow assays, including dual luciferase reporter gene, G protein-coupled receptor (GPCR) via aequorin, bioluminsescence resonance energy transfer (BRET), and acridinium ester flash assays, in both 96- and 384-well plates.'
        },
      'Emax Plus':{
          'img':'EMax Plus-1_NoBckgd.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-03/4sxht5?cmp=70170000001DQsN',
          'name':'EMax Plus Microplate Reader',
          'description':'The EMax® Plus Microplate Reader gives you simple, walk-up access to the data you need to make your next decision. Eight filter modes enable visible-wavelength absorption measurement applications such as protein quantification, cell viability and ELISA.'
        },
		'QuickDrop':{
          'img':'quickdrop.png',
          'link':'https://www.moleculardevices.com/spectramax-quickdrop-micro-volume-spectrophotometer',
          'name':'SpectraMax QuickDrop Micro-Volume Spectrophotometer',
          'description':'Rapid, accurate DNA, RNA, and protein quantitation in a one-touch, full-spectrum micro-volume absorbance reader.'
        
		  
	  }
    };
    
    $.ajax({
        //url:'data/product_selector.json',
        url:'data/product_selector_old.json',
        dataType:'JSON',
        success:function(data){
            var step1 = $('[name="quest1"]:checked').val();
            var step2 = $('[name="quest2"]:checked').val();
            /*var step3 = $('[name="quest3[]"]:checked').val();
            if (step3 == null || step3 == ''){
                step3 = 0;
            }
            var step4 = [];
            $('[name="quest4[]"]:checked').each(function(){
                step4.push($(this).val());
            });*/
            var step3 = [];
            $('[name="quest3[]"]:checked').each(function(){
                step3.push($(this).val());
            });
                     
            console.log(step1);
            console.log(step2);
            console.log(step3);            
            /*var selections = data[step1][step2][step3].selections;
            console.log(selections);*/
            var product_result;
            
            /*$.each(selections, function(n, product){
               var matches = 0;
               $.each(step4, function(m, sel){
                if (product.selection.indexOf(sel) != -1){
                   matches++;
                }    
               });
               
               if (matches >= step4.length){
                   product_result = product.result;
                   return false;
               }
            });*/
            var results = [];
            var lowest = 99;
            if (step3.length == 0){
                step3 = [0];
            }
            $.each(step3, function(n, s){
                var key = data[step1][step2][s].selections[0].result;
                results.push(key);
                var index = Object.keys(products).indexOf(key);
                if (index < lowest){
                    lowest = index;
                    product_result = key;
                }
            });
            
            console.log(results);
            
            console.log(product_result);
            
            
            $('progress, #next-quest, #prev-quest, #quiz-pages').hide();
            $('#quiz-results, #quiz-cta, #new-search').show();
            var product_info = products[product_result];
            if (product_info != null){
                $('#product-pic').attr('src','img/'+product_info.img);
                $('#quiz-cta').attr('href', product_info.link);
                $('#result-spotlight h3').text(product_info.name);
                $('#result-spotlight p').text(product_info.description);
            }  
        }
    })
    
    
}