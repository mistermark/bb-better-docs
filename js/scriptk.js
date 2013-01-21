/*global console $*/
/* Author:carlos@backbase.com
 */
(function(window, jQuery) {
	'use strict';
	var root = window,
		$ = jQuery;
	$(function() {
		var $body = $('body'),
			$templates = $body.find('#docsTemplates'),
			$main = $body.find('.mainWrap'),
			$header = $('body > header'),
			$colLeft = $main.find('.colLeft'),
			$searchOutput = $colLeft.find('.output'),
			searchModel = {},
			result, $content = $main.find('.content'),
			model, n = 0,
			htmlOut = '',
			output;
		$.when(
		$.ajax({
			url: 'docsData-5.3.1.0.json'
		})).then(

		function(data) {
			model = data;
			console.log(model);
			renderMenu(data);
		}).fail(

		function() {
			console.log(arguments);
		});

		//General parsers
		//Main, pass the classlist, returns html(raw)

		function returnContent(path,ev) {
			console.log(path,ev)
			var n = 0; 
			function search(path, model) {
				$.each(model, function(b, a) {
					var names = a.name.split(' '),
						yup1 = path.indexOf(names[n]);
					if (yup1 >= 0 && path.length >= 1) {
						console.log(n, a, 'name', names[n], 'path', path, path.length);
						htmlOut = a.content;
						n += 1;
						console.log(path.length)
						if (path.length > 1) {
							var pathU = path.shift();
							search(path, a.subnames);
						}
						return;
					}
				});
			renderContent(htmlOut,ev);	
			}
			
			search(path, model);
			
		}

		//var re = new RegExp("\\bth", "gi");

		function searchModelFiller(str) {
			console.log(str);
			var re = new RegExp(str, "gi"),
			matches, searchModel = {}, result = {},
			results=[];

			function itSearch(sModel) {
				console.time('search');
				$.each(sModel, function(a, b) {
					matches = re.exec(b.txt +' '+ b.content);
					if(matches){
						result.html = $(b.content).find('.titlepage:first h2');
						result.id = result.html.find('a')[0].id;
						results.push(result);
					}
					var searchAgain = b.subnames && itSearch(b.subnames);
				});
			}
			itSearch(model);
			popSearch(results);
			console.timeEnd('search');
		}

		//the views

		function renderMenu(model) {
			var templateMenu = $templates.find('.list').html(),
				output = Mustache.render(templateMenu, model);
			$colLeft.find('.menu').html(output);
			$main.trigger('loaded');
		}

		//renders any html to the main view

		function renderContent(htmlOut,ev) {
			var $htmlOut = $(htmlOut),
				$toc;
				$content.fadeOut(400, function() {
					var $newContent = $content.empty().html($htmlOut);
				console.log($newContent)	
				//Extract and insert TOC
				$toc = $newContent.find('.toc');
				console.log('toc',$toc)
				$newContent.find('.toc').remove();
				
				$newContent.find('img').each(function(a, b) {
					b.src = 'http://docs.backbase.com/portal/5.2.1.2/' + $(b).attr('src');
				}).end().fadeIn(600);
				$('html, body').prop('scrollTop', 0);
				renderTocs($toc,ev).add();
			});
		}


		var renderTocs = function ($toc,ev){
			var $oldTarget;
			console.log($oldTarget)


			var addToc = function(){
			var $orTarget = $(ev.target);
			var $tocTarget = ($orTarget.next(".toc").length > 0) ?  $orTarget.next(".toc") : $orTarget.after('<div class="toc"></div>').next(".toc");
			$toc.find('dl').addClass('clearfix').find('a').addClass('tocItem');
			$tocTarget.html($toc.html()).addClass('vis');
			$oldTarget = ($oldTarget) ? $oldTarget.empty(): $oldTarget;
			$oldTarget = $tocTarget;

			};
			return {
				add : addToc
			};
			
		}

		//current search


		function popSearch(o) {
			console.log('entrou', o);
			var exists = [];
			$.each(o, function(a, b) {
				console.log($searchOutput.find('a[href='+b.id+']'))
				exists = $searchOutput.find('a[href='+b.id+']').length;
				console.log(a, b.html, exists);
				if (!exists){
					console.log('entrou')
					addEl(b);
				}
				console.log(exists)

			});

			function addEl(el){
				$searchOutput.append('<li><a href='+ el.id +'>'+
				el.html.text()
				+'</a></li>');
			}

			function remEl (){

			}


			// $searchOutput.append('<li><a href='+ id +'>'+
			// 	o.text()
			// 	+'</a></li>');
			//$searchOutput.find('a').not(['href='+id]).parent().remove();
		}

		//listeners
		$main.find('.colLeft').on('click', 'a', function(e) {
			var p = e.target.dataset.path,
				ps = p.split(' ');
			returnContent(ps,e);
			e.preventDefault();
		});

	

		$('.navInside').on('click', 'a', function(e) {
			var self = $(this),
				hash = $(this)[0].hash,
				target = $content.find(hash).position().top;
			if (self.parents('.backtotop').length === 0) {
				scrollBody(target);
			} else {
				scrollBody(0);
			}

			function scrollBody(h) {
				$body.animate({
					scrollTop: h - 50
				}, 500);
			}
			e.preventDefault();
		});

		// listener to filter
		$header.find('.filter').on('keyup', function() {
			var str = $(this).val();
			if (str.length > 2) {
				searchModelFiller(str);
			} else {
				$searchOutput.html('');
				searchModel = {};
			}
		});

		//show the first
		// $main.one('loaded', function() {
		// 	$main.find('li.first:eq(0) > a').trigger('click');
		// });

	}); //end ready
})(window, jQuery, Mustache);