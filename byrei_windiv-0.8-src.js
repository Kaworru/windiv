/*
 * ByRei winDiv 0.8 - Div Window Script
 *
 * Copyright (c) 2008 Markus Bordihn (markusbordihn.de)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2008-06-23 18:00:00 +0100 (Mon, 23 June 2008) $
 * $Rev: 0.8 $
 */
/*global ByRei_winDiv ActiveXObject*/

ByRei_winDiv = {
 info: {
  Name: "ByRei winDiv",
  Version: 0.8,
  Author: "Markus Bordihn (http://markusbordihn.de)",
  Description: "Div Window Script"
 },

 cache: {
   font: '"Impact" fantasy',
   font_size: 16 + 'px',
   effect: null,
   effect_timer: null,
   effect_stepper: 0,
   prefix: 'winDiv_',
   background: '#000',
   opacity: 75,
   relpic: [],
   next_func: '',
   prev_func: '',
   head_h: 0,
   foot_h: 0,
   limit_h: 0,
   limit_w: 0,
   def_w: 0,
   def_h: 0,
   nobg: 0,
   error: 0,
   EvtBug: 0,
   hidden_obj: [],
   active: false,
   scrollTop: 0,
   scrollLeft: 0,
   fixed: (document.compatMode === 'CSS1Compat' && !(navigator.userAgent.indexOf("MSIE 6.",0) !== -1 && navigator.userAgent.indexOf("MSIE 7.",0) === -1)) ? 1 : 0,
   safari: (navigator.userAgent.indexOf("Safari") !== -1 || navigator.userAgent.indexOf("AppleWebKit") !== -1) ? 1: 0, 
   ie6: (navigator.userAgent.indexOf("MSIE 6.",0) !== -1 && navigator.userAgent.indexOf("MSIE 7.",0) === -1 ) ? 1 : 0,
   ie: window.attachEvent ? 1 : 0
 },
 
 id: {
  zIndex: 9999,
  def:     'def',
  bg:      'bg',
  body:    'body',
  content: 'content',
  top:     'top',
  bottom:  'bottom'
 },
 
 type: function(str) {
  var type='unknown';
  if (str) { 
   str = str.toLowerCase();
   if (str.match('.jpe?g|.png|.gif')) {type='img';}
   else if (str.match('youtube.com/(v/|watch)')) {type='youtube';}
   else if (str.match('(video.)?google.(com|de)/(videoplay|googleplayer.swf)')) {type='videogoogle';}
   else if (str.match('myvideo.de/movie/')) {type='myvideo';}
   else if (str.match('clipfish.de/videoplayer.swf')) {type='clipfish';}
   else if (str.match('veoh.com/(videos/|videodetails)')) {type='veoh';}
   else if (str.match('putfile.com/')) {type='putfile';}
   else if (str.match('sevenload.com/(pl|.*/.*-.*)')) {type='sevenload';}
   else if (str.match('megavideo.com/.?(v/|v=)')) {type='megavideo';}
   else if (str.match('.html?#swf')) {type='swf-fallback';}
   else if (str.match('.swf')) {type='swf';}
   else if (str.match('#')) {type='direct';}
   else if (str.match('.te?xt|.xml')) {type='txt';}
   else if (str.match('.pdf')) {type='plugin';}
   else if (str.match('.7?zip|.7z|.exe|.pdf|.tar|.rar')) {type='file';}
   else if (str.match('.s?d?x?html?|.php|.pl|.asp|.cgi')) {type='html';}
  }
  return type;
 },
 
 init: function() {
  var 
   found = 0,
   div_list = document.getElementsByTagName('a');

  for (var i=0;i<div_list.length;i++) {
   var classNames = div_list[i].className.split(' ');
   if (ByRei_winDiv.check_array(classNames,'winDiv')) {
    ByRei_winDiv.add(div_list[i], ByRei_winDiv.type(div_list[i].href));
    found++;
   }
  }
  // Preloader wird nur ausgeführt falls Elemente gefunden wurden
  if (found) {
   ByRei_winDiv.cache.evtBug = ByRei_winDiv.get('width') + ByRei_winDiv.get('height');
   ByRei_winDiv.hotkeys();
   if (ByRei_winDiv.cache.ie6) {
    ByRei_winDiv.set_eventListener(window, 'scroll', function(evt) {ByRei_winDiv.close();});
   } else {
    ByRei_winDiv.set_eventListener(window, 'scroll', function(evt) {
     if (ByRei_winDiv.cache.active) {
      if (ByRei_winDiv.cache.scrollTop !== ByRei_winDiv.get('top') || ByRei_winDiv.cache.scrollLeft !== ByRei_winDiv.get('left')) {
       window.scrollTo(ByRei_winDiv.cache.scrollLeft, ByRei_winDiv.cache.scrollTop);
      }
     } else {
      ByRei_winDiv.cache.scrollTop = ByRei_winDiv.get('top');
      ByRei_winDiv.cache.scrollLeft = ByRei_winDiv.get('left');
     }
    });
   }
   ByRei_winDiv.set_eventListener(window, 'resize', function(evt) {
    if(ByRei_winDiv.get('width') + ByRei_winDiv.get('height') !== ByRei_winDiv.cache.evtBug) {
     ByRei_winDiv.cache.evtBug = ByRei_winDiv.get('width') + ByRei_winDiv.get('height');
     ByRei_winDiv.close();
    }
   });
  }
 },

 add: function(obj,type) {
  if (obj && type) {
      var
       direct = null,
       nofooter = null,
       classNames = obj.className.split(' '),
       rel = (obj.rel||false),
       title = (obj.title||obj.alt||false),
       height = ByRei_winDiv.check_array(classNames, ByRei_winDiv.cache.prefix + 'height-',1),
       width = ByRei_winDiv.check_array(classNames, ByRei_winDiv.cache.prefix + 'width-',1),
	   effect = ByRei_winDiv.check_array(classNames, ByRei_winDiv.cache.prefix + 'effect-',1),
       nobg = ByRei_winDiv.check_array(classNames, ByRei_winDiv.cache.prefix + 'nobg') ? 1 : 0,
       noclose = ByRei_winDiv.check_array(classNames, ByRei_winDiv.cache.prefix + 'noclose') ? 1 : 0,
       scale = ByRei_winDiv.check_array(classNames, ByRei_winDiv.cache.prefix + 'scale') && (type === 'img') ? 1 : 0;
      
      if (ByRei_winDiv.check_array(classNames, ByRei_winDiv.cache.prefix + 'Ajax')) {type = 'ajax';}
      
      switch (type) {
        case "txt": case  "html" : case "unknown" : nofooter = 0; break;
        default: nofooter = 1; break;
      }

      nofooter = (ByRei_winDiv.check_array(classNames, ByRei_winDiv.cache.prefix + 'nofooter') || (!title && !rel && nofooter)) ? 1 : 0;
       
      if (rel) {
       ByRei_winDiv.cache.relpic.push([obj,rel,type]);
      }

      if (type === 'direct') {
       var div_list = document.getElementsByTagName('a');
       for (var i=0;i<div_list.length;i++) {
        if (div_list[i].name === obj.href.split('#')[1]) {
         if (div_list[i].parentNode.style) {
            div_list[i].parentNode.style.display = 'none';
            div_list[i].parentNode.style.visibility = 'hidden';
            direct = div_list[i].parentNode;
         }
        }
       }
      }
      
      ByRei_winDiv.set_eventListener(obj, 'click', function(evt){
        ByRei_winDiv.show(type, obj, title, rel, width, height, scale, nobg, nofooter, noclose, direct, effect);
        if (evt.returnValue) {evt.returnValue = false;}
        else if (evt.preventDefault) {evt.preventDefault();}
        else {return false;}
      });
  }
 },
 
 close: function() {
  ByRei_winDiv.cache.active=false;
  ByRei_winDiv.show_object();
  if (ByRei_winDiv.cache.error) {
      window.clearInterval(ByRei_winDiv.cache.error);
      ByRei_winDiv.cache.error = null;
  }
  if (ByRei_winDiv.getElem('def')) {
      ByRei_winDiv.getElem('def').style.display = 'none';
      document.body.removeChild(ByRei_winDiv.getElem('def'));
     }
  if (ByRei_winDiv.cache.effect_timer) {
      window.clearInterval(ByRei_winDiv.cache.effect_timer);
	  ByRei_winDiv.cache.effect_timer = ByRei_winDiv.cache.effect = null;
  }
  if (ByRei_winDiv.getElem('bg')) {
      document.body.removeChild(ByRei_winDiv.getElem('bg'));
  }
 },

 show: function(type, obj, title, rel, width, height, scale, nobg, nofooter, noclose, direct, effect) {
 
  if (ByRei_winDiv.cache.nobg) {
   ByRei_winDiv.close();
   ByRei_winDiv.cache.nobg = 0;
  }

  if (!nobg) {
   ByRei_winDiv.background();
  } else {
   ByRei_winDiv.cache.nobg = 1;
  }
  
  ByRei_winDiv.template(width, height, nofooter, noclose, nobg, scale, type, effect);
  
  if (ByRei_winDiv.getElem('content')) {
   ByRei_winDiv.hide_object();
   ByRei_winDiv.cache.active = true;
   
   var 
    obj_div = document.createElement("div"),    // Object Container
	content, obj_type; // Content & Object Type only for Object TAG
	

  if (scale && rel || !scale ) {ByRei_winDiv.message('Please wait loading...');}

  if (rel) {
    var
     prefix,
     found,
     prev_Obj,
     next_Obj,
     i2=0,
     navi = document.createElement("div"),
     navi_prev = document.createElement("div"),
     navi_next = document.createElement("div"),
     navi_text = document.createElement("div"),
     navi_func = function(navi_obj) {
       if (ByRei_winDiv.getElem('def')) {
        ByRei_winDiv.getElem('def').style.display = 'none';
        document.body.removeChild(ByRei_winDiv.getElem('def'));
       }
       ByRei_winDiv.show(ByRei_winDiv.type(navi_obj.href),navi_obj,navi_obj.title,rel, ByRei_winDiv.cache.limit_w, ByRei_winDiv.cache.limit_h, scale, nobg, nofooter, noclose);
     };
      
    for (var i=0;i<ByRei_winDiv.cache.relpic.length;i++) {
     if (obj === ByRei_winDiv.cache.relpic[i][0]) {found=++i2;}
     if (rel === ByRei_winDiv.cache.relpic[i][1] && obj !== ByRei_winDiv.cache.relpic[i][0]) {
      if (!next_Obj) {
       if (!found) {prev_Obj=ByRei_winDiv.cache.relpic[i][0];}
       else {next_Obj=ByRei_winDiv.cache.relpic[i][0];}
      }
      ++i2;
     }
    }

    ByRei_winDiv.cache.prev_func = ByRei_winDiv.cache.next_func = "";
     
    // Navi Style 
    navi_text.style.display = 'block';
    navi_text.style.textAlign = 'center';
    navi.style.position = 'relative';
    navi.style.padding = '4px';
    navi_prev.style.position = navi_next.style.position = 'absolute';
    navi_prev.style.top = navi_next.style.top = 0;
    navi_prev.style.fontFamily = navi_next.style.fontFamily = ByRei_winDiv.cache.font;
    navi_prev.style.fontSize = navi_next.style.fontSize = ByRei_winDiv.cache.font_size;
    navi_prev.style.cursor = navi_next.style.cursor = 'pointer';
    navi_prev.style.left = navi_next.style.right = '5px'; 

    // Set Preview for Navigation
    switch (type) {
     case "img": prefix = 'Bild'; break;
     case "youtube" : case "videogoogle" : case "myvideo" : case "clipfish" : prefix = 'Video'; break;
     default: prefix = 'Seite'; break;
    }
    
    if (prev_Obj) {
     ByRei_winDiv.cache.prev_func = function() {navi_func(prev_Obj);};
     navi_prev.appendChild(document.createTextNode('[Prev]'));
     ByRei_winDiv.hover(navi_prev);
     ByRei_winDiv.set_eventListener(navi_prev, 'click', ByRei_winDiv.cache.prev_func);
     navi.appendChild(navi_prev);      
    }
    if (next_Obj) {
     ByRei_winDiv.cache.next_func = function(){navi_func(next_Obj);};
     navi_next.appendChild(document.createTextNode('[Next]'));
     ByRei_winDiv.hover(navi_next);
     ByRei_winDiv.set_eventListener(navi_next, 'click', ByRei_winDiv.cache.next_func);
     navi.appendChild(navi_next);     
    }
    
    navi_text.appendChild(document.createTextNode(((title) ? (title + ' ') : '') + ' ('+ prefix +': ' + found + ' von ' + i2 +')'));
    navi.appendChild(navi_text);
    ByRei_winDiv.title(navi);
   }
  
  switch(type) {
  //////////////
  //   IMAGE  //
  //////////////
  case "img":
   var ImageLoader = new Image();

   ByRei_winDiv.set_eventListener(ImageLoader, 'error', function(e){
     ByRei_winDiv.error_message('Error loading Image: ' + obj.href);
   });

   ByRei_winDiv.set_eventListener(ImageLoader, 'load', function(e){
     
     if (scale) { // Expand Screen to Image Size
      ByRei_winDiv.resize(ImageLoader.width , ImageLoader.height);
     }
     
     // Fix Image Size...
     var scale_img = ByRei_winDiv.scale(ImageLoader.width,ImageLoader.height);
     ImageLoader.width = scale_img.w;
     ImageLoader.height = scale_img.h;

     if (scale) { // Cropping Screen to Image
      ByRei_winDiv.resize(ImageLoader.width , ImageLoader.height);
     }

     if (ImageLoader.height < ByRei_winDiv.cache.limit_h) {ImageLoader.style.paddingTop = ((ByRei_winDiv.cache.limit_h - ImageLoader.height) / 2) + 'px';}
     
     ImageLoader.style.cursor = 'pointer';
     ByRei_winDiv.content(ImageLoader);
     ByRei_winDiv.visible(true);
   });
   ImageLoader.src=obj.href;
  break;
  ///////////////////////////////////////////////////////////////////////////////
  // YOUTUBE VIDEOGOOGLE MYVIDEO CLIPFISH VEOH SWF PUTFILE SEVENLOAD MEGAVIDEO //
  ///////////////////////////////////////////////////////////////////////////////
  case "youtube" : case "videogoogle" : case "myvideo" : case "clipfish" : case "veoh" : case "putfile" : case "sevenload" : case "megavideo" : case "swf" : case "swf-fallback" :
   if (obj.href.indexOf('http://') >= 0) {
    var 
	 url = obj.href,
     scale_obj = null,
	 scriptaccess = true,
	 autoplay = 'autoplay=1';
	 
	obj_type = 'application/x-shockwave-flash';
	 
    // Scaling    
    ByRei_winDiv.resize(ByRei_winDiv.get('width') , ByRei_winDiv.get('height')); // Expand to Screen    
    
    // URL Rewrite with Autoplay / Resize
    switch (type) {
     case "youtube" : 
      if (url.indexOf('watch?v=') >= 0) {url = url.replace(/watch\?v=/,'v/');}
      scale_obj = ByRei_winDiv.scale(425,355,true);
     break;
     case "videogoogle" :
      if (url.indexOf('videoplay') >= 0) {url = url.replace(/videoplay/,'googleplayer.swf');}
      scale_obj = ByRei_winDiv.scale(400,326,true);
     break;
     case "clipfish" :
      if (url.indexOf('as=0') >= 0) {url = url.replace(/as=0/,'as=1');}
      scale_obj = ByRei_winDiv.scale(464,380,true);
      autoplay = 'as=1';
     break;
     case "myvideo" : 
      scale_obj = ByRei_winDiv.scale(470,406,true);
     break;
     case "veoh" :
      if (url.indexOf('/videos/') >= 0) {url = url.replace(/\/videos\//,'/videodetails2.swf?player=videodetailsembedded&permalinkId=');}
      scale_obj = ByRei_winDiv.scale(540,438,true);
      autoplay = 'videoAutoPlay=1';
     break;
	 case "putfile" :
	  if (url.indexOf('putfile.swf') < 0) {url = url.replace(/media.putfile.com\//,'feat.putfile.com/flow/putfile.swf?videoFile=');}
	  scale_obj = ByRei_winDiv.scale(425,345,true);
	 break;
	 case "sevenload" :
	  if (url.indexOf('/swf') < 0) {url = 'http://de.sevenload.com/pl/'+ url.match(/.*\/(\w{7})\w*-/)[1] +'/500x408/swf';}
	  url += '?autoplay=1';
	  scale_obj = ByRei_winDiv.scale(500,408,true);
	 break;
	 case "megavideo" :
      if (url.indexOf('?v=') >= 0) {url = url.replace(/\?v=/,'v/');}
	  url += '.' + Math.floor(Math.random()*100000000) + '.0';
      scale_obj = ByRei_winDiv.scale(425,351,true);
	  scriptaccess = false;
	 break;
     case "swf-fallback" :
      if (url.indexOf('#swf') >= 0) {url = url.replace(/.htm#swf/,'.swf');}
     break;
    }    
   
    if (scale_obj) {ByRei_winDiv.resize(scale_obj.w,scale_obj.h);} // Resize to VideoPortal Player Size
   
    // Write Flash Container 
	content = ByRei_winDiv.object(obj_type,url,ByRei_winDiv.cache.limit_w,ByRei_winDiv.cache.limit_h,!ByRei_winDiv.cache.ie,{flashvars: autoplay, movie: url, allowFullScreen: "true", wmode: "window", AllowScriptAccess : (scriptaccess) ? "always" : "never" });
    if (ByRei_winDiv.cache.ie) {  
	    obj_div.innerHTML = content;  // IE Workarround
    } else { 
        obj_div.appendChild(content); // The DOM Way
    }
    ByRei_winDiv.content(obj_div);
   } else {
    ByRei_winDiv.error_message('Invalid URL: ' + url);
   } 
   break;
   ////////////////////////
   //  TXT HTML DEFAULT  //
   ////////////////////////
   case "txt": case  "html" : case "unknown" :
      switch (type) {
       case "txt" : obj_type = "text/plain"; break;
       case "html" : obj_type = "text/html"; break;
       default: obj_type = "text/html"; break;
      }
	  content = ByRei_winDiv.object(obj_type,obj.href,ByRei_winDiv.cache.limit_w,ByRei_winDiv.cache.limit_h,!ByRei_winDiv.cache.ie);
      if (ByRei_winDiv.cache.ie) {  
          obj_div.innerHTML = content;  // IE Workarround
      } else { 
          obj_div.appendChild(content); // The DOM Way
      }
     ByRei_winDiv.content(obj_div);
   break;
   ////////////
   //  AJAX  //
   ////////////
   case "ajax":
    ByRei_winDiv.remoteContent(obj.href);
   break;
   //////////////
   //  DIRECT  //
   //////////////
   case "direct":
    if (direct) {
	 if (direct.hasChildNodes()) {
	  var children = direct.childNodes;
	  for (i = 0; i < children.length; i++) {
	   ByRei_winDiv.show_object(children[i]);
	  }
	 }
     content = direct.cloneNode(true);
     content.style.display = 'block';
     content.style.visibility = 'visible';
     obj_div.appendChild(content);
     ByRei_winDiv.content(obj_div);
    } else {
     ByRei_winDiv.error_message('Error no Content found');
    }
   break;
   /////////////
   // DEFAULT //
   /////////////
   default:
    ByRei_winDiv.error_message('Error no Matching Type: ' + type);   
   break;
  }
    
  // Check Title and set Title
  var text = document.createElement("div");
  text.style.textAlign = 'center';
  
  if (title) {text.appendChild(document.createTextNode(title));} 
  else if (!rel) {text.appendChild(document.createTextNode('Source: ' + obj.href));}
  if (text.firstChild) {ByRei_winDiv.title(text);}
  } 
 },
 
 object: function(type,data,width,height,dom,attr) {
  var i,param;
  if (!dom) {
	for (i in attr) if (attr.hasOwnProperty(i)) {
	 param += '<param name="' + i + '" value="' + attr[i] + '">';
	}
	return '<object type="' + type +'" data="' + data + '" width="' + width + '" height="' + height +'">' + (param||" ") + '<\/object>';
  } else {
	 var obj = document.createElement("object");
	 obj.type = type;
	 obj.data = data;
	 obj.width = width + 'px';
	 obj.height = height + 'px';
	 for (i in attr) if (attr.hasOwnProperty(i)) {
	  param = document.createElement("param");
	  param.name = i;
	  param.value = attr[i];
	  obj.appendChild(param);
	 }
     return obj;
   }
 },

 title: function(content) {
  if (ByRei_winDiv.getElem('bottom') && content) {
   ByRei_winDiv.getElem('bottom').appendChild(content);
  }
 },
 
 content: function(content) {
  if (ByRei_winDiv.getElem('content') && content) {
   var c_div = ByRei_winDiv.getElem('content');
   if (c_div.firstChild) {c_div.replaceChild(content, c_div.firstChild);}
   else {c_div.appendChild(content);}
  }
 },
 
 resize: function(t_width, t_height) {
  if (ByRei_winDiv.getElem('def') && ByRei_winDiv.getElem('content') && ByRei_winDiv.getElem('body')) {
   var
    divpopup = ByRei_winDiv.getElem('def'),
    divbody = ByRei_winDiv.getElem('body'),
    divcontent = ByRei_winDiv.getElem('content');

   ByRei_winDiv.cache.limit_w = (Number(t_width) > 0 && Number(t_width) + 100 < ByRei_winDiv.get('width')) ? Number(t_width) : ByRei_winDiv.get('width') - 100;
   ByRei_winDiv.cache.limit_h = (Number(t_height) > 0 && Number(t_height) + 100 + ByRei_winDiv.cache.head_h < ByRei_winDiv.get('height')) ? Number(t_height) : ByRei_winDiv.get('height') - 100 - ByRei_winDiv.cache.head_h;
   ByRei_winDiv.cache.def_w = ByRei_winDiv.cache.limit_w + 6;
   ByRei_winDiv.cache.def_h = (ByRei_winDiv.cache.limit_h + ByRei_winDiv.cache.head_h + ByRei_winDiv.cache.foot_h + 10);
   divpopup.style.width =  ByRei_winDiv.cache.def_w + 'px';
   divpopup.style.height =  ByRei_winDiv.cache.def_h + 'px';
   divbody.style.height = (ByRei_winDiv.cache.limit_h + ByRei_winDiv.cache.foot_h) + 'px';
   divcontent.style.height = ByRei_winDiv.cache.limit_h + 'px';
   divcontent.style.width = ByRei_winDiv.cache.limit_w + 'px';
   divcontent.style.paddingLeft = 2 + 'px';
   divpopup.style.left = ((ByRei_winDiv.get('width') - ByRei_winDiv.cache.def_w) / 2) + (ByRei_winDiv.cache.fixed ? 0 : ByRei_winDiv.get('left')) + 'px';
   divpopup.style.top =  ((ByRei_winDiv.get('height') - ByRei_winDiv.cache.def_h - divpopup.style.paddingTop.split('px')[0]) / 2) + (ByRei_winDiv.cache.fixed ? 0 : ByRei_winDiv.get('top')) + 'px';
  }
 },

 template: function(t_width, t_height, nofoot, noclose, nobg, scale, type, effect) {
  if (!ByRei_winDiv.getElem('def')) {
   var 
    divpopup = document.createElement("div"),
    divbody = document.createElement("div"),
    divcontent = document.createElement("div"),
    divbottom = document.createElement("div"),
    c0_t = document.createElement("b"),
    c0_b = document.createElement("b"),
    c1 = document.createElement("b"),
    c2 = document.createElement("b"),
    c3 = document.createElement("b"),
    c4 = document.createElement("b"),
    c5 = document.createElement("b");

   ByRei_winDiv.cache.head_h = (noclose) ? 0 : 25;
   ByRei_winDiv.cache.foot_h = (nofoot) ? 0 : 20;
   
   // Set IDs
   divpopup.id = ByRei_winDiv.cache.prefix + ByRei_winDiv.id.def;
   divbody.id = ByRei_winDiv.cache.prefix + ByRei_winDiv.id.body;
   divcontent.id = ByRei_winDiv.cache.prefix + ByRei_winDiv.id.content;
   divbottom.id = ByRei_winDiv.cache.prefix + ByRei_winDiv.id.bottom;

   c0_t.style.height = c0_b.style.height = '5px';
   c0_t.style.overflow = c0_b.style.overflow = c1.style.overflow = c2.style.overflow = c3.style.overflow = c4.style.overflow = c5.style.overflow = divbottom.style.overflow = divpopup.style.overflow = 'hidden';

   // Round Corner Styles
   c1.style.display = c2.style.display = c3.style.display = c4.style.display = c5.style.display = 'block';
   c1.style.background = c2.style.background = c3.style.background = c4.style.background = c5.style.background = '#fff';
   c1.style.marginLeft = c1.style.marginRight = 3 + 'px';
   c1.style.height = c2.style.height = c3.style.height = c4.style.height = c5.style.height = c1.style.paddingLeft = c1.style.paddingRight = c2.style.marginLeft = c2.style.marginRight = c2.style.paddingRight = c2.style.paddingLeft = c3.style.marginLeft = c3.style.marginRight = '1px';
   c3.style.borderLeft = c3.style.borderRight = divbody.style.borderLeft = divbody.style.borderRight = '1px solid #cecece';
   c1.style.background = '#bfbfbf';
   c2.style.background = '#cecece';

   if (!nobg) {
    c1.style.borderLeft = c1.style.borderRight = c4.style.borderLeft = c4.style.borderRight = '1px solid #6d6d6d';
    c2.style.borderLeft = c2.style.borderRight = '1px solid #191919';
    c5.style.borderLeft = c5.style.borderRight = '1px solid #bfbfbf';
   } else {
    c1.style.borderLeft = c1.style.borderRight =  c2.style.borderLeft = c2.style.borderRight = c4.style.borderLeft = c4.style.borderRight = c5.style.borderLeft = c5.style.borderRight = '1px solid #cecece';
   }

   // Typ basierte Style Änderungen
    switch(type) {
     case "direct": case "ajax" : divcontent.style.overflow = 'auto'; break;
     default: divcontent.style.overflow = 'hidden'; break;
    }
   
   // Other Styles
    divcontent.style.textAlign = 'center';
	divpopup.style.paddingTop = ByRei_winDiv.cache.head_h + 'px';
    divpopup.style.position = ByRei_winDiv.cache.fixed ? 'fixed' : 'absolute';
    divpopup.style.zIndex = ByRei_winDiv.id.zIndex;
    divbody.style.background = '#fff';
    divbottom.style.height = ByRei_winDiv.cache.foot_h + 'px';
    divbottom.style.fontFamily = 'Verdana, Arial, Helvetica, sans-serif';
    divbottom.style.fontSize = 12 + 'px';

   // Create DIV Design
   c0_t.appendChild(c1);
   c0_t.appendChild(c2);
   c0_t.appendChild(c3);
   c0_t.appendChild(c4);
   c0_t.appendChild(c5);
   c0_b.appendChild(c5.cloneNode(true));
   c0_b.appendChild(c4.cloneNode(true));
   c0_b.appendChild(c3.cloneNode(true));
   c0_b.appendChild(c2.cloneNode(true));
   c0_b.appendChild(c1.cloneNode(true));

   // Close Button and Events
   if (!noclose) {
    var
     divtop = document.createElement("div"),
     divtop_cont = document.createElement("div"),
     divdummy = document.createElement("div");

    divtop_cont.id = ByRei_winDiv.cache.prefix + ByRei_winDiv.id.top;
    divtop.style.cursor = 'pointer';
    divtop.style.textAlign = 'center';
    divtop.style.height = ByRei_winDiv.cache.head_h + 'px';
    divtop.style.width = 150 + 'px';
    divtop.style.position = 'absolute';
    divtop.style.top = divdummy.style.height = 2 + 'px';
    divtop.style.right = ByRei_winDiv.cache.ie6 ? '-1px' : 0;
    divtop.style.fontFamily = ByRei_winDiv.cache.font;
    divtop.style.fontSize = ByRei_winDiv.cache.font_size;
    divtop_cont.style.minHeight = 21 + 'px';
	divtop_cont.style.background = divdummy.style.background = '#fff';
    divtop_cont.style.borderLeft = divtop_cont.style.borderRight = divdummy.style.borderRight = '1px solid #cecece';
    divtop_cont.appendChild(document.createTextNode('close Screen [X]'));
    divdummy.style.overflow = 'hidden';
    divdummy.style.borderLeft = '1px solid #fff';
        
    ByRei_winDiv.hover(divtop_cont);
    ByRei_winDiv.set_eventListener(divtop_cont, 'click', function(){ByRei_winDiv.close();});

    divtop.appendChild(c0_t.cloneNode(true));
    divtop.appendChild(divtop_cont);
    divtop.appendChild(divdummy);
    divbody.appendChild(divtop);
   }

   if (type === 'img') {
    ByRei_winDiv.set_eventListener(divcontent, 'click', function(e){
     if (ByRei_winDiv.cache.ie) {e.cancelBubble=true;}
     if (e.stopPropagation) {e.stopPropagation();}
     var target_div = e.target ? e.target : e.srcElement;
     if (!target_div.id) {ByRei_winDiv.close();}
    });
   }

   divbody.appendChild(divcontent);
   divbody.appendChild(divbottom);
   divpopup.appendChild(c0_t);
   divpopup.appendChild(divbody);
   divpopup.appendChild(c0_b);

   if (scale) {divpopup.style.display='none';}
   if (effect) {
       divpopup.style.clip = 'rect(0px 0px 0px 0px)';
   }
   
   document.body.appendChild(divpopup);
   ByRei_winDiv.resize(t_width, t_height);
   
   if (effect) {
       ByRei_winDiv.cache.effect_stepper = 0;
       ByRei_winDiv.cache.effect_timer = window.setInterval(function() {ByRei_winDiv.effect(effect);}, 10);
   }
  }
 },

 message: function(message, onscreen) {
  // Messages Generator
  var 
   c_div = ByRei_winDiv.getElem('content'),
   msg = document.createElement('div');

  msg.appendChild(document.createTextNode(message));
  msg.style.fontFamily = ByRei_winDiv.cache.font;
  msg.style.fontSize = ByRei_winDiv.cache.font_size;
  msg.style.width = ByRei_winDiv.get('width') + 'px';
  msg.style.textAlign = 'center';
  msg.style.position = 'absolute';
  msg.style.top = ((ByRei_winDiv.cache.limit_h - Number(msg.style.height.split('px')[0])) / 2) + 'px';
  msg.style.left = ((ByRei_winDiv.cache.limit_w - ByRei_winDiv.get('width')) / 2) + 'px';

  if (onscreen || !c_div.firstChild) {c_div.appendChild(msg);}
  else {c_div.replaceChild(msg, c_div.firstChild);}

  ByRei_winDiv.visible(true);
  ByRei_winDiv.hide_object(c_div);
 },

 error_message: function(message) {
  ByRei_winDiv.message(message);
  ByRei_winDiv.cache.error = window.setInterval(ByRei_winDiv.close, 5000);
 },

 hotkeys: function() {
  // Hot Keys
  var hotkey_func = function(evt) {
  var presskey = (evt) ? evt.keyCode : event.keyCode;
   if (presskey === 27 || presskey === 88) {ByRei_winDiv.close();} 
   else if (presskey === 37 || presskey === 100) {
       if (ByRei_winDiv.cache.prev_func) {ByRei_winDiv.cache.prev_func();}
   }
   else if (presskey === 39 || presskey === 102) {
       if (ByRei_winDiv.cache.next_func) {ByRei_winDiv.cache.next_func();}
   }
  };
  if (document.onkeyup === null) {document.onkeyup = hotkey_func;}
  else if (document.onkeyup) {document.onkeyup = document.onkeyup + '\n' + hotkey_func;}
  else {ByRei_winDiv.set_eventListener(document, 'keypress', hotkey_func);}
 },

 background: function() {
 var bg_div;
  if (!ByRei_winDiv.getElem('bg')) {
   bg_div = document.createElement("div");
   bg_div.id = ByRei_winDiv.cache.prefix + ByRei_winDiv.id.bg;
   bg_div.style.position = ByRei_winDiv.cache.fixed ? 'fixed' : 'absolute';
   bg_div.style.overflow = 'hidden';
   bg_div.style.zIndex = ByRei_winDiv.id.zIndex - 1;
   bg_div.style.top  = ByRei_winDiv.cache.fixed ? 0 : ByRei_winDiv.get('top') + 'px'; 
   bg_div.style.left = ByRei_winDiv.cache.fixed ? 0 : ByRei_winDiv.get('left') + 'px';
   bg_div.style.width = ByRei_winDiv.get('width') + 'px';
   bg_div.style.height = ByRei_winDiv.get('height') + 'px';
   bg_div.style.background = ByRei_winDiv.cache.background;
   bg_div.style.filter  = 'alpha(opacity:' + ByRei_winDiv.cache.opacity + ')';
   bg_div.style.opacity = (ByRei_winDiv.cache.opacity < 100) ? '0.' + ByRei_winDiv.cache.opacity : 1 ;
   document.body.appendChild(bg_div);
  } else {
   bg_div = ByRei_winDiv.getElem('bg');
   bg_div.style.display = 'block';
  }
 },

 getElem: function(elem) {
  if (elem) {
   return (document.getElementById(ByRei_winDiv.cache.prefix + ByRei_winDiv.id[elem]) ? document.getElementById(ByRei_winDiv.cache.prefix + ByRei_winDiv.id[elem]) : false);
  } else {
   return false;
  }
 },
 
 hide_object: function() {
  if (ByRei_winDiv.cache.ie || ByRei_winDiv.cache.safari) {
   var obj = [];
   
    if (document.getElementsByTagName("object").length > 0) {
        obj.push(document.getElementsByTagName("object"));
    } 
    
    if (document.getElementsByTagName("embed").length > 0) {
        obj.push(document.getElementsByTagName("embed"));
    } 
    
    if (ByRei_winDiv.cache.ie && document.getElementsByTagName("select").length > 0) {
        obj.push(document.getElementsByTagName("select"));
    }
    
    if (ByRei_winDiv.cache.ie && document.getElementsByTagName("iframe").length > 0) {
        obj.push(document.getElementsByTagName("iframe"));
    }
        
   for (var i2=0;i2<obj.length;i2++) {
    for (var i=0;i<obj[i2].length;i++) {
     if (obj[i2][i].style.visibility !== 'hidden' && obj[i2][i].style.display !== 'none') {
      ByRei_winDiv.cache.hidden_obj.push([obj[i2][i],obj[i2][i].style.visibility]);
      obj[i2][i].style.visibility='hidden';
     }
    } 
   }  
  }
 },
 
 show_object: function(object) {
  if (ByRei_winDiv.cache.hidden_obj) {
   for (var i=0;i<ByRei_winDiv.cache.hidden_obj.length;i++) {
    if (object) {
	 if (ByRei_winDiv.cache.hidden_obj[i][0] === object) {ByRei_winDiv.cache.hidden_obj[i][0].style.visibility = ByRei_winDiv.cache.hidden_obj[i][1];}
	} else {
	 ByRei_winDiv.cache.hidden_obj[i][0].style.visibility = ByRei_winDiv.cache.hidden_obj[i][1];
    }
   }
   if (!object) {ByRei_winDiv.cache.hidden_obj=[];}
  }
 },

 scale: function(w0,h0,max,w1,h1) {
  if (w0 && h0) {
   var scale = w0/h0;
   if (!w1 || !h1) {
    w1 = ByRei_winDiv.cache.limit_w;
    h1 = ByRei_winDiv.cache.limit_h;
   }

   if (!max) {
    if (w0 > w1 && h0 > h1) {
      if ((w0 - w1 > h0 - h1)) {w0 = w1; h0 = w1 / scale;} 
      else if ((w0 - w1 < h0 - h1)) {w0 = h1 * scale;h0 = h1;}
    }
    if (w0 > w1) {w0 = w1; h0 = w1 / scale;} 
    if (h0 > h1) {w0 = h1 * scale; h0 = h1;}
   } else {
    if (w1/scale < h1) {
     w0 = w1;
     h0 = w1/scale;
    }
    else if (h1*scale < w1) {
     w0 = h1*scale;
     h0 = h1;
    }
   }
   return {w: w0, h: h0};
  }
 },
 
 hover: function(obj) {
  if (obj) {
      ByRei_winDiv.set_eventListener(obj, 'mouseover', function(){obj.style.color = '#f00';});
      ByRei_winDiv.set_eventListener(obj, 'mouseout',  function(){obj.style.color = '#000';});
  }
 },
 
 get: function(elem) {
  switch(elem) {
   case "top"   : return Number(window.pageYOffset||document.body.scrollTop||document.documentElement.scrollTop);
   case "left"  : return Number(window.pageXOffset||document.body.scrollLeft||document.documentElement.scrollLeft);
   case "width" : return Number(self.innerWidth||document.documentElement.clientWidth||document.body.clientWidth);
   case "height": return Number(self.innerHeight||document.documentElement.clientHeight||document.body.clientHeight);
   default: return 0;
  }
 },
 
 remoteContent: function(url) {
   var http_request = false;
   if (window.XMLHttpRequest) { 
     http_request = new XMLHttpRequest();
     if (http_request.overrideMimeType) {http_request.overrideMimeType('text/xml');}
   } else if (window.ActiveXObject) {
     try {http_request = new ActiveXObject("Msxml2.XMLHTTP");} catch (e) {try {http_request = new ActiveXObject("Microsoft.XMLHTTP");} catch (e2) {}}
   }

   if (!http_request) {
     ByRei_winDiv.error_message('Cant create XMLHTTP-Object');
   } else {
    http_request.onreadystatechange = function() {
      if (http_request.readyState === 4) {
        if (http_request.status === 200) {
         var 
          response = http_request.responseText,
          obj_div = document.createElement('div');
          
         if (response.indexOf('<body>')) {
          response = response.split('<body>')[1];
          if (response.indexOf('<\/body>')) {
           response = response.split('<\/body>')[0];
          }
         }
         
         if (response) {
              obj_div.innerHTML = response;
              obj_div.background = '#fff';
              ByRei_winDiv.content(obj_div);
          } else {
             ByRei_winDiv.error_message('Empty Content');
          }
        }
        else {ByRei_winDiv.error_message('There is an Error with the Request (' + http_request.status + ')');}
      }
    };
    if (url.indexOf('http:') >= 0 || !window.location.hostname) {
     if (!url.match(window.location.hostname) || !window.location.hostname ) {
      ByRei_winDiv.error_message('Offline Test and Crossdomain are not possible over AJAX !');
      http_request=false;
     }
    }
    if (http_request) {
     http_request.open('GET', url, true);
     http_request.send(null);
    }
   }
 },
 
 effect: function(modus) {
  if (modus && ByRei_winDiv.getElem('def')) { 
    
   var 
    x1 = 0,
    y2 = 0,
    y1 = ByRei_winDiv.cache.def_w,
	x2 = ByRei_winDiv.cache.def_h;
  
   ByRei_winDiv.cache.effect_stepper += 10; 
  
   if (ByRei_winDiv.cache.effect) {
   	   modus = ByRei_winDiv.cache.effect;
   } else {
       ByRei_winDiv.cache.effect = modus;
   }
  
   switch(modus) {
    case "down"   : x2 = ByRei_winDiv.cache.effect_stepper; break;
    case "up"     : x1 = ByRei_winDiv.cache.def_h - ByRei_winDiv.cache.effect_stepper; break;
    case "right"  : y1 = ByRei_winDiv.cache.effect_stepper; break;
    case "left"   : y2 = ByRei_winDiv.cache.def_w - ByRei_winDiv.cache.effect_stepper; break;
	case "tv"     : if (ByRei_winDiv.cache.effect_stepper >= ByRei_winDiv.cache.def_w) {ByRei_winDiv.cache.effect_stepper = 0; ByRei_winDiv.cache.effect = modus = "tv2"; } else {x1 = (ByRei_winDiv.cache.def_h - 5) / 2;  x2 = (ByRei_winDiv.cache.def_h + 5) / 2;} break;
   }
   switch(modus) {case "height" : case "pop" : case "tv2" : x1 = (ByRei_winDiv.cache.def_h - ByRei_winDiv.cache.effect_stepper) / 2; x2 = (ByRei_winDiv.cache.def_h + ByRei_winDiv.cache.effect_stepper) / 2; break;}
   switch(modus) {case "width"  : case "pop" : case "tv" :  y1 = (ByRei_winDiv.cache.def_w + ByRei_winDiv.cache.effect_stepper) / 2; y2 = (ByRei_winDiv.cache.def_w - ByRei_winDiv.cache.effect_stepper) / 2; break;}
   
   ByRei_winDiv.getElem('def').style.clip = 'rect(' + x1 + 'px ' + y1 + 'px ' + x2 + 'px ' + y2 + 'px)'; 
  
   if (ByRei_winDiv.cache.effect_stepper >= ByRei_winDiv.cache.def_h && ByRei_winDiv.cache.effect_stepper >= ByRei_winDiv.cache.def_w) {
       ByRei_winDiv.getElem('def').style.clip = 'rect(auto auto auto auto)';
       window.clearInterval(ByRei_winDiv.cache.effect_timer);
	   ByRei_winDiv.cache.effect_timer = ByRei_winDiv.cache.effect = null;
   }
  }
 },
 
 visible: function(modus) {
  if (ByRei_winDiv.getElem('def') && modus) {
   ByRei_winDiv.getElem('def').style.display = modus ? 'block' : 'none';
  }
 },

 check_array: function (array,value,ncs) {
  var r_value='';
   if (array && value) {
    for (var i=0;i<array.length;i++) {
     if (ncs && array[i].indexOf(value) >= 0) {
	     r_value=array[i].split(value)[1];
		 break;
	 } else if (array[i] === value) {
	     r_value=array[i];
		 break;
	 }
    }
   }
  return r_value;
 },
 
 set_eventListener : function(obj,event,func, mode) {
  if (obj && event && func) {
   if (ByRei_winDiv.cache.ie) {obj.attachEvent("on"+event, func);}
   else {obj.addEventListener(event, func, (mode) ? mode : false);}
  }
 }
 
};

ByRei_winDiv.set_eventListener(window, 'load', ByRei_winDiv.init);