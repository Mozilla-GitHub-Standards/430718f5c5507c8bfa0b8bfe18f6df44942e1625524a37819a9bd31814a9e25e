define(
//Module dependencies
[
	'libs/jquery-1.6.3.min',
	'libs/underscore.min',
	'libs/handlebars',
	'core'
],
function(){
	var app = window.APP,
		filters = app.config.filters;
		
	app.namespace('ui');
	
	_.extend(app.ui, (function() {
		
		var serializeFilters = function() {
			return $.param(filters);
		}
		
		// Public API
		return {
			getSerializedFilters: serializeFilters
		}
	})());
	
	$(document).ready(function() {
		//Initial bootstrapping from APP.config.filters
		for (var key in filters) {
			$('.filter[data-filter-type="' + key + '"]').val(filters[key]);
		}
		
		//Binding change event
		$('.filter').bind('change', function() {
			var filterType = $(this).attr('data-filter-type'),
				$filterCollection = $('[data-filter-type="' + filterType + '"]'),
				filter = app.config.filters[filterType];
				
			$(this).attr('value', $(this).val());
			
			filter = [];		
			$filterCollection.each(function() {
				
				if ($(this).attr('type') == 'checkbox') {
					if ($(this).is(':checked')) {
						filter.push($(this).val());
					}
				} else {			 
					filter.push($(this).val());
				}
			});
			
			app.config.filters[filterType] = filter;
			
			//Publish an event saying the filters changed
			app.events.publish('filters/change', [app.config.filters]);
		});
		
		// Modals
		$('#submitAnswer-modal').modal({
			backdrop: true,
			keyboard: true
		});	
		
		$('#submitQuestion, #submitAnswer').bind('submit', function() {
			$('#submitAnswer-modal').modal('hide');
			return false;
		});
		
		
		// Tile click event
		function handleTileClick(model, element) {
			var checkAbsolute = function(el) {
				if ($(element).css('position') != 'absolute') {
					element = $(el).parents('li');
					checkAbsolute(el);
				}
			},		
			tooltipTemplate = Handlebars.compile('<div class="tooltip"><div class="arrow"></div>{{{content}}}</div>'),
			$tooltip = $(tooltipTemplate({content: 'This is a test!'})),
			offsetTop = 24,
			$arrow,
			leftAdjust,
			canvasWidth = $('.tiled-answers').width(),
			elPos;
			
			checkAbsolute(element);
			
			elPos = $(element).position();
			
			$('.tooltip').remove();
			
			$tooltip.css({
				position: 'absolute',
				zIndex: 99999,
				top: parseInt(elPos.top + $(element).height() + offsetTop, 10)
			});
					
			$('.tiled-answers').append($tooltip);
			
			leftAdjust = ( Math.max($(element).width(), $tooltip.width()) - Math.min($(element).width(), $tooltip.width()) ) / 2;
			$tooltip.css({left: elPos.left - leftAdjust});
			
			//Position arrow
			$arrow = $tooltip.find('.arrow');
			$arrow.css({left: leftAdjust - $arrow.width()/2 + $(element).width() / 2});
			
			// Edge cases
			if ( parseInt($tooltip.position().left + $tooltip.width(), 10) > canvasWidth) {
				$tooltip.css({left: 'auto', right: 0});
				
				var y = $(element).width(),
					z = canvasWidth - $(element).position().left - y,
					x = $tooltip.width() - z - y,
					p;
				
				p = ( (y/2) + x ) - $arrow.width() / 2;
				
				$arrow.css({left: p});				
			}
			
			if ( $tooltip.position().left < 0) {
				$tooltip.css({left: 0, right: 'auto'});
				
				var y = $(element).width(),
					z = $(element).position().left,
					p;
				
				p = ( z + y / 2 ) - $arrow.width() / 2;
				
				$arrow.css({left: p});	
			}
		}
		
		//Subscribe to interesting events
		app.events.subscribe('tile/select', handleTileClick);
		
	});
});