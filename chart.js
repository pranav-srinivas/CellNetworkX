var chart;

function bubbleChart() {
    var _chart = {};

    var _width = w, _height = h,
            _margins = {top: 30, left: 30, right: 30, bottom: 30},
            _x, _y, _r, 
            _data = [],
            _colors = d3.scale.category20(),
            _svg,
            _bodyG;

    _chart.render = function () {
        renderAxes(vis);
        defineBodyClip(vis);
        renderBody(vis);
    };

    function renderAxes(svg) {
        var axesG = svg.append("g")
                .attr("class", "axes");

        var xAxis = d3.svg.axis()
                .scale(_x.range([0, quadrantWidth()]))
                .orient("bottom");

        var yAxis = d3.svg.axis()
                .scale(_y.range([quadrantHeight(), 0]))
                .orient("left");

        axesG.append("g")
                .attr("class", "axis")
                .attr("transform", function () {
                    return "translate(" + xStart() + "," + yStart() + ")";
                })
                .call(xAxis);

        axesG.append("g")
                .attr("class", "axis")
                .attr("transform", function () {
                    return "translate(" + xStart() + "," + yEnd() + ")";
                })
                .call(yAxis);


        axesG.append("text")
             .attr("text-anchor", "middle")
             .attr("transform", "translate("+ (_width/2) +","+(_height+(_margins.bottom/3))+")")
             .attr("font-size", "20px")
             .text("Time Series");

        axesG.append("text")
             .attr("text-anchor", "middle")
             .attr("transform", "translate("+ (_margins.left/15) +","+(_height/2)+")rotate(-90)")
             .text("Expression Levels")
             .attr("font-size", "20px");
    }

    function defineBodyClip(svg) {
        var padding = 0;

        svg.append("defs")
                .append("clipPath")
                .attr("id", "body-clip")
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", quadrantWidth() + 2 * padding)
                .attr("height", quadrantHeight());
    }

    function renderBody(svg) {
        if (!_bodyG)
            _bodyG = svg.append("g")
                    .attr("class", "body")
                    .attr("transform", "translate(" 
                            + xStart() 
                            + "," 
                            + yEnd() + ")")
                    .attr("clip-path", "url(#body-clip)");

        renderBubbles();
        renderLegends();
    }

    function renderBubbles() {
        _r.range([0, 50]); 
    
        _data.forEach(function (list, i) {
            var bubbles =
            _bodyG.selectAll("circle._" + i)
                        .data(list)
                    .enter()
                    .append("circle") 
                    .attr("class", "bubble _" + i);

            _bodyG.selectAll("circle._" + i)
                        .data(list)
                    .style("stroke", function (d, j) { 
                        return _colors(j); 
                    })
                    .style("fill", function (d, j) { 
                        return _colors(j); 
                    })
                    .transition()
                    .attr("cx", function (d) { 
                        return _x(d.x); 
                    })
                    .attr("cy", function (d) { 
                        return _y(d.y); 
                    })
                    .attr("r", function (d) { 
                        return _r(d.r); 
                    });

            bubbles.append("svg:title").text(function(d, j) { return myProteins[j] + ": " + d.y; });

            bubbles.on("mouseover", function(d, j) {
              d3.select(this).style("stroke", function (d, j) { return "none" });
            });

            bubbles.on("mouseout", function(d, j) {
              d3.select(this).style("stroke", function () { return _colors(j); });
            });

        });
    }

    function renderLegends()
    {
      _bodyG.selectAll("rect")
            .data(myProteins)
            .enter()
            .append("rect")
            .attr("class", "legend");

      _bodyG.selectAll("rect")
            .data(myProteins)
            .style("fill", function (d, j) { 
              return _colors(j);
            })
            .transition()
            .attr('x', 0.85 * _width)
            .attr('y', function(d, i) { return 0.1*_height + i*20;})
            .attr('width',  0.03 * _width)
            .attr('height', 0.03 * _height);

      _bodyG.selectAll("text")
            .data(myProteins)
            .enter()
            .append("text")
            .attr('x', 0.885 * _width)
            .attr('y', function(d, i){ return 0.1*_height + 10+ i*20;})
            .attr("dy", ".10em")
            .attr("fill", "black")
            .attr("font-size", "10px")
            .text(function(d) { return d.toString(); });
    }

    function xStart() {
        return _margins.left;
    }

    function yStart() {
        return _height - _margins.bottom;
    }

    function xEnd() {
        return _width - _margins.right;
    }

    function yEnd() {
        return _margins.top;
    }

    function quadrantWidth() {
        return _width - _margins.left - _margins.right;
    }

    function quadrantHeight() {
        return _height - _margins.top - _margins.bottom;
    }

    _chart.width = function (w) {
        if (!arguments.length) return _width;
        _width = w;
        return _chart;
    };

    _chart.height = function (h) {
        if (!arguments.length) return _height;
        _height = h;
        return _chart;
    };

    _chart.margins = function (m) {
        if (!arguments.length) return _margins;
        _margins = m;
        return _chart;
    };

    _chart.colors = function (c) {
        if (!arguments.length) return _colors;
        _colors = c;
        return _chart;
    };

    _chart.x = function (x) {
        if (!arguments.length) return _x;
        _x = x;
        return _chart;
    };

    _chart.y = function (y) {
        if (!arguments.length) return _y;
        _y = y;
        return _chart;
    };
    
    _chart.r = function (r) {
        if (!arguments.length) return _r;
        _r = r;
        return _chart;
    };

    _chart.addSeries = function (series) {
        _data.push(series);
        return _chart;
    };

    _chart.remove = function () {
        _data = [];
        return _chart;
    };

    return _chart;
}

