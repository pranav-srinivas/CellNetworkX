var TimeStepIndex = 0;
var animationRadiusCount = 20;
var doAnimation = false;
var protein2Index = {};
var interval = 1000; // one second

var animScale;
var animNodes;

var minRadius = 5;
var maxRadius = 20;

function DetermineRadius()
{
  minRadius = 5;
  maxRadius = 20;

  if (networkType == 2 || networkType == 5) {
    minRadius = 10;
    maxRadius = 40;
  }
  else if (networkType == 3 || networkType == 4) {
    minRadius = r;
    maxRadius = 2*R;
  }
}

function AnimateNetwork(nodes, links)
{
  if (numberOfSeries == 0) return;

  DetermineRadius();

  animScale = d3.scale.linear()
                 .domain([minExprValue, avgExprValue])
                 .range([minRadius, maxRadius]);

  protein2Index = {};
  for (var i = 0; i < myProteins.length; i++) {
    protein2Index[ myProteins[i] ] = i;
  }

  TimeStepIndex = 0;
  animNodes = nodes;

  d3.timer(AnimateOneTimeStep(), interval);
}


var AnimateOneTimeStep = function() {

    return function() {

      vis.selectAll("circle.node")
         .data(animNodes)
         .attr("r", function(d) {
             var nodeName;
             if (networkType == 1) {
               nodeName = d.name;
             }
             else if (networkType == 2 || networkType == 5) {
               nodeName = d.geneSymbol;
             }
             else if (networkType == 3 || networkType == 4) {
               if (!("graphics" in d) || !("name" in d.graphics)) {
                 if (d.type == "map") return R;
                 return r;
               }
               else {
                 var genes = d.graphics.name.split(/,/g);
                 nodeName = genes[0];
               }
             }
             if (nodeName == "") return 5;

             if (protein2Index.hasOwnProperty(nodeName)) {
               var i = TimeStepIndex;
               var j = protein2Index[nodeName];
               var rad = animScale(myExpressions[i][j]);
               if (rad > maxRadius) return maxRadius;
               return rad;
             }

             if (networkType == 1) return 10;
             if (networkType == 2 || networkType == 5) return 10;
             if (networkType == 3 || networkType == 4) {
               if (d.type == "map") return R;
               return r;
             }
             return 10;
           })
         .style("stroke-width", 2)
         .style("fill", function(d) { 
             if (networkType == 2 || networkType == 5) {
               return fill(d.hprd_id);
             }
             else if (networkType == 3 || networkType == 4) {
               return fill(d.id);
             }
             return fill(d.index);
           });


      ++TimeStepIndex;

      if (TimeStepIndex >= numberOfSeries || !doAnimation) {
        TimeStepIndex = 0;
        return true;
      }

      d3.timer(AnimateOneTimeStep(),interval);
      return true;
    }
};


function performAnimation()
{
  if (numberOfSeries < 2) {
    doAnimation = false;
    showNetwork();
    return;
  }

  if (doAnimation) {
    TimeStepIndex = 0;
    d3.timer(AnimateOneTimeStep(), interval);
  }
  else {
    doAnimation = true;
    showNetwork();
  }
}
