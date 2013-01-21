/*global console , ko , $ */
/* Author:carlos@backbase.com
 */
(function(window, jQuery, ko) {
	'use strict';

	//we will need these..
	var $ = jQuery,
		$body, $menu, $content, $prog, lastLoaded, $mainW, $toScroll, $scrollers, v5310 = 'docsData-5.3.1.0.json', loaded;

	//pull the data 
	$.when(
	$.ajax({
		url: v5310
	})).then(

	function(data) {
		ko.applyBindings(new DocsModel(data));
	}).fail(

	function() {
		console.log(arguments);
	});

	// model
	var DocsModel = function(data) {
			var self = this;
			//The search term is stored here globaly to the model
			self.search = ko.observable("");
			// Another observable just to monitor the search length
			self.searchOn = ko.observable(self.search.length);
			self.clearSearch = function(e) {
				self.search('');
				e.preventDefault();
			};
			//The data
			self.docs = ko.observableArray(ko.utils.arrayMap(data, function(a) {
				//util to add things (extend) to each item
				var extend = function(b) {
						var $content = $(b.content);
						//get the TOC
						var tocHtml = $content.find('.toc').html();

						//change image paths, remove TOC and return HTML
						var contentHtml = $content.find('.backtotop a').addClass('top').end().find('.toc').remove().end().html();

						b.inSearch = ko.dependentObservable(function(b) {
							var string = self.search().toLowerCase();
							self.searchOn(self.search().length);
							var sResult1 = this.content.toLowerCase().indexOf(string);
							var sResult2 = this.txt.toLowerCase().indexOf(string);
							return(sResult1 < 0 && sResult2 < 0) ? 0 : 1;
						}, b);
						return {
							toc: tocHtml,
							content: contentHtml,
							vis: ko.observable(0)
						};
					};
				//extend each item(including subs) with some helpers and data
				//add properties to subnames
				a.subnames = ko.observableArray(ko.utils.arrayMap(a.subnames, function(b) {
					b.toc = extend(b).toc;
					b.content = extend(b).content;
					b.vis = extend(b).vis;
					return b;
				}));
				// add properties to names
				a.toc = extend(a).toc;
				a.content = extend(a).content;
				a.vis = extend(a).vis;

				return a;
			}));
		loaded = 1;
		if ($body) {
			$body.addClass('loaded');
		}
		};

	// general click router
	DocsModel.loadContent = function(data, e, addHash, $this) {
		//stupid, the listener should filter this
		var isCurrent = $(e.currentTarget).parent('li').hasClass('vis');
		if(isCurrent) {
			return;
		}
		if(lastLoaded) {
			lastLoaded.vis(0);
		}

		lastLoaded = data;
		data.vis(1);
		if(e.currentTarget.hash.length > 0 || isCurrent) {
			scrollBody(e.currentTarget.hash);
		} else if(!isCurrent) {
			var $newContent;
			$content.fadeOut(400, function() {
				$newContent = $content.empty().html(data.content);

				//test to links
				// $content.find('a[href]').each(function() {
				// 	var hr = $(this).attr('href');
					
				// 	try {
				// 		console.log($(this).text(), this);
				// 		urlBreak(hr);
				// 	} catch(err) {
				// 		console.log(err);
				// 	}
				// });


				$content.fadeIn(400, function() {
					scrollBody(addHash || 0);

					$scrollers = $content.find('a[id]');
				});
			});
		}


	};

	function scrollBody(hash) {
		var target = (hash === 0) ? 0 : $content.find(hash).position().top;
		$toScroll.animate({
			scrollTop: target
		}, 300);
	}

	$(function() {
		$body = $('body').addClass('loaded');
		$content = $body.find('.content');
		$mainW = $body.find('.mainWrap');
		$menu = $body.find('.menu');
		$toScroll = $('html,body');
		$menu.on('click', '.second a', function(e, d) {
			DocsModel.loadContent(ko.dataFor(this), e, d, $(this));
			e.preventDefault();
		});
		if (loaded === 1) {
			$body.addClass('loaded');
		}
		//content links, very ugly
		$('.content').on('click', 'a', function(e) {

			var type = $(this).attr('class');
			var regExp = new RegExp("//" + location.host + "($|/)");
			var isLocal = (this.href.substring(0, 4) === "http") ? regExp.test(this.href) : true;
			var inPage = this.href.indexOf(lastLoaded.name.split(' ').join('_'));

			if(!isLocal) {
				return;
			}

			if(isLocal && inPage < 0 && type !== 'top') {
				e.preventDefault();
				var ids = urlBreak(this.href);
				$menu.find('.second > a[href$="' + ids.page + '"]').trigger('click', ids.hash);
				return;
			}

			switch(type) {
			case 'ulink':
				break;
			case 'xref':
				scrollBody(e.target.hash);
				e.preventDefault();
				break;
			case 'top':
				scrollBody(0);
				break;
			}
		});
	}); //End on ready
	//chity helpers

	function urlBreak(url) {
		var str = url,
			iHash = str.lastIndexOf('#'),
			iPage = str.lastIndexOf('/'),
			hash = (iHash === -1) ? null : str.slice(iHash),
			page = str.slice(iPage + 1, (iHash === -1) ? undefined : iHash);
		return {
			hash: hash,
			page: page
		};
	}

})(window, jQuery, ko);