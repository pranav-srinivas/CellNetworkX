
var numPaths       = 0;

var Paths = [];

var allPathTexts = "";

function initializePaths()
{
  clearFlags();
  numPaths = 0;
  delete Paths;
  Paths = [];
  allPathTexts = "";
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

  for (var i = 0; i < n.linkin.length; i++) {
    var l  = n.linkin[i];
    var fi = l.source;
    if (l.isDisabled == true || fi.isDisabled == true) continue;
    pathsTo(fi);
  }

  traversalStack.length -= 1;
}

