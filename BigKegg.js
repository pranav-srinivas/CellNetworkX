var CommonPathwayFiles = [ "hsa05200.json",
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
                    "hsa05223.json",    // "title": "Non-small cell lung cancer",
                  ]


var MAPK_Files =  [
                    "hsa04010.json"     // "title": "MAPK signaling pathway",
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

var primaryInputs  = [];
var primaryOutputs = [];
var TranscriptionFactors = [];

var allTfTexts  = "";
var allSortedNodeTexts = "";
var exportNetworkTexts = "";


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
  if (cancerType == "NSCLC") KeggFiles = CommonPathwayFiles.concat(NSCLC_Files);
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
            TheNode.isTF = false;
            TheNode.isRegulated = false;
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
          for (var c = 0; c < groupNode.component.length; c++) {
            sourceCompId[sourceCompId.length] = groupNode.component[c].id;
          }
        }
        else {
          sourceCompId[0] = l.entry1;
        }

        var targetCompId = [];
        if (groupId2Node.hasOwnProperty(l.entry2)) {
          var groupNode = groupId2Node[l.entry2];
          for (var c = 0; c < groupNode.component.length; c++) {
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
              TFnode.isTF = true;
              TargetGene.isRegulated = true;
              TFnode.RegulatedGenes[TFnode.RegulatedGenes.length] = TargetGene;
            }
          }
        }
      }
      else {
        if (interactionType == "GErel") {
          var TFnode     = gNodes [ nodeId2Index[l.entry1] ];
          var TargetGene = gNodes [ nodeId2Index[l.entry2] ];
          TFnode.isTF = true;
          TargetGene.isRegulated = true;
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
    n.fanout    = [];
    n.fanin     = [];
    n.linkout   = [];
    n.linkin    = [];
    n.isDisabled  = false;
  }

  for (var i = 0; i < gLinks.length; i++) {
    var l = gLinks[i];
    l.isDisabled  = false;

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

    if (interactionName == "missing interaction" ||
        interactionName == "unknown"             ||
        interactionName == "indirect effect"     ||
        interactionName == "state change") {
      l.isDisabled = true;
    }
  }

  disableCompoundsAndAssociatedLinks();
  removeIsolatedNodes();

  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if (n.inDegree == 0 && n.isDisabled == false) {
      primaryInputs[ primaryInputs.length ] = n;
    }
    else if (n.outDegree == 0 && n.isDisabled == false) {
      primaryOutputs[ primaryOutputs.length ] = n;
    }
    if (n.isTF) {
      TranscriptionFactors[ TranscriptionFactors.length ] = n;
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

function detectTFs()
{
  allTfTexts = "";

  allTfTexts += "Transcription Factors" + "<br>";
  allTfTexts += "-------------------------" + "<br>";
  allTfTexts += " " + "<br>";
  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if (n.isTF == true || n.RegulatedGenes.length > 0) {
      allTfTexts += " " + getNodeName(n) + "<br>";
    }
  }

  allTfTexts += "Primary Inputs" + "<br>";
  allTfTexts += "-------------------------" + "<br>";
  allTfTexts += " " + "<br>";
  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if (n.inDegree == 0 && n.outDegree > 0 && n.isDisabled == false) {
      allTfTexts += " " + getNodeName(n) + "<br>";
    }
  }

  allTfTexts += "Primary Outputs" + "<br>";
  allTfTexts += "-------------------------" + "<br>";
  allTfTexts += " " + "<br>";
  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if (n.inDegree > 0 && n.outDegree == 0 && n.isTF == false && n.isDisabled == false) {
      allTfTexts += " " + getNodeName(n) + "<br>";
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
      allSortedNodeTexts += "             (Degree: " + (n.inDegree + n.outDegree) + ")  ";
      // allSortedNodeTexts += "Pathways : " + n.Pathways.length + "   Degree: " + (n.inDegree + n.outDegree) + "  ";
      
      // for (var j = 0; j < n.Pathways.length; j++) {
      //   allSortedNodeTexts += " | " + n.Pathways[j];
      // }
      allSortedNodeTexts += "<br>";

      ++numSortedNodes;
    }
  }
}


function dumpNetwork()
{
  exportNetworkTexts = "";
  for (var i = 0; i < gLinks.length; i++) {
    var l = gLinks[i];
    if (l.isDisabled == true) continue;

    var interactionName = getInteractionName(l);

    if (interactionName == "activation" ||
        interactionName == "inhibition" ||
        interactionName == "phosphorylation" ||
        interactionName == "dephosphorylation" ||
        interactionName == "dissociation"      ||
        interactionName == "binding/association") {

      var sourceNode = l.source;
      var targetNode = l.target;
      var linkText = getNodeName(sourceNode) + "\t" + interactionName + "\t" + getNodeName(targetNode) + "\n";
      exportNetworkTexts += linkText + "<br>";
    }
  }

  exportNetworkTexts  +=  "<br>";
  exportNetworkTexts  +=  "<br>";
  exportNetworkTexts  +=  " NODES <br>";
  exportNetworkTexts  +=  "<br>";

  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if (n.isDisabled == true) continue;
    exportNetworkTexts += getNodeName(n) + "<br>";
  }
}


function recomputeDegrees()
{
  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    n.inDegree  = 0;
    n.outDegree = 0;
  }

  for (var i = 0; i < gLinks.length; i++) {
    var l = gLinks[i];
    if (l.isDisabled) continue;

    var sourceNode = l.source;
    var targetNode = l.target;

    sourceNode.outDegree += 1;
    targetNode.inDegree  += 1;
  }
}

function identifyPrimaryInputsAndOutputs()
{
  delete primaryInputs;
  primaryInputs = [];

  delete primaryOutputs;
  primaryOutputs = [];

  delete TranscriptionFactors;
  TranscriptionFactors = [];

  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if (n.inDegree == 0 && n.isDisabled == false) {
      primaryInputs[ primaryInputs.length ] = n;
    }
    else if (n.outDegree == 0 && n.isDisabled == false) {
      primaryOutputs[ primaryOutputs.length ] = n;
    }
    if (n.isTF) {
      TranscriptionFactors[ TranscriptionFactors.length ] = n;
    }
  }
}


var getNode = function (nodeName)
{
  if (myKeggNodes.hasOwnProperty(nodeName)) {
    var TheNode = gNodes[ myKeggNodes[nodeName] ];
    return TheNode;
  }
  return null;
}
