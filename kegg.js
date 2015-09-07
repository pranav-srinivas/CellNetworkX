function marker (type, val, color) 
{
  var refx = 20;
  if (networkType == 3) {
    refx = refx + r/2;
  }

  vis.append("svg:defs").selectAll("marker")
        .data([val])
        .enter().append("svg:marker")    
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", refx)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .style("fill", color)
        .style("stroke-dasharray", function() {
                 if (type == "GErel") return ("3, 3");
                 if (type == "PCrel") return ("8, 4");
                 if (type == "ECrel") return ("5, 1");
                 return ("none");
         })
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

  return "url(#" +val+ ")";
}

var getInteractionType = function(d)
{
  if (!("type" in d)) return "UNKNOWNrel";
  return d.type;
}

var getInteractionName = function(d)
{
  if (!("subtype" in d)) return "unknown";

  if (d.subtype.length > 1) {

    // First check if it is indirect effect
    for (var i = 0; i < d.subtype.length; i++) {
      var name = d.subtype[i].name;
      if (name == "indirect effect" || name == "state change") return name;
    }

    // Next activation or inhibition
    for (var i = 0; i < d.subtype.length; i++) {
      var name = d.subtype[i].name;
      if (name == "activation" || name == "inhibition") return name;
    }

    return d.subtype[0].name;
  }
  else {
    if (!("name" in d.subtype)) return "unknown";
    return d.subtype.name;
  }
  return "unknown";
}

function getMarker(d)
{
  if (d.isDisabled == true) return "";

  var interactionType = getInteractionType(d);
  var interactionName = getInteractionName(d);

  if (interactionName == "activation")          return marker(interactionType, "activation", "green");
  if (interactionName == "inhibition")          return marker(interactionType, "inhibition", "red");
  if (interactionName == "phosphorylation")     return marker(interactionType, "phosphorylation", "lightgreen");
  if (interactionName == "dephosphorylation")   return marker(interactionType, "dephosphorylation", "magenta");
  if (interactionName == "expression")          return marker(interactionType, "expression", "blue");
  if (interactionName == "binding/association") return marker(interactionType, "binding", "yellow");
  if (interactionName == "missing interaction") return marker(interactionType, "missing", "gray");
  if (interactionName == "repression")          return marker(interactionType, "repression", "orange");
  if (interactionName == "dissociation")        return marker(interactionType, "dissociation", "black");
  if (interactionName == "unknown")             return marker(interactionType, "unknown", "pink");

  return marker(interactionType, "default", "cyan");
}

function getStyle(d)
{
  if (d.isDisabled == true) return "white";

  var interactionName = getInteractionName(d);

  if (interactionName == "activation")          return "green";
  if (interactionName == "inhibition")          return "red";
  if (interactionName == "phosphorylation")     return "lightgreen";
  if (interactionName == "dephosphorylation")   return "magenta";
  if (interactionName == "expression")          return "blue";
  if (interactionName == "binding/association") return "yellow";
  if (interactionName == "missing interaction") return "gray";
  if (interactionName == "repression")          return "orange";
  if (interactionName == "dissociation")        return "black";
  if (interactionName == "unknown")             return "pink";

  return "cyan";
}

function linkType(d)
{
  var interactionName = getInteractionName(d);
  return interactionName;
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
      .attr("rx", function(d) { return r; })
      .attr("ry", function(d) { return r; })
      .attr("width", function(d) { return d.graphics.width; })
      .attr("height", function(d) { return d.graphics.height; })
      .style("fill", function(d) { return fill(d.id); })
      .style("stroke", "black")
      .style("stroke-width", 2)
      .call(force.drag);

  var nodeName = vis.selectAll("text")
                    .data(nodes)
                    .enter().append("text")
                    .style("font-size", function(d) {
                              if ("name" in d.graphics) return "8px";
                              return "14px";
                          })
                    .text(function(d) {
                        var nodeName = getNodeName(d);
                        return nodeName;
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


    nodeName.attr("x", function(d) {
                   var gw = parseInt(d.graphics.width);
                   var gx = parseInt(d.graphics.x);
                   if ("name" in d.graphics) {
                     var nodeName = getNodeName(d);
                     var nameLength = nodeName.length;
                     if (nameLength > 30) return gx + 0.06*gw;
                     if (nameLength > 25) return gx + 0.08*gw;
                     if (nameLength > 20) return gx + 0.12*gw;
                     if (nameLength > 15) return gx + 0.16*gw;
                     if (nameLength > 4)  return gx + 0.24*gw;
                     if (nameLength > 3)  return gx + 0.28*gw;
                     return gx + 0.32*gw;
                   }
                   return gx + gw/4; }
                 )
            .attr("y", function(d) { 
                   var gh = parseInt(d.graphics.height);
                   var gy = parseInt(d.graphics.y);
                   return gy + 0.5*gh; }
                 );
  });

  if (doAnimation) {
    AnimateNetwork(nodes, links);
  }
}

