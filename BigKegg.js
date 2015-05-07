var CommonPathwayFiles = [
                           "hsa04310.json", "hsa04151.json", "hsa04150.json", "hsa04210.json",
                           "hsa04010.json", "hsa04350.json", "hsa04110.json", "hsa04115.json",
                           "hsa04520.json", "hsa04510.json", "hsa04070.json",
                           "hsa04910.json", "hsa04370.json", "hsa04020.json", "hsa04012.json",
                           "hsa04068.json", "hsa04064.json", "hsa04662.json", "hsa04060.json",
                           "hsa04620.json", "hsa04630.json", "hsa04062.json", "hsa04340.json",
                           "hsa04660.json", "hsa04622.json", "hsa03320.json", "hsa04066.json",
                           "hsa04140.json", "hsa04810.json", "hsa04920.json",
                           "hsa04014.json", "hsa04015.json", "hsa04022.json", "hsa04024.json",
                           "hsa04152.json", "hsa04330.json", "hsa04390.json", "hsa04668.json"
                         ]

var NSCLC_Files = [
                    "hsa04010.json",    // "title": "MAPK signaling pathway",
                    "hsa04012.json",    // "title": "ErbB signaling pathway",
                    "hsa04014.json",    // "title": "Ras signaling pathway",
                    "hsa04020.json",    // "title": "Calcium signaling pathway",
                    "hsa04024.json",    // "title": "cAMP signaling pathway",
                    "hsa04064.json",    // "title": "NF-kappa B signaling pathway",
                    "hsa04150.json",    // "title": "mTOR signaling pathway",
                    "hsa04151.json",    // "title": "PI3K-Akt signaling pathway",
                    "hsa04210.json",    // "title": "Apoptosis",
                    "hsa04310.json",    // "title": "Wnt signaling pathway",
                    "hsa04350.json",    // "title": "TGF-beta signaling pathway",
                    "hsa04630.json",    // "title": "Jak-STAT signaling pathway",
                    "hsa04910.json",    // "title": "Insulin signaling pathway",
                    "hsa05223.json",    // "title": "Non-small cell lung cancer",
                  ]


var MAPK_Files =  [
                    "hsa04010.json"    // "title": "MAPK signaling pathway",
                  ]

var MAIN4_Files = [
                    "hsa04010.json",    // "title": "MAPK signaling pathway",
                    "hsa04012.json",    // "title": "ErbB signaling pathway",
                    "hsa04150.json",    // "title": "mTOR signaling pathway",
                    "hsa04151.json",    // "title": "PI3K-Akt signaling pathway",
                  ]

var CRC_Files = [
                    "hsa05210.json"
                ]

var KeggFiles = [];
var KeggDir   = "JSON";
var KeggRegEx = "hsa*.json";

var gNodes = [];
var gLinks = [];
var gFileIndex = 0;
var number2Title = { };
var myKeggNodes  = { };
var myKeggLinks  = { };
var TranscriptionFactors = { };

var primaryInputs  = [];
var primaryOutputs = [];
var traversalStack = [];
var numLoops       = 0;
var numHubs        = 0;
var numPaths       = 0;

var Loops = [];
var Paths = [];

var allLoopTexts = "";
var allHubTexts  = "";
var allPathTexts = "";
var allSortedNodeTexts = "";
var allSimulationTexts = "";

var perturbationsNodes  = [];
var perturbationsValues = [];

function getAllKeggFiles()
{
  KeggFiles = [];
  number2Title = { };

  var fs = require(['fs']);
  fs.readdir(KeggDir, function(err, list) {
    if (err) throw err;
    var regex = new RegExp(KeggRegEx);
    list.forEach( function(item) {
      if( regex.test(item) ) 
        KeggFiles[KeggFiles.length] = item;
    }); 
  });
}


function resetBigKeggNetwork()
{
  gNodes = [];
  gLinks = [];

  delete number2Title;
  number2Title = { };

  delete myKeggNodes;
  myKeggNodes  = { };

  delete myKeggLinks;
  myKeggLinks  = { };

  gFileIndex = 0;
}


