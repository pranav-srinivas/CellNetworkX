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
      .style("stroke-width", function(d) { return Math.sqrt(d.value); })
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
      .attr("r", 5)
      .style("fill", function(d) { return fill(d.group); })
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

    // Compute the distinct nodes from the links.
    links.forEach(function(link) {
        link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
        link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
        link.value  = 1;
    });

    document.title = "Custom CSV network" + fileName;
    VisualizeCustomNetwork(d3.values(nodes), links);
  });
}

function loadCustomTSV(fileName)
{
  resetGraphics();
  d3.tsv(fileName, function(error, links) {
    var nodes = {};
    links.forEach(function(link) {
        link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
        link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
    });
    document.title = "Custom TSV network" + fileName;
    VisualizeCustomNetwork(d3.values(nodes), links);
  });
}

function loadCustomNetwork(fileName)
{
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
  else {
    console.log("Unsupported network file extension");
  }
}

