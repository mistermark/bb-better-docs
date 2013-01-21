(function(window) {
	$.support.cors = true;
	var u = 'https://docs.backbase.com/extranet/portal/';

	function scrap() {
		var $body = $('#bbdoc-tree');
		var navT = $body.find('li.html');
		mainIt(navT);
	}

	function mainIt(els) {
		var output = [];
		var fNav = [];
		$.each(els,function(a,b){
			var subNames = b.lastChild.children;
			var link = b.firstChild.firstChild;
			fNav.push({
				'name': b.classList[0],
				'subnames': getSubs(subNames),
				'link' : link.href,
				'txt' : link.innerText,
				'content': getContent(link.href)
				});
		});
		function getSubs(subNames){
			var sNav = [];
			$.each(subNames,function(a,b){
				var name = b.classList[0];
				var name1 = b.classList[1];
				var link = b.firstChild.firstChild;
				sNav.push({
					'name' : name + " " + name1,
					'link' : link.href,
					'txt' : link.innerText,
					'content': getContent(link.href)
				});
			});
			return sNav;
		}
		function getContent(link){
			console.log(link);
			var out;
			$.when($.ajax({
					url: link,
					method: 'POST',
					async : false,
					})).then(function(data){
				// console.log(data)
				out = $(data).find('#bbdoc-content').html();	
			});
			return out;	
		}
		console.log(JSON.stringify(fNav));
	}

	//init scrapper
	scrap();
})(window);