function createBigKeggNetwork(cancerType)
{
  KeggFiles = [];
  if (cancerType == "NSCLC") KeggFiles = NSCLC_Files;
  if (cancerType == "CRC")   KeggFiles = CommonPathwayFiles.concat(CRC_Files);
  if (cancerType == "MAIN4") KeggFiles = MAIN4_Files;
  if (cancerType == "MAPK")  KeggFiles = MAPK_Files;

  resetBigKeggNetwork();
  appendKeggNetwork( KeggFiles[0] );
}


function appendKeggNetwork(fileName)
{
  var fullFilePathName = KeggDir + "/" + fileName;

  d3.json(fullFilePathName, function(error, data) {

    if (error) {
      console.log("File not found " + fileName);
      return;
    }

    console.log("Appending Network from File " + fullFilePathName);

    var nodes  = data.pathway.entry;
    var links  = data.pathway.relation;

    var number = parseInt(data.pathway.number);
    var title  = data.pathway.title;
    number2Title[number] = title;

    var groupId2Node = { };
    var nodeId2Index = { };
    var nodeIdx = 0;

    nodes.forEach(function(n) {
      if (n.type != "map") {
        var nodeName = getNodeName(n);
        if (nodeName == "undefined") {
          for (var c = 0; c < n.component.length; c++) {
            if (c == 0) {
              groupId2Node[n.id] = n;
              var cid = n.component[c].id;
              var index = nodeId2Index[cid];
              nodeId2Index[n.id] = index;
              break;
            }
          }
        }
        else {
          if (myKeggNodes.hasOwnProperty(nodeName)) {
            nodeId2Index[n.id]    = myKeggNodes[nodeName];

            TheNode = gNodes[ myKeggNodes[nodeName] ];
            TheNode.Pathways[TheNode.Pathways.length] = title;
          }
          else {
            nodeId2Index[n.id]    = gNodes.length;
            myKeggNodes[nodeName] = gNodes.length;
            gNodes[gNodes.length] = n;

            TheNode = gNodes[gNodes.length - 1];
            TheNode.Pathways = [];
            TheNode.Pathways[TheNode.Pathways.length] = title;
            TheNode.RegulatedGenes = [];
          }
        }
      }
    });

    links.forEach(function(l) {

      var interactionName = getInteractionName(l);
      if (interactionName == "binding/association") {
        l.source = nodeId2Index[l.entry2];
        l.target = nodeId2Index[l.entry1];
      }
      else {
        l.source = nodeId2Index[l.entry1];
        l.target = nodeId2Index[l.entry2];
      }

      var interactionType = getInteractionType(l);
      var linkName = getNodeName(gNodes[l.source]) + ":" + getNodeName(gNodes[l.target]);
      if (!myKeggLinks.hasOwnProperty(linkName) && interactionType != "GErel") {
        myKeggLinks[linkName] = gLinks.length;
        gLinks[gLinks.length] = l;
      }

      // If either is a group node then add duplicate links
      if (groupId2Node.hasOwnProperty(l.entry1) || groupId2Node.hasOwnProperty(l.entry2)) {
        var sourceCompId = [];
        if (groupId2Node.hasOwnProperty(l.entry1)) {
          var groupNode = groupId2Node[l.entry1];
          for (var c = 1; c < groupNode.component.length; c++) {
            sourceCompId[sourceCompId.length] = groupNode.component[c].id;
          }
        }
        else {
          sourceCompId[0] = l.entry1;
        }

        var targetCompId = [];
        if (groupId2Node.hasOwnProperty(l.entry2)) {
          var groupNode = groupId2Node[l.entry2];
          for (var c = 1; c < groupNode.component.length; c++) {
            targetCompId[targetCompId.length] = groupNode.component[c].id;
          }
        }
        else {
          targetCompId[0] = l.entry2;
        }

        for (var i = 0; i < sourceCompId.length; i++) {
          for (var j = 0; j < targetCompId.length; j++) {
            var sourceIdx = nodeId2Index[ sourceCompId[i] ];
            var targetIdx = nodeId2Index[ targetCompId[j] ];
            var linkName  = getNodeName(gNodes[sourceIdx]) + ":" + getNodeName(gNodes[targetIdx]);
            if (!myKeggLinks.hasOwnProperty(linkName) && interactionType != "GErel") {
              myKeggLinks[linkName] = gLinks.length;
              var newLink = jQuery.extend(true, {}, l);
              newLink.source = sourceIdx;
              newLink.target = targetIdx;
              gLinks[gLinks.length] = newLink;
            }
            if (interactionType == "GErel") {
              var TFnode     = gNodes [ sourceIdx ];
              var TargetGene = gNodes [ targetIdx ];
              TranscriptionFactors[TFnode] = true;
              TFnode.RegulatedGenes[TFnode.RegulatedGenes.length] = TargetGene;
            }
          }
        }
      }
      else {
        if (interactionType == "GErel") {
          var TFnode     = gNodes [ nodeId2Index[l.entry1] ];
          var TargetGene = gNodes [ nodeId2Index[l.entry2] ];
          TranscriptionFactors[TFnode] = true;
          TFnode.RegulatedGenes[TFnode.RegulatedGenes.length] = TargetGene;
        }
      }

    });

    ++gFileIndex;
  
    if (gFileIndex < KeggFiles.length) {
      appendKeggNetwork( KeggFiles[gFileIndex] );
    }
    else {
      document.title = unifiedCancerType + " Boolean Network";
      resetGraphics();
      initializeNetworkProperties();
      VisualizeKeggFloating(gNodes, gLinks);
    }
  });
}


