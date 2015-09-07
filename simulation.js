// ###############################################################################
//  Event driven DFS based simulation
// ###############################################################################

var allSimulationTexts = "";
var perturbationsNodes  = [];
var perturbationsValues = [];

var TimeStep = 0;        // Simulation time steps
var LoopingLinks = [];   // Looping links found during simulation
var hasSimulationData = false;

var currentSampleIndex = 0; // used for indexing Active information at nodes

var getLastNodeValue = function(d) 
{
  var val = -1;
  if (d.Value.length > 0) {
    val = d.Value[d.Value.length -1];
  }
  return val;
}


// Activating 0 --> 0
var isLinkZerotoZero = function(l, sampleIndex)
{
  if (l.isDisabled) return false;

  var sourceNode = l.source;
  var targetNode = l.target;
  var linkName = getInteractionName(l);
  var activating = isActivating(linkName);

  if (activating) {
    if (hasSimulationData) {
      var sval = getLastNodeValue(sourceNode);
      var tval = getLastNodeValue(targetNode);
      if (sval == 0 && tval == 0)
        return true;
    }
    else if (!sourceNode.isActive[sampleIndex] && !targetNode.isActive[sampleIndex]) {
      return true;
    }
  }

  return false;
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
    n.drugSource = false;

    if (n.isDisabled) {
      n.Value[ n.Value.length ] = -1;   // -1 denotes X
    }
    else {
      n.Value[ n.Value.length ] = n.isActive[currentSampleIndex] ? 1 : 0;
    }
  }

  for (var i = 0; i < gLinks.length; i++) {
    var l = gLinks[i];
    l.drugAffected = false;
  }

  TimeStep = 0;

  delete LoopingLinks;
  LoopingLinks = [];
}


function outputSimulationHeader()
{
  allSimulationTexts = "#####################" + "###" + "######" + "###" + "###############" + "<br>";
  allSimulationTexts += "Tumor Sample: " + currentSampleIndex + ". " +  sampleNames[currentSampleIndex] + "<br>";
  if (perturbationsNodes.length == 0) {
    allSimulationTexts += "Simulated Drug: " ;
    allSimulationTexts += addCurrentDrugName();
  }
  allSimulationTexts += "#####################" + "###" + "######" + "###" + "###############" + "<br>";
  allSimulationTexts += " " + "<br>";
}


function outputSimulation()
{
  allSimulationTexts = "";
  outputSimulationHeader();

  for (var k = 0; k < 2; k++) {
    allSimulationTexts += ( (k == 0) ? "Transcription Factors" : "Other Nodes" ) + "<br>";
    allSimulationTexts += "-------------------------" + "<br>";
    allSimulationTexts += "<br>";
    for (var i = 0; i < gNodes.length; i++) {
      var n = gNodes[i];
      if (n.isDisabled) continue;
      if (k == 0 && n.isTF == false) continue;
      if (k == 1 && n.isTF == true)  continue;
      allSimulationTexts += getNodeName(n) + " : ";
      for (var j = 0; j < n.Value.length; j++) {
        var Val = n.Value[j];
        if (Val < 0) continue;
        allSimulationTexts += "         " + Val;
      }
      allSimulationTexts += "<br>";
    }
    allSimulationTexts += " " + "<br>";
  }
}


function advanceTimeStep()
{
  TimeStep++;
  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if (n.isDisabled) continue;
    if (n.Value.length < (TimeStep + 1)) {
      n.Value[ n.Value.length ] = n.Value[ n.Value.length - 1];
    }
    if (n.Value.length != (TimeStep + 1)) {
      console.log("Simulation Error");
    }
  }
}


