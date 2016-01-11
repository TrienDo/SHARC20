/************************************************************************
 *************************************************************************
 @Name    :      jMenu - jQuery Plugin
 @Revison :      2.0
 @Date    :      08/2013
 @Author  :      ALPIXEL - (www.myjqueryplugins.com - www.alpixel.fr)
 @Support :      FF, IE7, IE8, MAC Firefox, MAC Safari
 @License :      Open Source - MIT License : http://www.opensource.org/licenses/mit-license.php
 @Github  :      https://github.com/alpixel/jMenu/blob/master/js/jMenu.jquery.min.js
 **************************************************************************
 *************************************************************************/
(function(e) {
	e.jMenu = {
		defaults: {
			ulWidth: "auto",
			absoluteTop: 33,
			absoluteLeft: 0,
			TimeBeforeOpening: 100,            
			TimeBeforeClosing: 100,            
			animatedText: true,
			paddingLeft: 7,
			openClick: false,
			effects: {
				effectSpeedOpen: 150,
				effectSpeedClose: 150,
				effectTypeOpen: "slide",
				effectTypeClose: "slide",
				effectOpen: "swing",
				effectClose: "swing"
			}
		},
		init: function(t) {
			opts = e.extend({}, e.jMenu.defaults, t);
			if (opts.ulWidth == "auto") $width = e(".fNiv").outerWidth(false);
			else $width = opts.ulWidth;
			e(".jMenu li").each(function() {
				var t = e(this).find("a:first"),
					n = e(this).find("ul");
				if (e.jMenu._IsParent(t)) {
					t.addClass("isParent");
					var r = t.next(),
						i = t.position();
					if (e(this).hasClass("jmenu-level-0")) r.css({
						top: i.top + opts.absoluteTop,
						left: i.left + opts.absoluteLeft,
						width: $width
					});
					else r.css({
						top: i.top,
						left: i.left + $width,
						width: $width
					});
					if (!opts.openClick) e(this).bind({
						mouseenter: function() {
							if (e(this).hasClass("jmenu-level-0")) {
								i = e(this).position();
								r.css({
									left: i.left + opts.absoluteLeft,
									top: i.top + opts.absoluteTop
								})
							}
							e.jMenu._show(r)
						},
						mouseleave: function() {
							e.jMenu._closeList(r)
						}
					});
					else e(this).bind({
						click: function(t) {
							t.preventDefault();
							e.jMenu._show(r)
						},
						mouseleave: function() {
							e.jMenu._closeList(r)
						}
					})
				}
			})
		},
		_show: function(e) {
			switch (opts.effects.effectTypeOpen) {
			case "slide":
				e.stop(true, true).delay(opts.TimeBeforeOpening).slideDown(opts.effects.effectSpeedOpen, opts.effects.effectOpen);
				break;
			case "fade":
				e.stop(true, true).delay(opts.TimeBeforeOpening).fadeIn(opts.effects.effectSpeedOpen, opts.effects.effectOpen);
				break;
			default:
				e.stop(true, true).delay(opts.TimeBeforeOpening).show()
			}
		},
		_closeList: function(e) {
			switch (opts.effects.effectTypeClose) {
			case "slide":
				e.stop(true, true).delay(opts.TimeBeforeClosing).slideUp(opts.effects.effectSpeedClose, opts.effects.effectClose);
				break;
			case "fade":
				e.stop(true, true).delay(opts.TimeBeforeClosing).fadeOut(opts.effects.effectSpeedClose, opts.effects.effectClose);
				break;
			default:
				e.delay(opts.TimeBeforeClosing).hide()
			}
		},
		_animateText: function(t) {
			var n = parseInt(t.css("padding-left"));
			t.hover(function() {
				e(this).stop(true, false).animate({
					paddingLeft: n + opts.paddingLeft
				}, 100)
			}, function() {
				e(this).stop(true, false).animate({
					paddingLeft: n
				}, 100)
			})
		},
		_IsParent: function(e) {
			if (e.next().is("ul")) return true;
			else
			return false
		},
		_isReadable: function() {
			if (e(".jmenu-level-0").length > 0) return true;
			else
			return false
		},
		_error: function() {
			alert("jMenu plugin can't be initialized. Please, check you have the '.jmenu-level-0' class on your first level <li> elements.")
		}
	};
	jQuery.fn.jMenu = function(t) {
		e(this).addClass("jMenu");
		e(this).children("li").addClass("jmenu-level-0").children("a").addClass("fNiv");
		if (e.jMenu._isReadable()) {
			e.jMenu.init(t)
		} else {
			e.jMenu._error()
		}
	}
})(jQuery)

