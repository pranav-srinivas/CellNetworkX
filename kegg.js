function VisualizeKeggFixed(nodes, links)
{
  var force = d3.layout.force()
      .charge(-50)
      .linkDistance(40)
      .nodes(nodes)
      .links(links)
      .size([w, h])
      .start();

  var link = vis.selectAll("line.link")
      .data(links)
      .enter().append("svg:line")
      .attr("class", "link")
      .style("stroke", function(d) {
        if (!("subtype" in d)) return "pink";
        if (!("name" in d.subtype)) return "pink";
        if (d.subtype.name == "activation") return "green";
        if (d.subtype.name == "inhibition") return "red";
        if (d.subtype.name == "phosphorylation") return "yellow";
        return "blue";
      })
      .style("stroke-width", function(d) { return Math.sqrt(d.value); })
      .attr("x1", function(d) { return d.source.graphics.x; })
      .attr("y1", function(d) { return d.source.graphics.y; })
      .attr("x2", function(d) { return d.target.graphics.x; })
      .attr("y2", function(d) { return d.target.graphics.y; });

  var node = vis.selectAll("rect.node")
      .data(nodes)
      .enter().append("svg:rect")
      .attr("class", "node")
      .attr("x", function(d) { return x = d.graphics.x; })
      .attr("y", function(d) { return y = d.graphics.y; })
      .attr("rx", function(d) { return 10; })
      .attr("ry", function(d) { return 10; })
      .attr("width", function(d) { return d.graphics.width; })
      .attr("height", function(d) { return d.graphics.height; })
      .style("fill", function(d) { return fill(d.id); })
      .style("stroke", "black")
      .style("stroke-width", 2)
      .call(force.drag);

  node.append("text")
      .text(function(d) {
        return d.graphics.name;
  });

  node.append("svg:title")
      .text(function(d) { return d.graphics.name; });

  node.on("mouseover", function(d) {
    d3.select(this).style("fill", "red");
  });

  node.on("mouseout", function(d) {
    d3.select(this).style("fill", function(d) { return fill(d.id); });
  });

  node.on(   "click", function(d) { showDetail(d); });
  node.on("dblclick", function(d) { showDetail(d); });

  vis.style("opacity", 1e-6)
     .transition()
     .duration(1000)
     .style("opacity", 1);

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.graphics.x; })
        .attr("y1", function(d) { return d.source.graphics.y; })
        .attr("x2", function(d) { return d.target.graphics.x; })
        .attr("y2", function(d) { return d.target.graphics.y; });

    node.attr("x", function(d) { return d.graphics.x; })
        .attr("y", function(d) { return d.graphics.y; });

  });
}


function VisualizeKeggFloating(nodes, links)
{
  var force = d3.layout.force()
      .charge(-500)
      .linkDistance(30)
      .nodes(nodes)
      .links(links)
      .size([w, h])
      .start();

  var link = vis.selectAll("line.link")
      .data(links)
      .enter().append("svg:line")
      .attr("class", "link")
      .style("stroke", function(d) {
        if (!("subtype" in d)) return "pink";
        if (!("name" in d.subtype)) return "pink";
        if (d.subtype.name == "activation") return "green";
        if (d.subtype.name == "inhibition") return "red";
        if (d.subtype.name == "phosphorylation") return "yellow";
        return "blue";
      })
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
        if (d.type == "map") return R;
        return r;
      })
      .style("fill", function(d) { return fill(d.id); })
      .call(force.drag);

  node.append("svg:title")
      .text(function(d) { return d.graphics.name; });

  node.on("mouseover", function(d) {
    d3.select(this).style("fill", "red");
  });

  node.on("mouseout", function(d) {
    d3.select(this).style("fill", function(d) { return fill(d.id); });
  });

  node.on(   "click", function(d) { showDetail(d); });
  node.on("dblclick", function(d) { showDetail(d); });

  vis.style("opacity", 1e-6)
     .transition()
     .duration(1000)
     .style("opacity", 1);

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; });
    node.attr("cy", function(d) { return d.y; });

  });
}


function loadKeggJSON(fileName)
{
  resetGraphics();
  d3.json(fileName, function(data) {
    var nodes = data.pathway.entry;
    var links = data.pathway.relation;

    document.title = data.pathway.title;

    var nodeId2Index = { };
    var nodeIdx = 0;
    nodes.forEach(function(n) {
      nodeId2Index[n.id] = nodeIdx;
      ++nodeIdx;
    });

    links.forEach(function(l) {
      l.source = nodeId2Index[l.entry1];
      l.target = nodeId2Index[l.entry2];
    });

    if (networkType == 3) {
      VisualizeKeggFloating(nodes, links);
    }
    else {
      VisualizeKeggFixed(nodes, links);
    }
  });
}