var theCentralNode = null, theFromNode = null, theToNode = null;
var KeggFloatingForce = null;

function VisualizeKeggFloating(nodes, links)
{
  var force = d3.layout.force()
      .charge(-500)
      .linkDistance(30)
      .nodes(nodes)
      .links(links)
      .size([w, h])
      .start();

  if (networkType == 6) {
    force.gravity(0.5);
  }

  KeggFloatingForce = force;

  var link = vis.selectAll("line.link")
      .data(links)
      .enter().append("svg:line")
      .attr("class", "link")
      .style("stroke", function(d) { return getStyle(d); })
      .attr("marker-end", function(d) { return getMarker(d); })
      .style("stroke-width", function(d) { return Math.sqrt(d.value); })
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.isDisabled ? d.source.x : d.target.x; })
      .attr("y2", function(d) { return d.isDisabled ? d.source.y : d.target.y; });

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

  var nodeName = vis.selectAll("text")
                    .data(nodes)
                    .enter().append("text")
                    .style("font-size", function(d) {
                              if ("name" in d.graphics) return "5px";
                              return "8px";
                          })
                    .text(function(d) { 
                        if (d.isDisabled == true) return "";
                        var nodeName = getNodeName(d);
                        return nodeName;
                     });

  node.append("svg:title")
      .text(function(d) { 
        if (networkType != 6) return getNodeName(d); 
        if (d.isDisabled == true) return "";
        var nodeData = getNodeName(d) + "\nInDegree: " + d.inDegree + "\nOutDegree: " + d.outDegree + "\nType: " + d.type;
        nodeData += "\nFanin: ";
        for (var i = 0; i < d.linkin.length; i++) {
          var link = d.linkin[i];
          if (link.isDisabled) continue;
          var fi   = link.source;
          nodeData += getNodeName(fi) + " ";
        }
        nodeData += "\nFanout: ";
        for (var i = 0; i < d.linkout.length; i++) {
          var link = d.linkout[i];
          if (link.isDisabled) continue;
          var fo   = link.target;
          nodeData += getNodeName(fo) + " ";
        }
        return nodeData;
      });

  node.on("mouseover", function(d) {
    d3.select(this).style("fill", "red");
  });

  node.on("mouseout", function(d) {
    d3.select(this).style("fill", function(d) {
      if (networkType == 6) {
        if (d.isDisabled == true) return "white";
        if (d.isTF == true) return "blue";
        if (d.inDegree  == 0) return "chartreuse";
        // if (d.RegulatedGenes.length > 0) return "darkOrchid";
        if (d.outDegree == 0) return "orange";
        return "cyan";
      }
      return fill(d.id);
    });
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
        .attr("x2", function(d) { return d.isDisabled ? d.source.x : d.target.x; })
        .attr("y2", function(d) { return d.isDisabled ? d.source.y : d.target.y; });

    node.attr("cx", function(d) { return d.x; });
    node.attr("cy", function(d) { return d.y; });

    node.attr("r", function(d) {
          if (d.isDisabled == true) return 0;
          if (d.type == "map") return R;
          if (d == theCentralNode || d == theFromNode || d == theToNode) return 1.5*r;
          return r;
         });

    node.style("fill", function(d) { 
        if (d.isDisabled == true) return "white";
        if (d == theCentralNode || d == theFromNode || d == theToNode) return "yellow";
        if (networkType == 6) {
          if (d.isTF == true) return "blue";
          if (d.inDegree  == 0) return "chartreuse";
          // if (d.RegulatedGenes.length > 0) return "darkOrchid";
          if (d.outDegree == 0) return "orange";
          return "cyan";
        }

        return fill(d.id); 
      });

    nodeName.attr("x", function(d) {
                 if ("name" in d.graphics) {
                   names = d.graphics.name.split(/,/g);
                   var nameLength = names[0].length;
                   if (d.type == "map") {
                     if (nameLength > 32) return d.x - 0.90*R;
                     if (nameLength > 22) return d.x - 0.75*R;
                     if (nameLength > 12) return d.x - R/2;
                     return d.x - R/4;
                   }
                   else {
                     if (nameLength > 4) return d.x - r/2 - 4;
                     if (nameLength > 3) return d.x - r/2 - 2;
                     return d.x - r/2;
                   }
                 }
                 if (d.type == "map") return d.x - R/4;
                 return d.x - r/2;
                })
            .attr("y", function(d) { return d.y + r/4; });
  });

  if (doAnimation) {
    AnimateNetwork(nodes, links);
  }
}


function loadKeggJSON(fileName)
{
  var filePathName = "JSON/" + fileName;
  d3.json(filePathName, function(error, data) {
    if (error) {
      console.log("File not found " + fileName);
      return;
    }

    resetGraphics();

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

