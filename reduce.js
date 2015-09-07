// Reduce unified signaling network by disabling unwanted nodes/links
function reduceNetwork()
{
  removeUnobserableNodes();

  recomputeDegrees();
  identifyPrimaryInputsAndOutputs();

  resetGraphics();
  VisualizeKeggFloating(gNodes, gLinks);
}


// Disable isolated nodes (no input and outpus)
function removeIsolatedNodes()
{
  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if (n.inDegree == 0 && n.outDegree == 0) {
      n.isDisabled = true;
    }
  }
}


// Disable all compound nodes and associated links
function disableCompoundsAndAssociatedLinks()
{
  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if (n.type == "compound") {
      for (var k = 0; k < n.linkin.length; k++) {
        var l  = n.linkin[k];
        l.isDisabled = true;
      }
      for (var k = 0; k < n.linkout.length; k++) {
        var l  = n.linkout[k];
        l.isDisabled = true;
      }
      n.isDisabled = true;
    }
  }
}


// Disable nodes and links NOT on a path to a transcription factor (TF)
function removeUnobserableNodes()
{
  clearFlags();

  // Mark Backwards from TF nodes
  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if (n.isTF == true) {
      markBackwards(n, null);
    }
  }

  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if (n.visited == false) n.isDisabled = true;
  }

  for (var i = 0; i < gLinks.length; i++) {
    var l = gLinks[i];
    if (l.visited == false) l.isDisabled = true;
  }
}


function markBackwards(n, l)
{
  if (l != null) {
    if (l.isDisabled == true) return;
    if (l.visited  == true) return;
    l.visited = true;
  }

  if (n.visited == true) return;
  n.visited = true;

  for (var i = 0; i < n.linkin.length; i++) {
    var inlink = n.linkin[i];
    var sourceNode = inlink.source;
    markBackwards(sourceNode, inlink);
  }
}


function markForwards(n, l)
{
  if (l != null) {
    if (l.isDisabled == true) return;
    if (l.visited  == true) return;
    l.visited = true;
  }

  n.visited = true;

  for (var i = 0; i < n.linkout.length; i++) {
    var outlink = n.linkout[i];
    var targetNode = outlink.target;
    markForwards(targetNode, outlink);
  }
}


