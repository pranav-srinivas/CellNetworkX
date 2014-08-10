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
  vis.attr("transform",
      "translate(" + d3.event.translate + ")"
      + " scale(" + d3.event.scale + ")");
}

var names = [[05223, "Non-small cell lung cancer"], [05222, "Small cell lung cancer"],
            [05221, "Acute myeloid leukemia"], [05220, "Chronic myeloid leukemia"],
            [05219, "Bladder cancer"], [05218, "Melanoma"], [05217, "Basal cell carcinoma"],
            [05216, "Thyroid cancer"], [05215, "Prostate cancer"], [05214, "Glioma"],
            [05213, "Endometrial cancer"], [05212, "Pancreatic cancer"],
            [05211, "Renal cell carcinoma"], [05210, "Colorectal cancer"],
            [05200, "Pathways in cancer"], [05010, "Alzheimer's disease"],
            [04920, "Adipocytokine signaling pathway"], [04916, "Melanogenesis"],
            [04910, "Insulin signaling pathway"], [04662, "B cell receptor signaling pathway"],
            [04630, "Jak-STAT signaling pathway"], [04620, "Toll-like receptor signaling pathway"],
            [04520, "Adherens junction"], [04510, "Focal adhesion"], [04370, "VEGF signaling pathway"],
            [04350, "TGF-beta signaling pathway"], [04340, "Hedgehog signaling pathway"],
            [04310, "Wnt signaling pathway"], [04210, "Apoptosis"], [04151, "PI3K-Akt signaling pathway"],
            [04150, "mTOR signaling pathway"], [04120, "Ubiquitin mediated proteolysis"],
            [04115, "p53 signaling pathway"], [04110, "Cell cycle"], [04070, "Phosphatidylinositol signaling system"],
            [04068, "Fox0 signaling pathway"], [04066, "HIF-1 signaling pathway"],
            [04064, "NF-kappa B signaling pathway"], [04062, "Chemokine signaling pathway"],
            [04060, "Cytokine-cytokine receptor interaction"], [04020, "Calcium signaling pathway"],
            [04012, "ErbB signaling pathway"], [04010, "MAPK signaling pathway"],
            [03320, "PPAR signaling pathway"], [00020, "Citrate cycle (TCA cycle)"],
            [00010, "Glycolysis / Gluconeogenesis"]];

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
  goBack();
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



/**

function search(){
  var mapName = $('#form');
  console.log($_POST['search']);
  console.log("hi");

  var number;
  names.forEach(function(d){
    console.log(d[0]);
    if (d[1] == mapName){
      number = d[0];
    }
  });
  var idx = prevFileName.length;
  prevFileName[idx] = currFileName;
  currFileName = "hsa" + number + ".json";
  loadKeggJSON(currFileName);

}
*/

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