function initializeNetworkProperties()
{
  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    n.inDegree  = 0;
    n.outDegree = 0;
    n.delay     = 0;
    n.fanout    = [];
    n.fanin     = [];
    n.linkout    = [];
    n.linkin     = [];
  }

  for (var i = 0; i < gLinks.length; i++) {
    var l = gLinks[i];

    var sourceNode = gNodes[l.source];
    var targetNode = gNodes[l.target];

    if (targetNode != sourceNode.fanout[sourceNode.fanout.length - 1]) {
      sourceNode.fanout[ sourceNode.fanout.length ] = targetNode;
      sourceNode.linkout[ sourceNode.linkout.length ] = l;
      sourceNode.outDegree += 1;
    }

    if (sourceNode != targetNode.fanin[targetNode.fanin.length - 1]) {
      targetNode.fanin [ targetNode.fanin.length  ] = sourceNode;
      targetNode.linkin [ targetNode.linkin.length  ] = l;
      targetNode.inDegree  += 1;
    }

    l.influence  = 0;
    l.distance   = 1;
    l.delay      = 0;

    var interactionName = getInteractionName(l);

    if (interactionName == "activation")          { l.influence =  3; l.delay = 5; }
    if (interactionName == "expression")          { l.influence =  3; l.delay = 5; }
    if (interactionName == "phosphorylation")     { l.influence =  2; l.delay = 3; }

    if (interactionName == "inhibition")          { l.influence = -3; l.delay = 5; }
    if (interactionName == "repression")          { l.influence = -3; l.delay = 5; } 
    if (interactionName == "dephosphorylation")   { l.influence = -2; l.delay = 3; }

    if (interactionName == "binding/association") { l.influence =  1; l.delay = 1; }
    if (interactionName == "dissociation")        { l.influence = -1; l.delay = 1; }

    if (interactionName == "missing interaction") { l.influence =  0; l.delay = 1; }
    if (interactionName == "unknown")             { l.influence =  0; l.delay = 1; }
  }

  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if (n.inDegree == 0) {
      primaryInputs[ primaryInputs.length ] = n;
    }
    else if (n.outDegree == 0) {
      primaryOutputs[ primaryOutputs.length ] = n;
    }
  }
}


var getNodeName = function(d)
{
  if ("name" in d.graphics) {
    var names = d.graphics.name.split(/,/g);
    var nm = names[0];
    if (nm.substring(0,5) == "TITLE") nm = nm.substring(6);
    if (nm.length > 3 && nm.substring(nm.length - 3) == "...") {
      nm = nm.substring(0, nm.length - 3);
    }
    return nm;
  }
  if (d.name != "undefined") {
    var nm = d.name;
    if (nm.substring(0,5) == "TITLE") nm = nm.substring(6);
    return nm;
  }
  return "undefined";
}


function clearFlags()
{
  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    n.visited = false;
  }

  traversalStack = [];
}


function initializeLoops()
{
  clearFlags();
  numLoops = 0;
  delete Loops;
  Loops = [];
  allLoopTexts = "";
}


function initializePaths()
{
  clearFlags();
  numPaths = 0;
  delete Paths;
  Paths = [];
  allPathTexts = "";
}