function performSimulation()
{
  initializeSimulation();

  if (perturbationsNodes.length > 0) {
    for (var i = 0; i < perturbationsNodes.length; i++) {
      simulateForward( perturbationsNodes[i], perturbationsValues[i] );
    }
  }
  else {
    for (var k = 0; k < currentDrugIdx.length; k++) {
      var drugIdx = currentDrugIdx[k];
      var theDrug = Drugs[drugIdx];
      for (var i = 0; i < theDrug.inhibit.length; i++) {
        var name = theDrug.inhibit[i];
        var n = getNode(name);
        if (n == null) continue;
        n.drugSource = true;
        simulateForward(n, 0);
      }
      for (var i = 0; i < theDrug.activate.length; i++) {
        var name = theDrug[i];
        var n = getNode(name);
        if (n == null) continue;
        n.drugSource = true;
        simulateForward(n, 1);
      }
    }
  }

  advanceTimeStep();

  for (var Iteration = 2; Iteration < 6; Iteration++) {
    if (LoopingLinks.length == 0) break;
    var changedNodes  = [];
    var changedValues = [];
    for (var i = 0; i < LoopingLinks.length; i++) {
      var link = LoopingLinks[i];
      if (link.isDisabled) continue;
      var sourceNode = link.source;
      var targetNode = link.target;
      var v = sourceNode.Value[ sourceNode.Value.length - 1 ];
      var nextVal = getNextValue(v, link, targetNode);
      if (nextVal < 0) continue;
      var prevValue = targetNode.Value[targetNode.Value.length - 1];
      if (nextVal == prevValue) continue;
      changedNodes[changedNodes.length]   = targetNode;
      changedValues[changedValues.length] = nextVal;
    }

    clearFlags();
    delete LoopingLinks;
    LoopingLinks = [];
    
    for (var i = 0; i < changedNodes.length; i++) {
      simulateForward( changedNodes[i], changedValues[i] );
    }

    advanceTimeStep();
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
  if (false && toNode.linkin.length > 1) {
    var rtnVal = -1;
    var conflict = false;
    for (var i = 0; i < toNode.linkin.length; i++) {
      var inlink = toNode.linkin[i];
      if (inlink.isDisabled) continue;

      var sourceNode = inlink.source;
      var sourceVal  = getLastNodeValue(sourceNode);
      var inlinkName = getInteractionName(inlink);

      if (isSet(sourceVal)) {
        if (isActivating(inlinkName)) {
          if (isUnset(rtnVal)) rtnVal = sourceVal;
          if (rtnVal != sourceVal)
            conflict = true;
        }
        if (isInhibiting(inlinkName)) {
          var invertedVal = (sourceVal == 0) ? 1 : 0;
          if (isUnset(rtnVal)) rtnVal = invertedVal;
          if (rtnVal != invertedVal)
            conflict = true;
        }
      }
    }
    if (conflict) {
      return -1;
    }
  }

  var interactionName = getInteractionName(l);

  if (interactionName == "activation")          return v;
  if (interactionName == "inhibition")          return (v == 0) ? 1 : 0;
  if (interactionName == "phosphorylation")     return v;
  if (interactionName == "dephosphorylation")   return (v == 0) ? 1 : 0;
  if (interactionName == "binding/association") return v;
  if (interactionName == "dissociation")        return (v == 0) ? 1 : 0;

  if (interactionName == "indirect effect")     return -1;

  // "GErel" type (TF to targetGene: expression or repression)
  if (interactionName == "expression")          return -1;
  if (interactionName == "repression")          return -1; 

  if (interactionName == "missing interaction") return -1;
  if (interactionName == "unknown")             return -1;

  return -1;
}


function simulateForward(n, v)
{
  if (n.visited == true) return;
  if (n.isDisabled == true) return;

  n.visited = true;

  var prevValue = n.Value[n.Value.length - 1];
  if (v == prevValue) return;

  if (v != 0 && v != 1) {
    return;
  }

  n.Value[ n.Value.length ] = v;

  // Invalidate visited flag forward
  for (var i = 0; i < n.linkout.length; i++) {
    var link = n.linkout[i];
    var fo   = link.target;
    if (fo == n) continue;
    if (fo.visited && n.Value.length != fo.Value.length) {
      fo.visited = false;
    }
  }

  for (var i = 0; i < n.linkout.length; i++) {
    var link = n.linkout[i];
    var fo   = link.target;
    if (fo == n) continue;

    if (link.isDisabled == true || fo.isDisabled == true) continue;

    if (!isLinkActive(link, currentSampleIndex))
      continue;

    // Feed-back or Feed-forward loop
    if (fo.visited == true) {
      LoopingLinks[LoopingLinks.length] = link;
      continue;
    }

    var nextVal = getNextValue(v, link, fo);
    if (nextVal < 0) continue;  // Simulation failed to get a value
    if (nextVal != fo.Value[fo.Value.length - 1]) {
      link.drugAffected = true;
    }
    simulateForward(fo, nextVal);  // Simulate recursively forward in a DFS manner
  }
}

