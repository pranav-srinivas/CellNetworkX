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
      .attr("r", 10)
      .style("fill", function(d) { return fill(d.index); })
      .call(force.drag);

  node.append("svg:title")
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
  });

  if (doAnimation) {
    AnimateNetwork(nodes, links);
  }
}

function loadCustomJSON(fileName)
{
  resetGraphics();
  d3.json(fileName, function(data) {
    var nodes = data.proteins;
    var links = data.interactions;
    document.title = "Custom JSON network" + fileName;
    VisualizeCustomNetwork(nodes, links);
  });
}

function loadCustomCSV(fileName)
{
  resetGraphics();
  d3.csv(fileName, function(links) {
    var nodes = {};

    var first  = d3.entries(links[0])[0].key;
    var second = d3.entries(links[0])[1].key;

    // Compute the distinct nodes from the links.
    links.forEach(function(link) {
        link.source = nodes[link[first]]  || (nodes[link[first]] = {name: link[first]});
        link.target = nodes[link[second]] || (nodes[link[second]] = {name: link[second]});
        link.value  = 1;
    });

    document.title = "Custom CSV network" + fileName;
    VisualizeCustomNetwork(d3.values(nodes), links);
  });
}

function loadCustomTSV(fileName)
{

  resetGraphics();
  d3.tsv(fileName, function(links) {
    var nodes = {};

    var first  = d3.entries(links[0])[0].key;
    var second = d3.entries(links[0])[1].key;

    // Compute the distinct nodes from the links.
    links.forEach(function(link) {
        link.source = nodes[link[first]]  || (nodes[link[first]] = {name: link[first]});
        link.target = nodes[link[second]] || (nodes[link[second]] = {name: link[second]});
        link.value  = 1;
    });

    document.title = "Custom TSV network" + fileName;
    VisualizeCustomNetwork(d3.values(nodes), links);
  });
}


function loadCustomCytoscapeSIF(fileName)
{
  resetGraphics();
  d3.text(fileName, function(text) {
    var lines = d3.csv.parseRows(text).map(function(row) {
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

    document.title = "Custom Cytoscape SIF network" + fileName;
    VisualizeCustomNetwork(d3.values(nodes), d3.values(links));
  });
}


function loadCustomTxt(fileName)
{
  resetGraphics();
  d3.text(fileName, function(text) {
    var lines = d3.csv.parseRows(text).map(function(row) {
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

    document.title = "Custom Text network" + fileName;
    VisualizeCustomNetwork(d3.values(nodes), d3.values(links));
  });
}


function loadCustomNetwork(fileName)
{
  if (fileName == "") {
    console.log("No custom network file provided");
    return;
  }

  var extension = fileName.split('.').pop();

  if (extension == "json") {
    loadCustomJSON(fileName);
  }
  else if (extension == "csv") {
    loadCustomCSV(fileName);
  }
  else if (extension == "tsv") {
    loadCustomTSV(fileName);
  }
  else if (extension == "sif") {
    loadCustomCytoscapeSIF(fileName);
  }
  else if (extension == "txt") {
    loadCustomTxt(fileName);
  }
  else {
    console.log("Unsupported network file extension");
  }
}

