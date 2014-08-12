var TimeStepIndex = 0;
var animationRadiusCount = 20;
var doAnimation = false;
var protein2Index = {};
var interval = 2000; // two second

var animScale;
var animNodes;
var currNode = null;
var n;
var l;

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
	maxRadius = 2 * R;
    }
}

function AnimateNetwork(nodes, links)
{
  if (numberOfSeries == 0) return;
  currNode = null;
  DetermineRadius();

  animScale = d3.scale.linear()
                 .domain([minExprValue, avgExprValue])
                 .range([minRadius, maxRadius]);

  // PPI
  if (networkType == 2 || networkType == 5) {
    animScale.range([10, 40]);
  }

  // KEGG
  if (networkType == 3 || networkType == 4) {
    animScale.range([r, 2*R]);
  }

  protein2Index = {};
  for (var i = 0; i < myProteins.length; i++) {
    protein2Index[ myProteins[i] ] = i;
  }

  TimeStepIndex = 0;
  animNodes = nodes;
  n = nodes;
  l = links;

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
               var colorNode;
               console.log(currNode);
               if (currNode == null){
                 for (var i = 0; i < n.length; i++){
                   if (n[i].type == "gene"){
                     currNode = n[i];
                     console.log(currNode.type);
                     console.log(currNode);
                     break;
                   }
                 }
               }
               colorNode = currNode;
               console.log(colorNode);
               var breakLoop = false;
               for (var i = 0; i < l.length; i++){
                 for (var j = 0; j < n.length; j++){
                   if(l[i].entry1 == colorNode.id && l[i].entry2 == n[j].id){
                     currNode = n[j];
                     breakLoop = true;
                     break;
                   } else if (i == l.length - 1 && j == j.length - 1){
                     var random = Math.floor(Math.random() * n.length);
                     if(n[random].type == "gene"){
                       currNode = n[random];
                       console.log(n[random]);
                       console.log(currNode.type);
                       breakLoop = true;
                     } else {
                       random = Math.floor(Math.random() * n.length);
                       currNode = n[random];
                       console.log(currNode.type);
                       breakLoop = true;
                     }
                   }
                 }
                 if(breakLoop){
                   break;
                 }
               }
               if (d == colorNode){
                 return "black";
               } else {
                 return fill(d.id);
               }
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
  if (doAnimation) {
    TimeStepIndex = 0;
    currNode = null;
    d3.timer(AnimateOneTimeStep(), interval);
  }
  else {
    doAnimation = true;
    showNetwork();
  }
}
