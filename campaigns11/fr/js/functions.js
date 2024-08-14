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
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wffr3?cmp=70170000001DQtQ',
          'name':'Lecteur de microplaques multi-mode SpectraMax i3x',
          'description':'La technologie SpectraMax i3x est un lecteur de microplaques multi-mode qui évolue au fil de vos besoins et assure une variété infinie d’applications.'
        },
      'Paradigm':{
          'img':'SpectraMax Paradigm_cartinsert-TUNE.png', 
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfj5h?cmp=70170000001DQtu',
          'name':'Lecteur de microplaques multi-mode SpectraMax Paradigm',
          'description':'Anticipez l’avenir de votre laboratoire avec le lecteur de microplaques multi-mode SpectraMax Paradigm. Profitez d’un système qui vous fournit les données dont vous avez besoin aujourd’hui. Il vous faut un système plus performant ? Transformez votre lecteur grâce à la mise à niveau du mode de détection, qui s’effectue en moins de deux minutes.' 
        },
      'FlexStation3':{
          'img':'FlexStation3 TPBG.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfd7f?cmp=70170000001DQsw',
          'name':'Lecteur de microplaques multi-mode FlexStation 3',
          'description':'Grâce aux systèmes optiques de pointe placés au-dessus et en dessous de vos microplaques, le lecteur FlexStation 3 mesure l’absorbance, l’intensité de fluorescence, la polarisation de fluorescence, la luminescence et la fluorescence en temps différé.'
        },
      'M-series':{
          'img':'SpectraMaxM5e_web_image.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfhbc?cmp=70170000001DQtf',
          'name':'Lecteurs de microplaques multi-mode de la gamme SpectraMax M',
          'description':'Avec six modèles différents, il vous est beaucoup plus facile de trouver celui adapté à votre laboratoire. Par défaut, chaque lecteur de microplaques multi-mode de la gamme SpectraMax® M est optimisé pour réaliser l’absorbance visible et UV, ainsi que les mesures de l’intensité de fluorescence sur les microplaques et les cuvettes.'
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
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wg365?cmp=70170000001DQuO',
          'name':'Lecteur de microplaques SpectraMax Plus 384',
          'description':'Obtenez rapidement des mesures d’absorbance allant de 190 à 1 000 nm à partir d’échantillons contenus dans des tubes à essai, des cuvettes, ou encore des microplaques 96 ou 384 puits.'
        },
      '340 PC 384':{
          'img':'SpectraMax340PC384 TPBG.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfkhc?cmp=70170000001DQu9',
          'name':'Lecteur de microplaques SpectraMax 340PC384',
          'description':'Laissez-vous inspirer par les résultats d’analyse qu’est parvenu à obtenir le lecteur de microplaques SpectraMax 340PC384, notre lecteur d’absorbance visible programmable pour microplaques de 96 et de 384 puits. Obtenez des données en point final, cinétique ou balayage spectral dans la gamme de longueurs d’onde de 340 à 850 nm, programmables par incréments de 1 nm.'
        },
      'versamax':{
          'img':'VersaMax TPBG.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfhbc?cmp=70170000001DQtf',
          'name':'Lecteur de microplaques VersaMax',
          'description':'Optimisez votre investissement avec le lecteur de microplaques abordable VersaMax™ qui mesure l’absorbance du spectre visible sur les microplaques à 96 puits. Ce lecteur riche en fonctionnalités vous offre la rapidité, la commodité et le faible coût d’une sélection de longueurs d’onde par monochromateur pour des mesures d’absorbance visible entre 340 nm et 850 nm. Vous pouvez donc accomplir plus de tâches en dépensant moins.'
        },
      'Gemini':{
          'img':'Gemini_0.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfdm9?cmp=70170000001DQtB',
          'name':'Lecteur de microplaques Gemini EM',
          'description':'Créez vos propres dosages par fluorescence sans devoir acheter de kits de filtres coûteux. Le lecteur de microplaques Gemini EM à lecture inférieure et supérieure avec monochromateurs doubles vous permet de définir les paramètres d’excitation et d’émission adéquats pour vos nouveaux dosages d’intensité de fluorescence. '
        },
      'SpectraMax L':{
          'img':'SpectraMaxL-Lumi+ TPBG_edit.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wjjjk?cmp=70170000001DQus',
          'name':'Lecteur de microplaques SpectraMax L',
          'description':'Réalisez des dosages de type flash et glow, notamment du gène rapporteur de luciférase double, du récepteur couplé à la protéine G (GPRC) via l’aequorine, du transfert d’énergie par résonance de bioluminescence (BRET), ou encore des dosages d’ester d’acridinium de type flash, dans des plaques de 96 et 384 puits.'
        },
      'Emax Plus':{
          'img':'EMax Plus-1_NoBckgd.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-03/4sxhy3?cmp=70170000001DQsS',
          'name':'Lecteur de microplaques EMax Plus',
          'description':'Le lecteur de microplaques EMax® Plus offre un accès simple et unique aux données nécessaires pour prendre vos décisions. Les huit modes de filtre vous permettent d’effectuer des mesures d’absorption de longueurs d’ondes visibles telles que la quantification des protéines, la viabilité cellulaire et les tests ELISA.'
        },
		 'QuickDrop':{
          'img':'quickdrop.png',
          'link':'https://www.moleculardevices.com/spectramax-quickdrop-micro-volume-spectrophotometer',
          'name':'Spectrophotomètre micro-volume SpectraMax QuickDrop',
          'description':'Quantification rapide et précise de l’ADN, de l’ARN et des protéines en appuyant sur un seul bouton avec un lecteur d’absorbance micro-volume à spectre complet.'
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