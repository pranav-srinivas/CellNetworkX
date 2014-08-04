var myNodes = {};

myNodes["KRAS"] = 1;
myNodes["MTOR"] = 1;
myNodes["BRAF"] = 1;
myNodes["PTEN"] = 1;
myNodes["STAT5A"] = 1;

function VisualizePPI(nodes, links)
{
  var force = d3.layout.force()
      .charge(-600)
      .linkDistance(50)
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
      .attr("r", function(d) {
        if (myNodes.hasOwnProperty(d.geneSymbol)) return 20;
        return 10;
      })
      .style("fill", function(d) { return fill(d.hprd_id); })
      .call(force.drag);

  node.append("svg:title")
      .text(function(d) { return d.geneSymbol; });

  node.on("mouseover", function(d) {
    d3.select(this).style("fill", "red");
  });

  node.on("mouseout", function(d) {
    d3.select(this).style("fill", function(d) { return fill(d.hprd_id); })
  });

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


function loadPpiJSON(expressionFileName)
{
  resetGraphics();
  d3.json("BackgroundPPI.json", function(data) {
  
    var nodes = data.Nodes;
    var links = data.Links;
 
    var myNodeIds  = {};
    var visibleIds = {};
  
    nodes.forEach(function(n) {
      if (myNodes.hasOwnProperty(n.geneSymbol)) {
        myNodeIds[n.hprd_id] = 1;
        visibleIds[n.hprd_id] = 1;
      }
    });
  
    var visibleLinks = [];
  
    {
      links.forEach(function(l) {
        if (myNodeIds.hasOwnProperty(l.interactor_1_hprd_id) || myNodeIds.hasOwnProperty(l.interactor_2_hprd_id)) {
          visibleLinks[visibleLinks.length] = l;
          visibleIds[l.interactor_1_hprd_id] = 1;
          visibleIds[l.interactor_2_hprd_id] = 1;
        }
      });
    }
  
    var visibleNodes = [];
    nodes.forEach(function(n) {
      if (visibleIds.hasOwnProperty(n.hprd_id)) {
        visibleNodes[visibleNodes.length] = n;
      }
    });
  
    var nodeId2Index = { };
    var nodeIdx = 0;
    for (var i = 0; i < visibleNodes.length; i++) {
      var n = visibleNodes[i];
      nodeId2Index[n.hprd_id] = nodeIdx;
      ++nodeIdx;
    };
  
    for (var i = 0; i < visibleLinks.length; i++) {
      var l = visibleLinks[i];
      l.source = nodeId2Index[l.interactor_1_hprd_id];
      l.target = nodeId2Index[l.interactor_2_hprd_id];
    };
  
    VisualizePPI(visibleNodes, visibleLinks);
  });
}