function detectFeedbackLoops()
{
  initializeLoops();

  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if (n.visited == false) {
      detectLoopsDFS(n);
    }
  }

  console.log("Detected " + numLoops + " feedback loops in the signaling network");
  clearFlags();
}


function detectLoopsDFS(n)
{
  if (n.visited == true) {
    var loopFound = false;
    var loopsNodes = [];
    loopsNodes[loopsNodes.length] = n;

    for (var i = traversalStack.length - 1; i >= 0; i--) {
      var stackNode = traversalStack[i];
      loopsNodes[loopsNodes.length] = stackNode;
      if (stackNode == n) {
        loopFound = true;
        break;
      }
    }

    if (loopFound) {
      var theLoop = [];
      var loopMsg = "" + (numLoops+1) + ". " ;
      for (var i = loopsNodes.length - 1; i >= 0; i--) {
        theLoop[theLoop.length] = loopsNodes[i];
        loopMsg += getNodeName(loopsNodes[i]);
        if (i > 0) loopMsg += "->";
      }
      Loops[numLoops] = theLoop;
      ++numLoops;

      allLoopTexts += loopMsg + "<br>";
      console.log(loopMsg);
    }

    return;
  }

  n.visited = true;
  traversalStack[ traversalStack.length ] = n;

  for (var i = 0; i < n.fanout.length; i++) {
    var fo = n.fanout[i];
    detectLoopsDFS(fo);
  }

  traversalStack.length -= 1;
}


function searchAndcenter(symbols)
{
  var names = symbols.split(/\s+/g);

  theCentralNode = theFromNode = theToNode = null;

  if (names.length == 1) {
    var index = myKeggNodes[names[0]];
    if (index >= 0 && index < gNodes.length) {
      theCentralNode = gNodes[index];
      KeggFloatingForce.resume();
    }
  }
  else if (names.length == 2) {
    var fromIndex = myKeggNodes[names[0]];

    // for simulation
    if (names[1] == "1" || names[1] == "0") {
      if (fromIndex >= 0 && fromIndex < gNodes.length) {
        perturbationsNodes  = [];
        perturbationsValues = [];
        perturbationsNodes[ perturbationsNodes.length ] = gNodes[fromIndex];
        perturbationsValues[ perturbationsValues.length ] = names[1] == "1" ? 1 : 0;
      }
    }

    var toIndex   = myKeggNodes[names[1]];
    if (fromIndex >= 0 && fromIndex < gNodes.length &&
        toIndex   >= 0 && toIndex   < gNodes.length) {
      theFromNode = gNodes[fromIndex];
      theToNode   = gNodes[toIndex];
      KeggFloatingForce.resume();
    }
  }
  else {
    perturbationsNodes  = [];
    perturbationsValues = [];
    for (var i = 0; i < names.length; i += 2) {
      var index = myKeggNodes[names[i]];
      perturbationsNodes[ perturbationsNodes.length ] = gNodes[index];
      perturbationsValues[ perturbationsValues.length ] = names[i+1] == "1" ? 1 : 0;
    }
  }




}

function detectHubNodes()
{
  numHubs = 0;
  allHubTexts = "";

  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    var degree = n.inDegree + n.outDegree;
    if (degree > 10) {
      allHubTexts += " " + getNodeName(n) + "<br>";
      ++numHubs;
    }
  }

  allHubTexts += "<br>" + "<br>" + "Primary Inputs" + "<br>";
  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if (n.inDegree == 0 && n.outDegree > 0) {
      allHubTexts += " " + getNodeName(n) + "<br>";
    }
  }

  allHubTexts += "<br>" + "<br>" + "Transcription Factors" + "<br>";
  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if (n.RegulatedGenes.length > 0) {
      allHubTexts += " " + getNodeName(n) + "<br>";
    }
  }

  allHubTexts += "<br>" + "<br>" + "Primary Outputs" + "<br>";
  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if (n.inDegree > 0 && n.outDegree == 0) {
      allHubTexts += " " + getNodeName(n) + "<br>";
    }
  }
}

