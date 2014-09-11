function VisualizeCustomNetwork(nodes, links)
{
  var force = d3.layout.force()
      .charge(-120)
      .linkDistance(100)
      .nodes(nodes)
      .links(links)
      .size([w, h])
      .start();

  var link = vis.selectAll("line.link")
      .data(links)
      .enter().append("svg:line")
      .attr("class", "link")
      .style("stroke", "#999")
      .style("stroke-width", function(d) { return 2; })
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  var node = vis.selectAll("circle.node")
      .data(nodes)
      .enter().append("svg:circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", r)
      .style("fill", function(d) { return fill(d.index); })
      .call(force.drag);

  node.append("svg:title")
      .text(function(d) { return d.name; });

  node.on("mouseover", function(d) {
    d3.select(this).style("fill", "red");
  });

  node.on("mouseout", function(d) {
    d3.select(this).style("fill", function(d) { return fill(d.index); })
  });

  var nodeName = vis.selectAll("text")
                    .data(nodes)
                    .enter().append("text")
                    .style("font-size", "5px")
                    .text(function(d) { return d.name; });


  vis.style("opacity", 1e-6)
     .transition()
     .duration(1000)
     .style("opacity", 1);

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    nodeName.attr("x", function(d) { 
                 nameLength = d.name.length;
                 if (nameLength > 4) return d.x - r/2 - 4;
                 if (nameLength > 3) return d.x - r/2 - 2;
                 return d.x - r/2;
                })
            .attr("y", function(d) { return d.y + r/4; });
  });

  if (doAnimation) {
    AnimateNetwork(nodes, links);
  }
}

function loadCustomJSON()
{
  resetGraphics();
  d3.json(customNetworkFileName, function(data) {
    var nodes = data.proteins;
    var links = data.interactions;
    document.title = "Custom JSON network" + customNetworkFileName;
    VisualizeCustomNetwork(nodes, links);
  });
}

function loadCustomCSV()
{
  resetGraphics();

  var lines = d3.csv.parseRows(networkText).map(function(row) {
    return row;
  });

  var nodes = {};
  var links = {};

  for (var i = 1; i < lines.length; i++) {
    var line  = lines[i];
    var p1 = line[0];
    var p2 = line[1];

    if (!nodes[p1]) nodes[p1] = {name: p1};
    if (!nodes[p2]) nodes[p2] = {name: p2};

    links[i]  = {source: nodes[p1], target: nodes[p2]};
    links[i].value  = 1;
  }

  document.title = "Custom CSV network" + customNetworkFileName;
  VisualizeCustomNetwork(d3.values(nodes), d3.values(links));
}

function loadCustomTSV()
{
  resetGraphics();

  var lines = d3.tsv.parseRows(networkText).map(function(row) {
    return row;
  });

  var nodes = {};
  var links = {};

  for (var i = 1; i < lines.length; i++) {
    var line  = lines[i];
    var p1 = line[0];
    var p2 = line[1];

    if (!nodes[p1]) nodes[p1] = {name: p1};
    if (!nodes[p2]) nodes[p2] = {name: p2};

    links[i]  = {source: nodes[p1], target: nodes[p2]};
    links[i].value  = 1;
  }

  document.title = "Custom TSV network" + customNetworkFileName;
  VisualizeCustomNetwork(d3.values(nodes), d3.values(links));
}


function loadCustomCytoscapeSIF()
{
  resetGraphics();
  {
    var lines = d3.csv.parseRows(networkText).map(function(row) {
      return row;
    });

    var nodes = {};
    var links = {};

    for (var i = 0; i < lines.length; i++) {
      var line  = lines[i][0];
      var words = line.split(/\s+/g);
      var p1 = words[0];
      var p2 = words[2];

      if (!nodes[p1]) nodes[p1] = {name: p1};
      if (!nodes[p2]) nodes[p2] = {name: p2};

      links[i]  = {source: nodes[p1], target: nodes[p2]};
      links[i].value  = 1;
    }

    document.title = "Custom Cytoscape SIF network" + customNetworkFileName;
    VisualizeCustomNetwork(d3.values(nodes), d3.values(links));
  }
}


function loadCustomTxt()
{
  resetGraphics();
  {
    var lines = d3.csv.parseRows(networkText).map(function(row) {
      return row;
    });

    var nodes = {};
    var links = {};

    for (var i = 0; i < lines.length; i++) {
      var line  = lines[i][0];
      var words = line.split(/\s+/g);
      var p1 = words[0];
      var p2 = words[1];

      if (!nodes[p1]) nodes[p1] = {name: p1};
      if (!nodes[p2]) nodes[p2] = {name: p2};

      links[i]  = {source: nodes[p1], target: nodes[p2]};
      links[i].value  = 1;
    }

    document.title = "Custom Text network" + customNetworkFileName;
    VisualizeCustomNetwork(d3.values(nodes), d3.values(links));
  }
}


function loadCustomNetwork()
{
  if (networkText == "") {
    console.log("No custom network file provided");
    return;
  }

  var extension = networkExtension;

  if (extension == "json") {
    loadCustomJSON();
  }
  else if (extension == "csv") {
    loadCustomCSV();
  }
  else if (extension == "tsv") {
    loadCustomTSV();
  }
  else if (extension == "sif") {
    loadCustomCytoscapeSIF();
  }
  else if (extension == "txt") {
    loadCustomTxt();
  }
  else {
    console.log("Unsupported network file extension");
  }
}

