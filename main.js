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

var names = [["05223", "Non-small cell lung cancer"], ["05222", "Small cell lung cancer"],
            ["05221", "Acute myeloid leukemia"], ["05220", "Chronic myeloid leukemia"],
            ["05219", "Bladder cancer"], ["05218", "Melanoma"], ["05217", "Basal cell carcinoma"],
            ["05216", "Thyroid cancer"], ["05215", "Prostate cancer"], ["05214", "Glioma"],
            ["05213", "Endometrial cancer"], ["05212", "Pancreatic cancer"],
            ["05211", "Renal cell carcinoma"], ["05210", "Colorectal cancer"],
            ["05200", "Pathways in cancer"], ["05010", "Alzheimer's disease"],
            ["04920", "Adipocytokine signaling pathway"], ["04916", "Melanogenesis"],
            ["04910", "Insulin signaling pathway"], ["04662", "B cell receptor signaling pathway"],
            ["04630", "Jak-STAT signaling pathway"], ["04620", "Toll-like receptor signaling pathway"],
            ["04520", "Adherens junction"], ["04510", "Focal adhesion"], ["04370", "VEGF signaling pathway"],
            ["04350", "TGF-beta signaling pathway"], ["04340", "Hedgehog signaling pathway"],
            ["04310", "Wnt signaling pathway"], ["04210", "Apoptosis"], ["04151", "PI3K-Akt signaling pathway"],
            ["04150", "mTOR signaling pathway"], ["04120", "Ubiquitin mediated proteolysis"],
            ["04115", "p53 signaling pathway"], ["04110", "Cell cycle"], ["04070", "Phosphatidylinositol signaling system"],
            ["04068", "Fox0 signaling pathway"], ["04066", "HIF-1 signaling pathway"],
            ["04064", "NF-kappa B signaling pathway"], ["04062", "Chemokine signaling pathway"],
            ["04060", "Cytokine-cytokine receptor interaction"], ["04020", "Calcium signaling pathway"],
            ["04012", "ErbB signaling pathway"], ["04010", "MAPK signaling pathway"],
            ["03320", "PPAR signaling pathway"], ["00020", "Citrate cycle (TCA cycle)"],
            ["00010", "Glycolysis / Gluconeogenesis"]];

var     expressionFileName = "";
var  customNetworkFileName = "";
var  backgroundPPIFileName = "BackgroundPPI.json";
var backgroundKEGGFileName = "KEGG.json";

var currKeggFileName = backgroundKEGGFileName;
var prevKeggFileName    = [ ];

var visiblePPIProteins = ["KRAS", "MTOR", "BRAF", "PTEN"];

var    fullNetworkPathName = "";
var fullExpressionPathName = "";

//----------------------------------------------------------
// Type of Network:   1: Custom Network
//                    2: PPI Network
//                    3: KEGG Floating Network
//                    4: KEGG Fixed Network
//                    5: PPI Reduced Network
//----------------------------------------------------------
var networkType = 2;
$("#PPI1").addClass("activeBN");

var chartType = 0;

$("a.dropdown-toggle").dropdown();

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
    $('#networkFile').change(function(evt) {
        var f = evt.target.files[0];
        fullNetworkPathName = ($(this).val());
        customNetworkFileName = fullNetworkPathName.split(/(\\|\/)/g).pop()
        networkType = 1;
        DeselectAllBN();
        doAnimation = false;
        $("#NONE").addClass("activeBN");
    });

    $('#expressionFile').change(function(evt) {
        fullExpressionPathName = ($(this).val());
        expressionFileName = fullExpressionPathName.split(/(\\|\/)/g).pop()
        loadExpressionData(expressionFileName);
        doAnimation = false;
    });

    $("a.dropdown-toggle").click(function(evt) {
      $("a.dropdown-toggle").dropdown();
    });

    $("ul.dropdown-menu a").click(function(evt) {
      $("a.dropdown-toggle").dropdown();
      doAnimation = false;

      var menuText = this.innerText;

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
  showNetwork();
});

$('#Animation').click( function() {
  performAnimation();
});


$('#Back').click( function() {
  doAnimation = false;
  goBack()();
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
    loadCustomNetwork(customNetworkFileName);
  }
  else if (networkType == 2 || networkType == 5) {
    loadPpiJSON(expressionFileName);
  }
  else if (networkType == 3 || networkType == 4) {
    loadKeggJSON(currKeggFileName);
  }
}

