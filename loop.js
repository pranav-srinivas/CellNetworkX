
var traversalStack = [];
var numLoops       = 0;

var Loops = [];

var allLoopTexts = "";


function clearFlags()
{
  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    n.visited = false;
  }

  for (var i = 0; i < gLinks.length; i++) {
    var l = gLinks[i];
    l.visited = false;
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

