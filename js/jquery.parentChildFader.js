;
(function ($) {
    var currentIndex = 1,
        parentIndex = 0;

    $.fn.fader = function (options) {

        var opts = $.extend({}, $.fn.fader.defaults, options);

        // Cache existing DOM elements for later
        var $fader = $("div#fader"),
            $parentSet = $(".parent-set ul"),
            $parentItems = $parentSet.find("li"),
            $childSets = $(".child-sets ul"),
            $childItems = $childSets.find("li"),
            $playing = false;

        showCurrent(0, $parentItems);
        showCurrent(0, $childItems);

        if (opts.autoplay) {
            $playing = true;
            if (opts.showStartStopControl) {
                buildStartStopControl();
            }
            startStop($playing);
        }

        if (opts.showNavigation) {
            $navContainer = $("<div id='fader-controls'></div>");
            $navContainer.insertAfter($fader);
            buildNavigation();
            $navLinks.eq(0).addClass('selected');
        }

        function buildStartStopControl() {
            $startStopControl = $("<a href='#' id='start-stop'></a>").html($playing ? "stop" : "start");
            ($startStopControl).insertAfter($fader);
            $startStopControl.click(function (e) {
                startStop($playing);
                e.preventDefault();
            });
        };

        function startStop(playing) {
            $playing = !playing; // flip playing flag
            if (playing) {
                clearTimer(); // Just in case this was triggered twice in a row
                this.timer = window.setInterval(function () {
                    currentIndex = goto(currentIndex); // goto next item
                }, opts.interval);
            } else {
                clearTimer();
            };

            if (opts.showStartStopControl) {
                if (opts.autoplay) $startStopControl.toggleClass("playing", playing).html(playing ? "stop" : "start");
            }
        };

        function clearTimer() {
            // Clear the timer only if it is set
            if (this.timer) window.clearInterval(this.timer);
        };

        var lastParentIndex = 0;

        function goto(currentIndex) {
            if (currentIndex < $childItems.length) {
                parentIndex = $childItems.eq(currentIndex).parent().index(); // find the correct parent
            }
            else { // reset both
                currentIndex = 0;
                parentIndex = 0;
            }

            // reset nav link css classes
            if (opts.showNavigation) {
                $navLinks.removeClass('selected');
                $navLinks.eq(currentIndex).addClass('selected');
            }

            // don't fade parent if it hasn't changed
            if (lastParentIndex !== parentIndex) {
                showCurrent(parentIndex, $parentItems);
            }

            showCurrent(currentIndex, $childItems);

            lastParentIndex = parentIndex;
            return currentIndex += 1; // bounce it up one
        };

        // Pause On Hover
        if (opts.pauseOnHover) {
            $fader.hover(function () {
                $playing = false;
                startStop($playing);
            }, function () {
                $playing = true;
                startStop($playing);
            });
        };

        function showCurrent(index, arr) {
            // hide everything
            $.each(arr, function () {
                if ($(this).hasClass("current")) {
                    $(this).fadeOut(opts.fadeOutSpeed);
                } else {
                    $(this).hide();
                }
            });
            arr.eq(index).fadeIn(opts.fadeInSpeed).addClass("current"); // refactor this later -- only fadeIn parent if it's changed
        };

        function buildNavigation() {

            $('div.tabs ul.tabNavigation a').removeClass('selected');

            $childItems.each(function (i, el) {
                var index = i + 1;
                var $a = $("<a href='#'></a>");
                $a.text(index);
                $navContainer.append($a);
            });

            $navLinks = $navContainer.find("a"),
            $navLinks.click(function (e) {
                $navLinks.removeClass('selected');
                $navLinks.eq($(this).index()).addClass('selected');
                currentIndex = goto($(this).index()); // advance and reset the currentIndex
                $playing = false;
                startStop($playing); // shut off playing
                e.preventDefault();
            });
        };
    };

    $.fn.fader.defaults = {
        autoplay: true,
        fadeInSpeed: "normal",
        fadeOutSpeed: "normal",
        pauseOnHover: true,
        showNavigation: true,
        showStartStopControl: true,
        interval: 2000
    };

})(jQuery);