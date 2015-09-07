function setupForExprAnnotation(numSamples)
{
  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if ('isActive' in n) delete n.isActive;
    n.isActive = null;
    if (n.isDisabled == true) continue;
    n.isActive = new Array(numSamples);
    for (var b in n.isActive) b = false;
  }

  for (var i = 0; i < gLinks.length; i++) {
    var l = gLinks[i];
    if ('isActive' in l) delete l.isActive;
    l.isActive = null;
    if (l.isDisabled) continue;
    l.isActive = new Array(numSamples);
    for (var b in l.isActive) b = false;
  }
}


//-----------------------------------------------------------------
//  Working  (return true) : 1 --> 1, 0 --> 0, 1 --| 0, 0 --| 1
// Conflict (return false) : 1 --> 0, 0 --> 1, 1 --| 1, 0 --| 0
//-----------------------------------------------------------------

var isLinkWorking = function(l, sampleIndex)
{
  if (l.isDisabled) return false;

  var sourceNode = l.source;
  var targetNode = l.target;
  var linkName = getInteractionName(l);
  var activating = isActivating(linkName);
  var inhibiting = isInhibiting(linkName);

  if (activating && sourceNode.isActive[sampleIndex] == targetNode.isActive[sampleIndex]) {
    return true;
  }
  if (inhibiting && sourceNode.isActive[sampleIndex] != targetNode.isActive[sampleIndex]) {
    return true;
  }

  return false;
}


var isNodeActive = function(n, sampleIndex)
{
  if (n.isDisabled) return false;
  return n.isActive[sampleIndex];
}

var isLinkActive = function(l, sampleIndex)
{
  if (l.isDisabled) return false;
  return l.isActive[sampleIndex];
}

sampleNames = [];

function enrichWithCCLEExpr( Id )
{
  sampleNames = [];

  var fileName = "";

       if (Id == 1) fileName = "CCLE" + "/" + "ADCBinaryExpr.dat";
  else if (Id == 2) fileName = "CCLE" + "/" + "SCCBinaryExpr.dat";
  else return;

  d3.text(fileName, function(error, d) {
    if (error) {
      console.log("File not found " + fileName);
      return;
    }

    var lines = d3.tsv.parseRows(d);
    var numSamples = lines.length - 1;
    setupForExprAnnotation(numSamples);

    genes = lines[0];

    for (var i = 1; i < lines.length; i++) {
      exprs = lines[i];
      sampleName = exprs[0];
      sampleNames[ sampleNames.length ] = sampleName;
      for (var j = 1; j < exprs.length; j++) {
        var active = (exprs[j] == "P");
        var nodeName = genes[j-1];
        if (myKeggNodes.hasOwnProperty(nodeName)) {
          var n = gNodes[ myKeggNodes[nodeName] ];
          if (n.isDisabled == true) continue;
          n.isActive[i-1] = active;
        }
      }
    }

    for (var i = 0; i < gLinks.length; i++) {
      var l = gLinks[i];
      if (l.isDisabled) continue;
      for (var sampleIdx = 0; sampleIdx < numSamples; sampleIdx++) {
        l.isActive[sampleIdx] = isLinkWorking(l, sampleIdx);
      }
    }

  });



}

