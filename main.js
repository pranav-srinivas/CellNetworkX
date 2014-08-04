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


var currFileName = "kegg.json";
var prevFileName    = [ ];

var     expressionFileName = "";
var  customNetworkFileName = "";
var  backgroundPPIFileName = "BackgroundPPI.json";
var backgroundKEGGFileName = "KEGG.json";

var visiblePPIProteins = ["KRAS", "MTOR", "BRAF", "PTEN"];

var    fullNetworkPathName = "";
var fullExpressionPathName = "";

//----------------------------------------------------------
// Type of Network:   1: Custom Network
//                    2: PPI Background Network
//                    3: KEGG Background Network floating
//                    4: KEGG Background Network fixed 
//----------------------------------------------------------
var networkType = 2;
$("#PPI").addClass("activeBN");

var BNpressed = 0;

//----------------------------------------------------------
// Navigation Bar Processing
//----------------------------------------------------------

function DeselectAllBN()
{
    $("#PPI").removeClass("activeBN");
    $("#KBN1").removeClass("activeBN");
    $("#KBN2").removeClass("activeBN");
    $("#NONE").removeClass("activeBN");
}

$(document).ready(function() {
    $('#networkFile').change(function(evt) {
        fullNetworkPathName = ($(this).val());
        customNetworkFileName = fullNetworkPathName.split(/(\\|\/)/g).pop()
        networkType = 1;
	DeselectAllBN();
	$("#NONE").addClass("activeBN");
    });

    $('#expressionFile').change(function(evt) {
        fullExpressionPathName = ($(this).val());
        expressionFileName = fullExpressionPathName.split(/(\\|\/)/g).pop()
	loadExpressionData(expressionFileName);
    });

    $("a.dropdown-toggle").click(function(evt) {
	    if (BNpressed == 0) {
		$("a.dropdown-toggle").dropdown("toggle");
		BNpressed = 1;
	    }
	    else
		$("a.dropdown-toggle").dropdown();
    });

    $("ul.dropdown-menu a").click(function(evt) {
	    $("a.dropdown-toggle").dropdown();

	    DeselectAllBN();

	    var menuText = this.innerText;
	    if (menuText == "PPI Background Network") {
		networkType = 2;
		$("#PPI").addClass("activeBN");
	    }
	    else if (menuText == "KEGG Background Network 1") {
		networkType = 3;
		currFileName = backgroundKEGGFileName;
		$("#KBN1").addClass("activeBN");
	    }
	    else if (menuText == "KEGG Background Network 2") {
		networkType = 4;
		currFileName = backgroundKEGGFileName;
		$("#KBN2").addClass("activeBN");
	    }
	    else if (menuText == "No Background Network") {
		networkType = 1;
		$("#NONE").addClass("activeBN");
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
  showNetwork();
});

$('#Animation').click( function() {
  doAnimation();
});


$('#Back').click( function() {
  goBack()();
});

selectBackgroundNetwork = function(value)
{
    if (value == "PPI") {
      selectPPI();
    }
    else if (value == "KEGGfloating") {
      selectKEGGfloating();
    }
    else if (value == "KEGGfixed") {
      selectKEGGfixed();
    }
}

function selectPPI()
{
  networkType = 2;
}

function selectKEGGfloating()
{
  networkType = 3;
}

function selectKEGGfixed()
{
  networkType = 4;
}



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
  if (networkType == 1 || networkType == 2) return;
  if (prevFileName.length == 0) return;
  var idx = prevFileName.length - 1;
  currFileName = prevFileName[idx];
  prevFileName.splice(idx, 1);
  loadKeggJSON(currFileName);
}

function showDetail(d)
{
  if (networkType == 1 || networkType == 2) return;
  if (d.type == "map") {
    var mapName = d.name;
    var idx = prevFileName.length;
    prevFileName[idx] = currFileName;
    currFileName = mapName.substr(5) + ".json";
    loadKeggJSON(currFileName);
  }
}

function showNetwork()
{
  if (networkType == 1) {
    loadCustomNetwork(customNetworkFileName);
  }
  else if (networkType == 2) {
    loadPpiJSON(expressionFileName);
  }
  else if (networkType == 3 || networkType == 4) {
    loadKeggJSON(currFileName);
  }
}

