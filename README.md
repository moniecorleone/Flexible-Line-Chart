# Flexible-Line-Chart

This jquery plugin will draw Flexible Line using canvas element. 

[Demo](http://moniecorleone.github.io/Flexible-Line-Chart/FlexibleLineChart.html)


## Basic Usage

### HTML
```html
    <div id="linegraph" style="width: 100%; height: 500px">
    </div>
```
### jQuery
```js
        $(function () {
        	 var linedata = {
            linecolor: "#CCA300",
            title: "Monday",
            values: [
            { Xlabel: "7:00", X: 0, Y: 110.98 },
            { Xlabel: "8:00", X: 1, Y: 110.00 },
            { Xlabel: "9:00", X: 2, Y: -114.00 },
            { Xlabel: "10:00", X: 3, Y: 110.25 },
            { Xlabel: "11:00", X: 4, Y: 118.56 }
            ]
        };
        var linedata1 = {
            linecolor: "#3399FF",
            title: "Tuesday",
            values: [
            { Xlabel: "7:00", X: 0, Y: -10.98 },
            { Xlabel: "8:00", X: 1, Y: 10.00 },
            { Xlabel: "9:00", X: 2, Y: -14.00 },
            { Xlabel: "10:00", X: 3, Y: 10.25 },
            { Xlabel: "11:00", X: 4, Y: 18.56 }
            ]
        };
        
             $("#linegraph").FlexibleLineChart({
                toolwidth: "50",
                toolheight: "25",
                axiscolor: "#E6E6E6",
                textcolor: "#6E6E6E",
                showlegends: true,
                data: [linedata,linedata1,linedata2,linedata3],
                legendsize: "80",
                legendposition: 'bottom',
                xaxislabel: 'Days',
                title: 'Weekly Profit',
                yaxislabel: 'Profit in $'
            });
        });
```
### Copyright

MIT-LICENCE
