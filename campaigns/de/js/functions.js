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
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfh9y?cmp=70170000001DQtV',
          'name':'SpectraMax i3x Multifunktions-Mikroplattenleser ',
          'description':'Der SpectraMax i3x ist ein Multifunktions-Mikroplattenleser-System, das sich mit Ihren zukünftigen Anforderungen weiterentwickelt und ein uneingeschränktes Spektrum an Anwendungsmöglichkeiten bietet.'
        },
      'Paradigm':{
          'img':'SpectraMax Paradigm_cartinsert-TUNE.png', 
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfjhk?cmp=70170000001DQtz',
          'name':'SpectraMax Paradigm Multifunktions-Mikroplattenleser ',
          'description':'Sichern Sie die Zukunft Ihres Labors mit dem SpectraMax Paradigm Multifunktions-Mikroplattenleser. Erhalten Sie das System, welches Ihnen  heute  die benötigten Daten bereitstellt –wenn Sie mehr brauchen, rüsten Sie Ihren Mikroplattenleser durch Upgrades für die weiteren Erkennungsmodi in weniger als zwei Minuten t  um.' 
        },
      'FlexStation3':{
          'img':'FlexStation3 TPBG.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfdbf?cmp=70170000001DQt1',
          'name':'FlexStation 3 Multifunktions-Mikroplattenleser',
          'description':'Mithilfe des modernen Dual-Optik-Systems, das über und unter Ihren Mikroplatten arbeitet, misst der FlexStation 3 Leser Absorption, Fluoreszenz-Intensität, Fluoreszenz-Polarisation, Lumineszenz, und zeitaufgelöste Fluoreszenz.'
        },
      'M-series':{
          'img':'SpectraMaxM5e_web_image.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfj3w?cmp=70170000001DQtk',
          'name':'Multifunktions-Mikroplattenleser der SpectraMax M- Serie',
          'description':'Bei sechs verschiedenen Modellen zur Auswahl fällt es nicht schwer, das richtige Modell für Ihr Labor zu finden. Jeder Multifunktions-Mikroplattenleser  der SpectraMax® M-Serie führt standardmäßig Messungen der Absorption von UV- und sichtbarem Licht sowie Fluoreszenz-Intensitätsmessungen an Mikroplatten und Küvetten durch.'
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
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4whplk?cmp=70170000001DQuT',
          'name':'SpectraMax Plus 384 Mikroplattenleser',
          'description':'Erhalten Sie schnelle Absorptionsmessungen von 190 bis 1000 nm für Proben in Reagenzgläsern, Küvetten und 96- oder 384-Well Mikroplatten.'
        },
      '340 PC 384':{
          'img':'SpectraMax340PC384 TPBG.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wflgp?cmp=70170000001DQuE',
          'name':'SpectraMax 340PC384 Mikroplattenleser ',
          'description':'Lassen Sie sich von den Antworten auf eine unendliche Reihe von Forschungsfragen inspirieren, die Ihnen der SpectraMax 340PC384 Mikroplatten-Leser bietet, unser einstellbarer Mikroplattenleser für die Absorption sichtbaren Lichts in 96- und 384-Well-Mikroplatten. Erfassen Sie Daten in Endpunkt-, kinetischen und spektralen Scanmodi unter Verwendung von Wellenlängen von 340-850 nm, die sich in 1 nm-Schritten einstellen lassen.'
        },
      'versamax':{
          'img':'VersaMax TPBG.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfj3w?cmp=70170000001DQtk',
          'name':'VersaMax-Mikroplattenleser',
          'description':'Machen Sie das Beste aus Ihrer Investitionmit dem VersaMax™-Mikroplattenleser, unserem preisgünstigen Leser für 96-Well Mikroplatten, der das sichtbare Absorptionsspektrum abdeckt. Dieser mit umfangreichen Funktionen ausgestattete Mikroplattenleser bietet Ihnen die Geschwindigkeit, Bequemlichkeit und Wirtschaftlichkeit einer monochromatorbasierten Wellenlängenauswahl für Absorptionsmessungen im sichtbaren Bereich zwischen 340 nm und 850 nm, sodass Sie mehr mit weniger erreichen.'
        },
      'Gemini':{
          'img':'Gemini_0.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wfdnc?cmp=70170000001DQtG',
          'name':'Gemini EM Mikroplattenleser',
          'description':'Erschaffen Sie kundenspezifische Fluoreszenz-Analysen, ohne teure Filtersets kaufen zu müssen. Der Ober- und Unterseiten-Mikroplattenleser Gemini EM mit Dual-Monochromatoren lässt Sie die optimalen Anregungs- und Emissionseinstellungen für Ihre neuen, kreativen Fluoreszenz-Intensitäts-Assays festlegen. '
        },
      'SpectraMax L':{
          'img':'SpectraMaxL-Lumi+ TPBG_edit.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-07/4wjjnr?cmp=70170000001DQux',
          'name':'SpectraMax L Mikroplattenleser ',
          'description':'Messen Sie Flash- und Glow-Analysen, einschließlich Dual-Luziferase Reporter Gen, G Protein-gekoppelte Rezeptoren (GPCR) über Aequorin, Biolumineszenz-Resonanz-Energietransfer  (BRET) sowie Acridiniumester-Flash-Analysen, in sowohl 96- als auch 384-Well-Platten.'
        },
      'Emax Plus':{
          'img':'EMax Plus-1_NoBckgd.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-06-06/4vhfpm?cmp=70170000001DQsX',
          'name':'EMax Plus Mikroplattenleser',
          'description':'Der EMax® Plus-Mikroplattenleser bietet einfachen, unmittelbaren Zugriff auf die Daten, die Sie für Ihre nächste Entscheidung benötigen. Acht Filtermodi ermöglichen Absorptionsmessungsanwendungen im sichtbaren Wellenlängenbereich, beispielsweise Proteinquantifizierung, Zellviabilität und ELISA.'
        },
		'QuickDrop':{
          'img':'quickdrop.png',
          'link':'https://www.moleculardevices.com/spectramax-quickdrop-micro-volume-spectrophotometer',
          'name':'SpectraMax QuickDrop-Spektralphotometer für Niedrigstmengen',
          'description':'One-Touch-Vollspektrum-Absorptionslesegerät zur schnellen, genauen DNA-, RNA- und Proteinquantifizierung bei Niedrigstmengen.'
        
		  
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