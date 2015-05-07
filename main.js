var w = window.screen.availWidth;
var h = window.screen.availHeight;

var W = w - 30;
var H = h - 20;

var R = 40;
var r = 10;

var fill = d3.scale.category20();

var svg = d3.select("#chart")
            .append("svg:svg");

svg.attr("width", w)
   .attr("height", h);

svg.attr("pointer-events", "all");

var zoomer = d3.behavior.zoom().on("zoom", redraw)
                        .translate([0, 0]).scale(1);

var vis = svg.append('svg:g')
             .call(zoomer)
             .append('svg:g')
             .attr("id", "svg-container");

function redraw() {
  console.log("here", d3.event.translate, d3.event.scale);
  vis.attr("transform",
      "translate(" + d3.event.translate + ")"
      + " scale(" + d3.event.scale + ")");
}


var     expressionFileName = "";
var  customNetworkFileName = "";
var  backgroundPPIFileName = "BackgroundPPI.json";
var backgroundKEGGFileName = "KEGG.json";

var currKeggFileName = backgroundKEGGFileName;
var prevKeggFileName    = [ ];

var visiblePPIProteins = ["KRAS", "MTOR", "BRAF", "PTEN"];

var    fullNetworkPathName = "";
var fullExpressionPathName = "";

var    networkReader = new FileReader();
var expressionReader = new FileReader();

var networkText, expressionText;
var networkExtension, expressionExtension;

networkReader.onload = function(e) {
  networkText = networkReader.result;
}

expressionReader.onload = function(e) {
  expressionText = expressionReader.result;
  loadExpressionData();
}

//----------------------------------------------------------
// Type of Network:   1: Custom Network
//                    2: PPI Network
//                    3: KEGG Floating Network
//                    4: KEGG Fixed Network
//                    5: PPI Reduced Network
//                    6: Big Unified KEGG Network
//----------------------------------------------------------
var networkType = 2;
$("#PPI1").addClass("activeBN");

var chartType = 0;

$("a.dropdown-toggle").dropdown();

var unifiedCancerType = "NSCLC";

//----------------------------------------------------------
// Navigation Bar Processing
//----------------------------------------------------------

function DeselectAllBN()
{
      $("#PPI1").removeClass("activeBN");
      $("#PPI2").removeClass("activeBN");
      $("#KBN1").removeClass("activeBN");
      $("#KBN2").removeClass("activeBN");
      $("#NONE").removeClass("activeBN");
}

function DeselectAllCH()
{
      $("#BC").removeClass("activeCH");
      $("#LC").removeClass("activeCH");
}

$(document).ready(function() {

    $('#searchTerm').change(function(evt) {
        var searchedSymbols = evt.currentTarget.value;
        if (networkType == 6) {
          searchAndcenter(searchedSymbols);
        }
    });


    $('#networkFile').change(function(evt) {
        var f = evt.target.files[0];
        networkReader.readAsText(f);
        fullNetworkPathName = ($(this).val());
        customNetworkFileName = fullNetworkPathName.split(/(\\|\/)/g).pop()
        networkExtension = customNetworkFileName.split('.').pop();
        networkType = 1;
        DeselectAllBN();
        doAnimation = false;
        $("#NONE").addClass("activeBN");
    });

    $('#expressionFile').change(function(evt) {
        var f = evt.target.files[0];
        expressionReader.readAsText(f);
        fullExpressionPathName = ($(this).val());
        expressionFileName = fullExpressionPathName.split(/(\\|\/)/g).pop()
        expressionExtension = expressionFileName.split('.').pop();
        doAnimation = false;
    });

    $("a.dropdown-toggle").click(function(evt) {
      $("a.dropdown-toggle").dropdown();
    });

    $("ul.dropdown-menu a").click(function(evt) {
      $("a.dropdown-toggle").dropdown();

      var menuText = this.innerText;

      if (menuText != "Animation") {
        doAnimation = false;
      }

      if (menuText == "PPI Network") {
        networkType = 2;
        DeselectAllBN();
        $("#PPI1").addClass("activeBN");
      }
      else if (menuText == "PPI Reduced Network") {
        networkType = 5;
        DeselectAllBN();
        $("#PPI2").addClass("activeBN");
      }
      else if (menuText == "KEGG Floating Network") {
        networkType = 3;
        currKeggFileName = backgroundKEGGFileName;
        DeselectAllBN();
        $("#KBN1").addClass("activeBN");
      }
      else if (menuText == "KEGG Fixed Network") {
        networkType = 4;
        currKeggFileName = backgroundKEGGFileName;
        DeselectAllBN();
        $("#KBN2").addClass("activeBN");
      }
      else if (menuText == "No Background Network") {
        networkType = 1;
        DeselectAllBN();
        $("#NONE").addClass("activeBN");
      }
      else if (menuText == "Bubble Chart") {
        chartType = 1;
        DeselectAllCH();
        $("#BC").addClass("activeCH");
        DisplayChart();
      }
      else if (menuText == "Line Chart") {
        chartType = 2;
        DeselectAllCH();
        $("#LC").addClass("activeCH");
        DisplayChart();
      }
      

    });

});

$('#UploadNetwork').click( function() {
  document.getElementById('networkFile').click();
});