function DisplayTimeStepBubbleChart()
{
  if (numberOfSeries == 0) return;
  resetGraphics();

  chart = bubbleChart()
        .x(d3.scale.linear().domain([0, numberOfSeries]))
        .y(d3.scale.linear().domain([0.9*minExprValue, 1.1*maxExprValue]))
        .r(d3.scale.pow().exponent(2).domain([minExprValue, maxExprValue]));

  data = [];

  for (var i = 0; i < numberOfSeries; ++i) {
    data.push(d3.range(numberOfDataPoint).map(function (j) {
        return {x: i, y: myExpressions[i][j], r: myExpressions[i][j]};
    }));
  }

  data.forEach(function (series) {
    chart.addSeries(series);
  });

  chart.render();
}


function lineChart() { 
    var _chart = {};

    var _width = w-20, _height = h-10, 
            _margins = {top: 30, left: 30, right: 30, bottom: 30},
            _x, _y,
            _data = [],
            _colors = d3.scale.category20(),
            _svg,
            _bodyG,
            _line;

    _chart.render = function () { 
        renderAxes(vis);
        defineBodyClip(vis);
        renderBody(vis);
    };

    function renderAxes(svg) {
        var axesG = svg.append("g")
                .attr("class", "axes");

        renderXAxis(axesG);

        renderYAxis(axesG);
    }
    
    function renderXAxis(axesG)
    {
        var xAxis = d3.svg.axis()
                .scale(_x.range([0, quadrantWidth()]))
                .orient("bottom");        

        axesG.append("g")
                .attr("class", "x axis")
                .attr("transform", function () {
                    return "translate(" + xStart() + "," + yStart() + ")";
                })
                .call(xAxis);
                
        d3.selectAll("g.x g.tick")
            .append("line")
                .classed("grid-line", true)
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", - quadrantHeight());

        axesG.append("text")
             .attr("text-anchor", "middle")
             .attr("transform", "translate("+ (_width/2) +","+(_height+(_margins.bottom/3))+")")
             .attr("font-size", "20px")
             .text("Time Series");
    }
    
    function renderYAxis(axesG)
    {
        var yAxis = d3.svg.axis()
                .scale(_y.range([quadrantHeight(), 0]))
                .orient("left");
                
        axesG.append("g")
                .attr("class", "y axis")
                .attr("transform", function () {
                    return "translate(" + xStart() + "," + yEnd() + ")";
                })
                .call(yAxis);
                
        d3.selectAll("g.y g.tick")
            .append("line")
                .classed("grid-line", true)
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", quadrantWidth())
                .attr("y2", 0);

        axesG.append("text")
             .attr("text-anchor", "middle")
             .attr("transform", "translate("+ (_margins.left/15) +","+(_height/2)+")rotate(-90)")
             .text("Expression Levels")
             .attr("font-size", "20px");
    }

    function defineBodyClip(svg) { 
        var padding = 5;

        svg.append("defs")
                .append("clipPath")
                .attr("id", "body-clip")
                .append("rect")
                .attr("x", 0 - padding)
                .attr("y", 0)
                .attr("width", quadrantWidth() + 2 * padding)
                .attr("height", quadrantHeight());
    }

    function renderBody(svg) { 
        if (!_bodyG)
            _bodyG = svg.append("g")
                    .attr("class", "body")
                    .attr("transform", "translate(" 
                        + xStart() + "," 
                        + yEnd() + ")") 
                    .attr("clip-path", "url(#body-clip)");        

        renderLines();

        renderDots();

        renderLegends();
    }

    function renderLines() {
        _line = d3.svg.line() 
                        .x(function (d) { return _x(d.x); })
                        .y(function (d) { return _y(d.y); });
                        
        _bodyG.selectAll("path.line")
                    .data(_data)
                .enter() 
                .append("path")                
                .style("stroke", function (d, i) { 
                    return _colors(i); 
                })
                .attr("class", "line");

        _bodyG.selectAll("path.line")
                .data(_data)
                .transition() 
                .attr("d", function (d) { return _line(d); });
    }

    function renderDots() {
        _data.forEach(function (list, i) {
            var dots = 
            _bodyG.selectAll("circle._" + i) 
                        .data(list)
                    .enter()
                    .append("circle")
                    .attr("class", "dot _" + i);

            _bodyG.selectAll("circle._" + i)
                    .data(list)                    
                    .style("stroke", function (d) { 
                        return _colors(i); 
                    })
                    .transition() 
                    .attr("cx", function (d) { return _x(d.x); })
                    .attr("cy", function (d) { return _y(d.y); })
                    .attr("r", 4.5);

            dots.append("svg:title").text(function(d) { return myProteins[i] + ": " + d.y; });

            dots.on("mouseover", function(d) {
              d3.select(this).style("fill", function(d) { return _colors(i); });
            });

            dots.on("mouseout", function(d) {
              d3.select(this).style("fill", "none");
            });

        });
    }

    function renderLegends()
    {
      _bodyG.selectAll("rect")
            .data(myProteins)
            .enter()
            .append("rect")
            .attr("class", "legend");

      _bodyG.selectAll("rect")
            .data(myProteins)                    
            .style("fill", function (d, j) { 
              return _colors(j);
            })
            .transition()
            .attr('x', 0.85 * _width)
            .attr('y', function(d, i) { return 0.1*_height + i*20;})
            .attr('width',  0.03 * _width)
            .attr('height', 0.03 * _height);

      _bodyG.selectAll("text")
            .data(myProteins)
            .enter()
            .append("text")
            .attr('x', 0.885 * _width)
            .attr('y', function(d, i){ return 0.1*_height + 10+ i*20;})
            .attr("dy", ".10em")
            .attr("fill", "black")
            .attr("font-size", "10px")
            .text(function(d) { return d.toString(); });
    }


    function xStart() {
        return _margins.left;
    }

    function yStart() {
        return _height - _margins.bottom;
    }

    function xEnd() {
        return _width - _margins.right;
    }

    function yEnd() {
        return _margins.top;
    }

    function quadrantWidth() {
        return _width - _margins.left - _margins.right;
    }

    function quadrantHeight() {
        return _height - _margins.top - _margins.bottom;
    }

    _chart.width = function (w) {
        if (!arguments.length) return _width;
        _width = w;
        return _chart;
    };

    _chart.height = function (h) { 
        if (!arguments.length) return _height;
        _height = h;
        return _chart;
    };

    _chart.margins = function (m) {
        if (!arguments.length) return _margins;
        _margins = m;
        return _chart;
    };

    _chart.colors = function (c) {
        if (!arguments.length) return _colors;
        _colors = c;
        return _chart;
    };

    _chart.x = function (x) {
        if (!arguments.length) return _x;
        _x = x;
        return _chart;
    };

    _chart.y = function (y) {
        if (!arguments.length) return _y;
        _y = y;
        return _chart;
    };

    _chart.addSeries = function (series) { 
        _data.push(series);
        return _chart;
    };

    return _chart; 
}

function DisplayLineChart()
{
  if (numberOfSeries == 0) return;
  resetGraphics();

  chart = lineChart()
        .x(d3.scale.linear().domain([0, numberOfSeries]))
        .y(d3.scale.linear().domain([0.95*minExprValue, 1.05*maxExprValue]));

  data = [];

  for (var j = 0; j < numberOfDataPoint; ++j) {
    data.push(d3.range(numberOfSeries).map(function (i) {
        return {x: i, y: myExpressions[i][j]};
    }));
  }

  data.forEach(function (series) {
    chart.addSeries(series);
  });

  chart.render();
}


function DisplayChart()
{
  if (chartType == 1) {
    DisplayTimeStepBubbleChart();
  }
  if (chartType == 2) {
    DisplayLineChart();
  }
}
