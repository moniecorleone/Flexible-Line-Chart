//Author: Monie Corleone
//Purpose: To draw line chart in canvas element
; (function ($, window, document, undefined) {
    var pluginName = "FlexibleLineChart";
    var defaults = {
        xPadding: 50,
        yPadding: 30,
        topmargin: 25,
        rightmargin: 0,
        data: null,
        toolwidth: 300,
        toolheight: 300,
        axiscolor: "#333",
        font: "italic 8pt sans-serif",
        headerfontsize: "14px",
        axisfontsize: "12px",
        textAlign: "center",
        textcolor: "#E6E6E6",
        showlegends: true,
        legendposition: 'bottom',
        legendsize: '100',
        xaxislabel: null,
        yaxislabel: null,
        title: null,
        LegendTitle: "Legend",
        drawgrid: true
    };

    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            var that = this,
            config = that.options;
            var graph = $(that.element).addClass("FlexibleLineChart").append("<canvas class='linechartcanvas'></canvas>").find('canvas');
            var ctx = graph[0].getContext("2d");
            graph[0].width = $(that.element).width() - (config.showlegends ? ((config.legendposition == 'right' || config.legendposition == 'left') ? config.legendsize + config.xPadding : 0) : 0) - config.rightmargin;
            graph[0].height = $(that.element).height() - (config.showlegends ? ((config.legendposition == 'bottom' || config.legendposition == 'top') ? config.legendsize : 0) : 0) - config.topmargin;

            var tipCanvas = $(that.element).append("<canvas id='tip'></canvas><div class='down-triangle'></div>").find("#tip").attr('width', config.toolwidth).attr('height', config.toolheight);
            var tipCtx = tipCanvas[0].getContext("2d");
            var canvasOffset = $(graph).offset();
            var offsetX = canvasOffset.left;
            var offsetY = canvasOffset.top;
            var highlighter = $(that.element).append("<canvas id='highlighter'></canvas>").find('#highlighter').attr('width', "18").attr('height', "18");
            var higlightctx = highlighter[0].getContext("2d");
            var tipbaloontip = $(that.element).find('.down-triangle');
            // request mousemove events
            $(graph[0]).on("mousemove", function (e) {
                handleMouseMove(e);
            });


            // boundaries of graph
            var LeftPos = config.xPadding;
            var RightPos = graph.width() - config.xPadding;
            var TopPos = config.yPadding;
            var BottomPos = graph.height() - config.yPadding;

            // styling
            var dotRadius = 4;
            
            // min & max values
            var Xrange = GetMinMaxRanges(config.data, 'X');
            var Yrange = GetMinMaxRanges(config.data, 'Y');            
            if (Math.round(Yrange.min) == 0 && Math.round(Yrange.max) == 0) {
                Yrange.max = 10;
            }

            // draw the graph axes
            ctx.strokeStyle = config.axiscolor;
            ctx.lineWidth = 2;
            var y0 = GetXYPosition(LeftPos, 0).displayY;
            ctx.beginPath();
            ctx.moveTo(LeftPos, TopPos);
            ctx.lineTo(LeftPos, BottomPos);
            ctx.moveTo(LeftPos, y0);
            ctx.lineTo(RightPos, y0);
            ctx.stroke();

            // draw the graph min max position
            ctx.textAlign = config.textAlign;
            ctx.textBaseline = config.textAlign;
            ctx.fillStyle = config.textcolor;
            var y0 = GetXYPosition(LeftPos, 0).displayY;
            var yMin = GetXYPosition(LeftPos, Yrange.min).displayY;
            var yMax = GetXYPosition(LeftPos, Yrange.max).displayY;
            var xMax = GetXYPosition(RightPos, Xrange.max).displayX;
            ctx.fillText(Yrange.min, LeftPos - 20, yMin + 5);
            ctx.fillText(0, LeftPos - 20, y0 + 5);
            ctx.fillText(Yrange.max, LeftPos - 20, yMax + 5);
            ctx.fillText(Xrange.max, RightPos + 20, y0 + 5);
            ctx.fillStyle = config.axiscolor;
            ctx.beginPath();
            ctx.arc(LeftPos, yMin, 6, 0, Math.PI * 2, true);
            ctx.arc(LeftPos, yMax, 6, 0, Math.PI * 2, true);
            ctx.arc(LeftPos, y0, 6, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            //Plot y               

            var incrementvalue = Math.ceil((Yrange.max - (Yrange.min)) / 10);

            for (var j = Yrange.min + incrementvalue; j < Yrange.max; j += incrementvalue) {
                if (Math.abs(j) > parseInt(10 * Math.floor(incrementvalue / 10))) {
                    ctx.beginPath();
                    ctx.fillStyle = config.axiscolor;
                    ctx.arc(LeftPos, GetXYPosition(LeftPos, Math.ceil(j)).displayY, 6, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = config.textcolor;
                    ctx.fillText(Math.ceil(j), LeftPos - 20, GetXYPosition(LeftPos, Math.ceil(j)).displayY + 5);
                    if (config.drawgrid) {
                        ctx.strokeStyle = config.axiscolor;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(LeftPos, GetXYPosition(LeftPos, Math.ceil(j)).displayY);
                        ctx.lineTo(RightPos, GetXYPosition(LeftPos, Math.ceil(j)).displayY);
                        ctx.stroke();
                    }
                }
            }

			//Draw line data
			
            ctx.lineWidth = 1.5;
            ctx.save();
            ctx.fillStyle = config.textcolor;
            for (var j = 0; j < config.data[0].values.length; j++) {
                var endingPos = GetXYPosition(config.data[0].values[j].X, config.data[0].values[j].Y);
                ctx.fillText(config.data[0].values[j].Xlabel, endingPos.displayX - 10, GetXYPosition(LeftPos, 0).displayY + 15);
                if (config.drawgrid) {
                    ctx.strokeStyle = config.axiscolor;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(endingPos.displayX, TopPos);
                    ctx.lineTo(endingPos.displayX, BottomPos);
                    ctx.stroke();
                }
            }
            ctx.restore();

            for (var i = 0; i < config.data.length; i++) {
                ctx.save();
                ctx.strokeStyle = config.data[i].linecolor;
                ctx.fillStyle = config.data[i].linecolor;
                var startingPos = GetXYPosition(config.data[i].values[0].X, config.data[i].values[0].Y);
                drawdot(startingPos, dotRadius);
                for (var j = 1; j < config.data[i].values.length; j++) {
                    var endingPos = GetXYPosition(config.data[i].values[j].X, config.data[i].values[j].Y);
                    nextPos(startingPos, endingPos);
                    drawdot(endingPos, dotRadius);
                    startingPos = endingPos;
                }
                ctx.restore();
            }



            ctx.save();
            ctx.fillStyle = config.textcolor;
            var fontArgs = ctx.font.split(' ');
            ctx.font = config.axisfontsize + ' ' + fontArgs[fontArgs.length - 1];
            if (config.xaxislabel) {
                ctx.fillText(config.xaxislabel, graph.width() / 2, graph.height() - 3);
            }
            if (config.yaxislabel) {
                ctx.save();
                ctx.translate(0, graph.height() / 2);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText(config.yaxislabel, 0, 15);
                ctx.restore();
            }
            //c.font = config.headerfontsize + ' ' + fontArgs[fontArgs.length - 1];
            if (config.title) {
                $("<div class='line-chart-Header' />").appendTo($(that.element)).html(config.title).css({
                    left: graph.width() / 2 - ($(that.element).find('.line-chart-Header').width() / 2),
                    top: 5,
                    color: config.textcolor
                });
                //c.fillText(config.title, graph.width() / 2, 12);
            }
            ctx.restore();
            // define tooltips for each data point
            var dots = [];
            for (var i = 0; i < config.data.length; i++) {
                for (var j = 0; j < config.data[i].values.length; j++) {
                    dots.push({
                        x: GetXYPosition(config.data[i].values[j].X, config.data[i].values[j].Y).displayX,
                        y: GetXYPosition(config.data[i].values[j].X, config.data[i].values[j].Y).displayY,
                        r: 4,
                        rXr: 16,
                        tip: config.data[i].values[j].Y,
                        color: config.data[i].linecolor
                    });
                }
            }

            // show tooltip when mouse hovers over dot
            function handleMouseMove(e) {
                mouseX = parseInt(e.pageX - offsetX);
                mouseY = parseInt(e.pageY - offsetY);
                var hit = false;
                for (var i = 0; i < dots.length; i++) {
                    var dot = dots[i];
                    var dx = mouseX - dot.x;
                    var dy = mouseY - dot.y;
                    if (dx * dx + dy * dy < dot.rXr) {
                        tipCtx.clearRect(0, 0, tipCanvas[0].width, tipCanvas[0].height);
                        tipCtx.fillText(dot.tip, 5, 15);
                        tipCanvas[0].style.left = (dot.x - (tipCanvas[0].width / 2)) + 1 + "px";
                        tipCanvas[0].style.top = (dot.y - tipCanvas[0].height) - 21 + "px";
                        tipbaloontip[0].style.left = (dot.x) - 6 + "px";
                        tipbaloontip[0].style.top = (dot.y) - 20 + "px";
                        highlighter[0].style.left = (dot.x) - 9 + "px";
                        highlighter[0].style.top = (dot.y) - 9 + "px";
                        higlightctx.clearRect(0, 0, highlighter.width(), highlighter.height());
                        higlightctx.strokeStyle = dot.color;
                        higlightctx.beginPath();
                        higlightctx.arc(9, 9, 7, 0, 2 * Math.PI);
                        higlightctx.lineWidth = 2;
                        higlightctx.stroke();
                        hit = true;
                    }
                }
                if (!hit) {
                    tipCanvas[0].style.left = "-200px";
                    highlighter[0].style.left = "-200px";
                    tipbaloontip[0].style.left = "-200px";
                }
            }

            //show legend
            if (config.showlegends) {
                var _legends = $("<div class='line-chart-legends' />", { id: "legendsdiv" }).css({
                    width: (config.legendposition == 'right' || config.legendposition == 'left') ? (config.legendsize - 5) : '',
                    height: (config.legendposition == 'top' || config.legendposition == 'bottom') ? (config.legendsize - 5) : '',
                    float: (config.legendposition == 'right' || config.legendposition == 'left') ? 'left' : ''
                }).appendTo($(that.element));
                var _ul = $(_legends).append("<span>" + config.LegendTitle + "</span>").append("<ul />").find("ul")
                for (var i = 0; i < config.data.length; i++) {
                    $("<li />", { class: "legendsli" }).append("<span />").find('span').addClass("legendindicator").append('<span class="line" style="background:' + config.data[i].linecolor + '"></span><span class="circle" style="background:' + config.data[i].linecolor + '"></span>').parent().append("<span>" + config.data[i].title + "</span>").appendTo(_ul);
                }
                if (config.legendposition == 'top' || config.legendposition == 'left') {
                    $(_legends).insertBefore($(that.element).find('.linechartcanvas'));
                }
                if (config.legendposition == 'right' || config.legendposition == 'left') {
                    $(_legends).addClass('vertical')
                }
                else {
                    $(_legends).addClass('horizontal');
                }
            }

            function GetXYPosition(valueX, valueY) {
                x = plotPos(valueX, Xrange.min, Xrange.max, LeftPos, RightPos);
                y = plotPos(valueY, Yrange.min, Yrange.max, BottomPos, TopPos);
                return ({ displayX: x, displayY: y })
            }
            function nextPos(startingPos, endingPos) {
                ctx.beginPath();
                ctx.moveTo(startingPos.displayX, startingPos.displayY);
                ctx.lineTo(endingPos.displayX, endingPos.displayY);
                ctx.stroke();
            }
            function drawdot(position, radius) {
                ctx.beginPath();
                ctx.moveTo(position.displayX, position.displayY);
                ctx.arc(position.displayX, position.displayY, radius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
            function plotPos(val, L, H, mL, mH) {
                return mL + (mH - mL) * (val - L) / (H - L);
            }
            function GetMinMaxRanges(a, prop) {
                var min = 1000000;
                var max = -1000000;
                for (var i = 0; i < a.length; i++) {
                    for (var j = 0; j < a[i].values.length; j++) {
                        var value = a[i].values[j][prop];
                        if (value < min) { min = value; }
                        if (value > max) { max = value; }
                    }
                }
                return ({ min: min, max: max });
            }
        }
     , reload: function () {
         $(this.element).empty();
         this.init();
     }
     , destroy: function () {
         $(this.element).empty();
     }
    }


    $.fn[pluginName] = function (options) {
        if (typeof options === "string") {
            var args = Array.prototype.slice.call(arguments, 1);
            this.each(function () {
                var plugin = $.data(this, 'plugin_' + pluginName);
                if (plugin[options]) {
                    plugin[options].apply(plugin, args);
                } else {
                    plugin['options'][options] = args[0];
                }
            });
        } else {
            return this.each(function () {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
                }
            });
        }
    }
})(jQuery, window, document, undefined);
