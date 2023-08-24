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
          'link':'http://go.moleculardevices.com/l/83942/2016-09-30/5w7cc3?cmp=70170000000v2cf',
          'name':'面向未来的检测平台SpectraMax i3x 多功能酶标仪',
          'description':'SpectraMax    i3x多功能读板机除了具有全波长的光吸收、荧光、化学发光和FRET检测功能以外，还兼容了客户端模块化升级功能，用户可以根据需要任何时间随意升级至荧光偏振FP、HTRF、AlphaScreen、Western Blot、细胞成像和带有注射器模式下的快速动力学检测等。'
        },
      'Paradigm':{
          'img':'SpectraMax Paradigm_cartinsert-TUNE.png', 
          'link':'http://go.moleculardevices.com/l/83942/2016-04-28/4fxy31?cmp=70170000000dHvR',
          'name':'SpectraMax Paradigm Multi-Mode Microplate Reader',
          'description':'The SpectraMax Paradigm is a compact, capable, and user-upgradeable microplate reader that enables you to do more, with less.'
        },
      'FlexStation3':{
          'img':'FlexStation3 TPBG.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-09-30/5w7jhh?cmp=70170000000v2dE',
          'name':'唯一整合了8或16通道液体转移系统的五功能的FlexStation 3 多功能酶标仪',
          'description':'FlexStation 3 把SpectraMax M5e和8道/16道的移液系统整合在一起成为体积小巧功能强大的读板机系统。该整合系统不但为用户提供了多功能检测平台，还增加了液体处理的通量和提升了检测生化和细胞动力学实验的灵活性，例如进行钙流检测和其他快速动力学检测。'
        },
      'M-series':{
          'img':'SpectraMaxM5e_web_image.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-09-30/5w7jgh?cmp=70170000000v2d4',
          'name':'SpectraMax M 系列多功能酶标仪',
          'description':'SpectraMax   M系列多功能酶标仪是一个模块化的、可升级的、双光栅连续光谱的检测平台，为生命科学研究及药物研发提供广泛应用及高性能表现。根据用户的特定应用及预算需求来选择不同功能的酶标仪。所有配置均提供比色皿插槽(可进行三种模式测读)、精确温度控制、微孔板振荡及使用SoftMax   Pro数据采集和分析软件进行综合数据管理。'
        },
      'Plus 384':{
          'img':'SpectraMaxPlus384 TPBG.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-09-30/5w7fm3?cmp=70170000000v2ck',
          'name':'全波长、多通道微孔板检测仪-SpectraMax Plus 384 光吸收型酶标仪',
          'description':'可以同时实现标准的分光光度计和微孔板读板机的功能，即读取任意一种标准规格的比色皿或12x75mm的试管、96或384孔的微孔板中的样品。即使是更高通量的检测要求，系统也能轻松的整合完整的机械化操作来配合您所要的实验进度和要求。'
        },
      '340 PC 384':{
          'img':'SpectraMax340PC384 TPBG.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-09-30/5w7jjy?cmp=70170000000v2cz',
          'name':'全波长、多通道微孔板检测仪-340PC384光吸收型酶标仪',
          'description':'提供检测可见光范围内的光吸收检测所需要的一切，包括温度控制、机械臂兼容平台和SoftMax Pro数据分析软件。其光学设计真实地模拟双光束分光光度计。每个孔有其各自的样品光束检测和参比检测。8通道的系统，包含8条样品检测光束和8条参比光束，给予出众的精确度和高速读板方式。'
        },
      'versamax':{
          'img':'VersaMax TPBG.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-09-30/5w7jj7?cmp=70170000000v2d9',
          'name':'全波长、多通道微孔板检测仪-Versamax光吸收型酶标仪',
          'description':'内置长寿命氙闪灯，光栅单色器拥有灵活检测优势，无需加配额外的滤光片，波长范围340nm至850nm，相当于配备了511块滤光片。可用于检测圆底、平底和半面积的96孔板检测，双波长读板可报告每个波长的实际光吸收值，数据可以根据用户的需求进行分析。'
        },
      'Gemini':{
          'img':'Gemini_0.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-05-19/4mq2tp?cmp=70170000000dHtf',
          'name':'全波长、双光路-Gemini EM荧光型酶标仪',
          'description':'采用双光栅型单色器，可以检测各种新颖的荧光染料分子而无须另外购买昂贵的滤光片。无论是针对均匀溶液荧光信号的检测或者是贴壁细胞荧光强度的判断，其具有的顶部、底部双荧光光路都可以轻松应对、自由切换。'
        },
      'SpectraMax L':{
          'img':'SpectraMaxL-Lumi+ TPBG_edit.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-09-30/5w7jgr?cmp=70170000000v2cp',
          'name':'超灵敏、高通量的-SpectraMax L化学发光型酶标仪',
          'description':'独特光路设计以及标配有单光子计数PMT在分析物的检测和基因更低水平表达检测上提供出众的信噪比率，多通道自动注射器可以满足不同实验的需求，如化学发光中快反应和慢反应，包括双荧光素酶和Y啶脂快反应等。'
        },
      'Emax Plus':{
          'img':'EMax_Plus-1_NoBckgd_new.png',
          'link':'http://go.moleculardevices.com/l/83942/2016-11-01/66klf5?cmp=70170000000v76E',
          'name':'高性价比滤光片光吸收型酶标仪',
          'description':'Molecular Devices新出品的CMax Plus是一款专门为科研实验室量身打造的灵活且强大的微孔板读板机，可软件上自定义多种检测模板及给出结果评价。仪器支持不同类型的96孔板，应用的覆盖范围广泛，包括蛋白定量、细胞活力、农药残留、各种ELISA实验等。它体积小，内置8位滤光片位，标配6个滤光片。只需几秒即可获得结果，分析软件全中文界面操作。'
        }
    };
    
    $.ajax({
        //url:'data/product_selector.json',
        url:'data/product_selector_old.json',
        dataType:'text',
        success:function(data1){
			var data = JSON.parse(data1);
			
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