function sortNodes()
{
  numSortedNodes = 0;
  allSortedNodeTexts = "";

  allNodes = gNodes.slice();
  allNodes.sort( function(a, b) {
                   aDegree = (a.inDegree + a.outDegree);
                   bDegree = (b.inDegree + b.outDegree);
                   if (aDegree == 0) return  1000;
                   if (bDegree == 0) return -1000;
                   // diffPathways = b.Pathways.length - a.Pathways.length;
                   // if (diffPathways != 0) return diffPathways;
                   diffDegree = (b.Pathways.length * bDegree) - (a.Pathways.length * aDegree);
                   return diffDegree;
                 }
               );

  for (var i = 0; i < allNodes.length; i++) {
    var n = allNodes[i];
    {
      allSortedNodeTexts += "     " + getNodeName(n) + "     ";
      allSortedNodeTexts += "             Degree: " + (n.inDegree + n.outDegree) + "  ";
      // allSortedNodeTexts += "Pathways : " + n.Pathways.length + "   Degree: " + (n.inDegree + n.outDegree) + "  ";
      
      // for (var j = 0; j < n.Pathways.length; j++) {
      //   allSortedNodeTexts += " | " + n.Pathways[j];
      // }
      allSortedNodeTexts += "<br>";

      ++numSortedNodes;
    }
  }
}


var getLongestPath = function()
{
  var maxPath = null;
  if (numPaths > 0) {
    maxPath = Paths[0];
    for (var i = 1; i < Paths.length; i++) {
      var path = Paths[i];
      if (path.length > maxPath.length) {
        maxPath = path;
      }
    }
  }
  return maxPath;
}


var getShortestPath = function()
{
  var minPath = null;
  if (numPaths > 0) {
    minPath = Paths[0];
    for (var i = 1; i < Paths.length; i++) {
      var path = Paths[i];
      if (path.length < minPath.length) {
        minPath = path;
      }
    }
  }
  return minPath;
}


function shortestPath()
{
  if (theFromNode == null || theToNode == null) return;
  initializePaths();
  pathsTo(theToNode);
  var path = getShortestPath();
  if (path != null) {
    for (var i = 0; i < path.length; i++) {
      allPathTexts += getNodeName(path[i]);
      if (i < path.length - 1) allPathTexts += "-->";
    }
  }
  clearFlags();
}


function longestPath()
{
  if (theFromNode == null || theToNode == null) return;
  initializePaths();
  pathsTo(theToNode);
  var path = getLongestPath();
  if (path != null) {
    for (var i = 0; i < path.length; i++) {
      allPathTexts += getNodeName(path[i]);
      if (i < path.length - 1) allPathTexts += "-->";
    }
  }
  clearFlags();
}


function allPaths()
{
  if (theFromNode == null || theToNode == null) return;
  initializePaths();
  pathsTo(theToNode);

  for (var i = 0; i < Paths.length; i++) {
    var path = Paths[i];
    allPathTexts += (i+1) + ". ";
    for (var j = 0; j < path.length; j++) {
      allPathTexts += getNodeName(path[j]);
      if (j < path.length - 1) allPathTexts += "-->";
    }
    allPathTexts +=  "<br>";
  }

  clearFlags();
}


function pathsTo(n)
{
  if (n.visited == true) {
    return;
  }

  if (n == theFromNode) {
    var thePath = [];
    thePath[thePath.length] = n;
    for (var i = traversalStack.length - 1; i >= 0; i--) {
      var stackNode = traversalStack[i];
      thePath[thePath.length] = stackNode;
    }
    Paths[numPaths] = thePath;
    ++numPaths;
    return;
  }

  n.visited = true;
  traversalStack[ traversalStack.length ] = n;

  for (var i = 0; i < n.fanin.length; i++) {
    var fi = n.fanin[i];
    pathsTo(fi);
  }

  traversalStack.length -= 1;
}

// ###############################################################################
//  Event driven DFS based simulation
// ###############################################################################

var TimeStep = 0;        // Simulation time steps
var LoopingLinks = [];   // Looping links found during simulation
var hasSimulationData = false;

var getLastNodeValue = function(d) 
{
  var val = -1;
  if (d.Value.length > 0) {
    val = d.Value[d.Value.length -1];
  }
  return val;
}

function clearSimulation()
{
  clearFlags();

  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    n.Value = [];
  }

  TimeStep = 0;
  delete LoopingLinks;
  LoopingLinks = [];

  hasSimulationData = false;
}