$('#ExpressionData').click( function() {
  document.getElementById('expressionFile').click();
});

$('#ShowNetwork').click( function() {
  chartType = 0;
  doAnimation = false;
  $("body").css("cursor", "progress");
  showNetwork();
  $("body").css("cursor", "default");
});

$('#Animation').click( function() {
  $("body").css("cursor", "progress");
  performAnimation();
  $("body").css("cursor", "default");
});


$('#ShowNSCLCNetwork').click( function() {
  chartType = 0;
  doAnimation = false;
  networkType = 6;
  DeselectAllBN();
  unifiedCancerType = "NSCLC";
  $("body").css("cursor", "progress");
  createBigKeggNetwork(unifiedCancerType);
  $("body").css("cursor", "default");
});


$('#ShowCRCNetwork').click( function() {
  chartType = 0;
  doAnimation = false;
  networkType = 6;
  DeselectAllBN();
  unifiedCancerType = "CRC";
  $("body").css("cursor", "progress");
  createBigKeggNetwork(unifiedCancerType);
  $("body").css("cursor", "default");
});

$('#ShowMain4Network').click( function() {
  chartType = 0;
  doAnimation = false;
  networkType = 6;
  DeselectAllBN();
  unifiedCancerType = "MAIN4";
  $("body").css("cursor", "progress");
  createBigKeggNetwork(unifiedCancerType);
  $("body").css("cursor", "default");
});

$('#ShowMapkNetwork').click( function() {
  chartType = 0;
  doAnimation = false;
  networkType = 6;
  DeselectAllBN();
  unifiedCancerType = "MAPK";
  $("body").css("cursor", "progress");
  createBigKeggNetwork(unifiedCancerType);
  $("body").css("cursor", "default");
});


$('#DoSimulation').click( function() {
  if (networkType == 6) {
    performSimulation();
    var simulationWin = window.open();
    simulationWin.document.write(allSimulationTexts);
    simulationWin.document.title = 'Simulation Output';
  }
});

$('#DetectFeedbackLoops').click( function() {
  if (networkType == 6) {
    detectFeedbackLoops();
    var loopWin = window.open();
    loopWin.document.write(allLoopTexts);
    loopWin.document.title = 'Feedback Loops';
  }
});


$('#DetectHubNodes').click( function() {
  if (networkType == 6) {
    detectHubNodes();
    var hubWin = window.open();
    hubWin.document.write(allHubTexts);
    hubWin.document.title = 'Hub Nodes';
  }
});


$('#SortNodes').click( function() {
  if (networkType == 6) {
    sortNodes();
    var sortWin = window.open();
    sortWin.document.write(allSortedNodeTexts);
    sortWin.document.title = 'Sorted Nodes';
  }
});


$('#ComputeCentralityMetrics').click( function() {

});

$('#GetShortestPath').click( function() {
  if (networkType == 6) {
    shortestPath();
    var pathWin = window.open();
    pathWin.document.write(allPathTexts);
    pathWin.document.title = 'Shortest Path';
  }
});

$('#GetLongestPath').click( function() {
  if (networkType == 6) {
    longestPath();
    var pathWin = window.open();
    pathWin.document.write(allPathTexts);
    pathWin.document.title = 'Longest Path';
  }
});

$('#GetAllPaths').click( function() {
  if (networkType == 6) {
    allPaths();
    var pathWin = window.open();
    pathWin.document.write(allPathTexts);
    pathWin.document.title = 'All Path';
  }
});

$('#Back').click( function() {
  doAnimation = false;
  goBack()();
});

$('#getExamples').click( function() {
  window.location = 'examples.zip';
});


function resetGraphics()
{
  d3.select("svg").remove();
  zoomer = d3.behavior.zoom().on("zoom", redraw);
  zoomer.translate([0, 0]).scale(1);

  svg = d3.select("#chart")
          .append("svg:svg");

  svg.attr("width", w)
     .attr("height", h)
     .attr("pointer-events", "all");

  vis = svg.append('svg:g')
           .call(zoomer)
           .append('svg:g')
           .attr("id", "svg-container");
}


function goBack()
{
  if (networkType == 1 || networkType == 2 || networkType == 5) return;
  if (prevKeggFileName.length == 0) return;
  var idx = prevKeggFileName.length - 1;
  currKeggFileName = prevKeggFileName[idx];
  prevKeggFileName.splice(idx, 1);
  loadKeggJSON(currKeggFileName);
}

function showDetail(d)
{
  if (networkType == 1 || networkType == 2 || networkType == 5) return;
  if (d.type == "map") {
    var mapName = d.name;
    var idx = prevKeggFileName.length;
    prevKeggFileName[idx] = currKeggFileName;
    currKeggFileName = mapName.substr(5) + ".json";
    loadKeggJSON(currKeggFileName);
  }
}

function showNetwork()
{
  if (networkType == 1) {
    loadCustomNetwork();
  }
  else if (networkType == 2 || networkType == 5) {
    loadPpiJSON();
  }
  else if (networkType == 3 || networkType == 4) {
    loadKeggJSON(currKeggFileName);
  }
  else if (networkType == 6) {
    createBigKeggNetwork(unifiedCancerType);
  }
}

