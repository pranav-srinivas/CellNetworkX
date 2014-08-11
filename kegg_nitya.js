function marker (val, color)
{
    var refx = 20;
    if (networkType == 3) {
	refx = refx + 2*r;
    }

    vis.append("svg:defs").selectAll("marker")
	.data([val])
	.enter().append("svg:marker")
	.attr("id", String)
	.attr("viewBox", "0 -5 10 10")
	.attr("refX", refx)
	.attr("refY", 0)
	.attr("markerWidth", 6)
	.attr("markerHeigth", 6)
	.attr("orient", "auto")
	.style("fill", color)
	.append("svg:path")
	.attr("d", "M0,-5L10,0L0,5");

    return "url(#" +val+ ")";
}

function getMarker(d)
{
    if (!("subtype" in d) || !("name" in d.subtype)) return marker("unknown", "pink");
    if (d.subtype.name == "activation")            return marker("activation", "green");
    if (d.subtype.name == "inhibition")            return marker("inhibition", "red");
    if (d.subtype.name == "phosphorylation")       return marker("phosphorylation", "yellow");
    if (d.subtype.name == "expression")            return marker("expression", "blue");
    if (d.subtype.name == "binding/association")   return marker("binding", "lightgreen");
    if (d.subtype.name == "missing interaction")   return marker("missing", "black");
    return marker("default", "cyan");
}

function getStyle(d)
{
    if (!("subtype" in d) || !("name" in d.subtype)) return "pink";
    if (d.subtype.name == "activation")            return "green";
    if (d.subtype.name == "inhibition")            return "red";
    if (d.subtype.name == "phosphorylation")       return "yellow";
    if (d.subtype.name == "expression")            return "blue";
    if (d.subtype.name == "binding/association")   return "lightgreen";
    if (d.subtype.name == "missing interaction")   return "black";
    return "cyan";
}

function linkType(d)
{
    if (!("subtype" in d) || !("name" in d.subtype)) return "unknown";
    return d.subtype.name;
}

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
      .style("stroke", function(d) { return getStyle(d); })
      .attr("marker-end", function(d) { return getMarker(d); })
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

  link.append("svg:title").text(function(d) { return linkType(d); });

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
      .style("stroke", function(d) { return getStyle(d); })
      .attr("marker-end", function(d) { return getMarker(d); })
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

  link.append("svg:title").text(function(d) { return linkType(d); });

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

var linkedByIndex = {};
        links.forEach(function(d) {
            linkedByIndex[d.source.index + "," + d.target.index] = 1;
        });

    function isConnected(a, b) {
        return linkedByIndex[a.index + "," + b.index]
            || linkedByIndex[b.index + "," + a.index]
            || a.index == b.index;
        }

    function isNext(a, b) {
        return linkedByIndex[a.index + "," + b.index];
    }

function doAnimation(d){
  if(d == null){
    d = nodes[Math.floor((Math.random() * nodes.length))];
    console.log(d);
  }
  if (d.type != map){
    d3.selectAll("circle").style("fill", function(e){
      if(d.name == e.name){
        return "black";
      } else {
        return fill(e.id);
      }
    });
    var nextNode;
    nodes.forEach(function(e){
      if(isNext(d, e)){
        nextNode = e;
      }
    });
    d3.timer(doAnimation(nextNode), 500);
  }

}