function initializeSimulation()
{
  clearFlags();

  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    n.Value = [];
    n.Value[ n.Value.length ] = -1;   // -1 denotes X
  }

  TimeStep = 0;
  delete LoopingLinks;
  LoopingLinks = [];
}


function outputSimulation()
{
  allSimulationTexts = "";
  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    var Val  = getLastNodeValue(n);

    if (Val < 0) {
      allSimulationTexts += getNodeName(n) + "   :   " + "undefined" + "<br>";
    }
    else {
      allSimulationTexts += getNodeName(n) + "   :   " + Val + "<br>";
    }
  }
}

function performSimulation()
{
  initializeSimulation();

  for (var i = 0; i < perturbationsNodes.length; i++) {
    simulateForward( perturbationsNodes[i], perturbationsValues[i] );
  }

  for (var Iteration = 2; Iteration < 6; Iteration++) {
    if (LoopingLinks.length == 0) break;
    for (var i = 0; i < LoopingLinks.length; i++) {
      var link = LoopingLinks[i];
      var sourceNode = link.source;
      var targetNode = link.target;
      var v = sourceNode.Value[ sourceNode.Value.length - 1 ];
      var nextVal = getNextValue(v, link, targetNode);
      if (nextVal < 0) continue;
      simulateForward(targetNode, nextVal);
    }
  }

  hasSimulationData = true;

  outputSimulation();
}

var isActivating = function(interactionName)
{
  return (interactionName == "activation"      || 
          interactionName == "phosphorylation" || 
          interactionName == "binding/association");
}

var isInhibiting = function(interactionName)
{
  return (interactionName == "inhibition"        || 
          interactionName == "dephosphorylation" || 
          interactionName == "dissociation");
}

var isUnset = function(v)
{
  return (v < 0);
}

var isSet = function(v)
{
  return (v >= 0);
}

var getNextValue = function(v, l, toNode)
{
  if (v < 0) return v;

  // Check Potential conflicts
  if (toNode.linkin.length > 1) {
    var rtnVal = -1;
    var conflict = false;
    for (var i = 0; i < toNode.linkin.length; i++) {
      var inlink = toNode.linkin[i];
      var sourceNode = inlink.source;
      var sourceVal  = getLastNodeValue(sourceNode);
      var inlinkName = getInteractionName(inlink);

      if (isSet(sourceVal)) {
        if (isActivating(inlinkName)) {
          if (isUnset(rtnVal)) rtnVal = sourceVal;
          if (rtnVal != sourceVal) conflict = true;
        }
        if (isInhibiting(inlinkName)) {
          var invertedVal = (sourceVal == 0) ? 1 : 0;
          if (isUnset(rtnVal)) rtnVal = invertedVal;
          if (rtnVal != invertedVal) conflict = true;
        }
      }
    }
    if (conflict) return -1;
  }

  var interactionName = getInteractionName(l);

  if (interactionName == "activation")          return v;
  if (interactionName == "inhibition")          return (v == 0) ? 1 : 0;
  if (interactionName == "phosphorylation")     return v;
  if (interactionName == "dephosphorylation")   return (v == 0) ? 1 : 0;
  if (interactionName == "binding/association") return v;
  if (interactionName == "dissociation")        return (v == 0) ? 1 : 0;

  // "GErel" type (TF to targetGene: expression or repression)
  if (interactionName == "expression")          return -1;
  if (interactionName == "repression")          return -1; 

  if (interactionName == "missing interaction") return -1;
  if (interactionName == "unknown")             return -1;
}


function simulateForward(n, v)
{
  if (n.visited == true) return;

  n.visited = true;

  var prevValue = n.Value[n.Value.length - 1];
  if (v == prevValue) return;

  n.Value[ n.Value.length ] = v;

  for (var i = 0; i < n.linkout.length; i++) {
    var link = n.linkout[i];
    var fo   = link.target;

    // Feed-back or Feed-forward loop
    if (fo.visited == true) {
      LoopingLinks[LoopingLinks.length] = link;
      continue;
    }

    var nextVal = getNextValue(v, link, fo);
    if (nextVal < 0) continue;  // Simulation failed to get a value
    simulateForward(fo, nextVal);  // Simulate recursively forward in a DFS manner
  }
}
