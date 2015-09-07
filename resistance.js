var currentDrugIdx  = [];

var differentialTF = [];
var bypassResistance = [];
var resistanceTexts = "";
var currentResistanceTF = null;

var ERLOTINIB      =  { 
                        generic_name : "Erlotinib",
                        brand_name   : "Tarceva",
                        action       : "EGFR  Inhibitor",
                        inhibit      : ["EGFR"],
                        activate     : []
                      }

var LAPATINIB      =  {
                        generic_name : "Lapatinib",
                        brand_name   : "Tykerb",
                        action       : "EGFR and HER2 Inhibitor",
                        inhibit      : ["EGFR", "ERBB2"],
                        activate     : []
                      }

var PHA665752      =  {
                        generic_name : "PHA-665752",
                        brand_name   : "PHA-665752",
                        action       : "c-MET Inhibitor",
                        inhibit      : ["MET"],
                        activate     : []
                      }

var CRIZOTINIB     =  {
                        generic_name : "Crizotinib",
                        brand_name   : "PF-2341066",
                        action       : "c-MET and ALK Inhibitor",
                        inhibit      : ["MET", "ALK"],
                        activate     : []
                      }

var TAE684         =  {
                        generic_name : "TAE684",
                        brand_name   : "TAE684",
                        action       : "ALK Inhibitor",
                        inhibit      : ["ALK"],
                        activate     : []
                      }

var VANDETANIB     =  {
                        generic_name : "Vandetanib",
                        brand_name   : "Zactima",
                        action       : "Multi-kinase inhibitor",
                        inhibit      : ["ABL1", "EGFR", "FLT3", "KIT", "RET", "FLT1", "KDR", "FLT4"],
                        activate     : []
                      }

var NILOTINIB      =  {
                        generic_name : "Nilotinib",
                        brand_name   : "Tasigna",
                        action       : "Abl Inhibitor",
                        inhibit      : ["ABL1", "BCR"],
                        activate     : []
                      }

var SARACATINIB    =  {
                        generic_name : "Saracatinib",
                        brand_name   : "AZD0530",
                        action       : "Src and Abl inhibitor",
                        inhibit      : ["SRC", "ABL1", "BCR", "EGFR"],
                        activate     : []
                      }

var SORAFENIB      =  {
                        generic_name : "Sorafenib",
                        brand_name   : "Nexavar",
                        action       : "Multi-kinase inhibitor",
                        inhibit      : ["FLT3", "KIT", "PDGFRB", "RET", "BRAF", "RAF1", "FLT1", "KDR", "FLT4"],
                        activate     : []
                      }

var DOVITINIB      =  {
                        generic_name : "Dovitinib",
                        brand_name   : "TKI258",
                        action       : "Multi-kinase inhibitor",
                        inhibit      : ["EGFR", "FGFR1", "PDGFRB", "FLT1", "KDR"],
                        activate     : []
                      }

var PD0332991      =  {
                        generic_name : "PD-0332991",
                        brand_name   : "PD-0332991",
                        action       : "CDK4/6 Inhibitor",
                        inhibit      : ["CDK4", "CDK6"],
                        activate     : []
                      }

var AEW541         =  {
                        generic_name : "AEW541",
                        brand_name   : "AEW541",
                        action       : "IGF-1R Inhibitor",
                        inhibit      : ["IGF1R"],
                        activate     : []
                      }

var RAF265         =  {
                        generic_name : "RAF265",
                        brand_name   : "RAF265",
                        action       : "Raf kinase B and KDR Inhibitor",
                        inhibit      : ["BRAF", "KDR"],
                        activate     : []
                      }

var PLX4720        =  {
                        generic_name : "PLX4720",
                        brand_name   : "PLX4720",
                        action       : "Raf kinase B Inhibitor",
                        inhibit      : ["BRAF"],
                        activate     : []
                      }


var PD0325901      =  {
                        generic_name : "PD-0325901",
                        brand_name   : "PD-0325901",
                        action       : "MEK1 and MEK2 Inhibitor",
                        notes        : "Discontinued",
                        inhibit      : ["MAP2K1", "MAP2K2"],
                        activate     : []
                      }

var SELUMETINIB    =  {
                        generic_name : "Selumetinib",
                        brand_name   : "AZD6244",
                        action       : "MEK1 and MEK2 Inhibitor",
                        inhibit      : ["MAP2K1", "MAP2K2"],
                        activate     : []
                      }

var NUTLIN3        =  {
                        generic_name : "Nutlin-3",
                        brand_name   : "Nutlin-3",
                        action       : "MDM2 Inhibitor",
                        inhibit      : ["MDM2"],
                        activate     : []
                      }

var LBW242         =  {
                        generic_name : "LBW242",
                        brand_name   : "LBW242",
                        action       : "Inhibitor of Apoptosis Proteins (IAP) Inhibitor",
                        inhibit      : ["XIAP", "BIRC2", "BIRC3", "BIRC5"],
                        activate     : []
                      }

var TANESPIMYCIN   =  {
                        generic_name : "Tanespimycin",
                        brand_name   : "17-AAG",
                        action       : "Heat Shock Protein 90 (hsp90) Inhibitor",
                        inhibit      : ["HSP90AA1", "HSP90AA2", "HSP90N", "HSP90AB1", "HSP90B1", "TRAP1"],
                        activate     : []
                      }

var L685458        =  {
                        generic_name : "L-685458",
                        brand_name   : "L-685458",
                        action       : "gamma-Secretase Inhibitor",
                        inhibit      : [""],
                        activate     : []
                      }

var PANOBINOSTAT   =  { 
                        generic_name : "Panobinostat",
                        brand_name   : "Faridak",
                        action       : "Histone Deacetylase (HDAC) Inhibitor",
                        inhibit      : ["HDAC1"],
                        activate     : []
                      }

var PACLITAXEL     =  {
                        generic_name : "Paclitaxel",
                        brand_name   : "Taxol",
                        action       : "Microtubule-Stabilizing Agents",
                        inhibit      : [],
                        activate     : ["TUBB"]
                      }

var IRINOTECAN     =  {
                        generic_name : "Irinotecan",
                        brand_name   : "Camptosar",
                        action       : "DNA Topoisomerase I Inhibitor",
                        inhibit      : ["TOP1"],
                        activate     : [""]
                      }

var TOPOTECAN      =  {
                        generic_name : "Topotecan",
                        brand_name   : "Hycamtin",
                        action       : "DNA Topoisomerase I Inhibitor",
                        inhibit      : ["TOP1"],
                        activate     : [""]
                      }

var Drugs = [
              ERLOTINIB,
              LAPATINIB,
              PHA665752,
              CRIZOTINIB,
              TAE684,
              VANDETANIB,
              NILOTINIB,
              SARACATINIB,
              SORAFENIB,
              DOVITINIB,
              PD0332991,
              AEW541,
              RAF265,
              PLX4720,
              SELUMETINIB,
              NUTLIN3,
              LBW242,
              PANOBINOSTAT
            ]


// Simulate all drugs action for specified tumor sample
function SimulateAllDrugs(sampleIdx)
{
  perturbationsNodes  = [];
  perturbationsValues = [];
  currentSampleIndex = sampleIdx;
  for (var drugIdx = 0; drugIdx < Drugs.length; drugIdx++) {
    performSimulation(drugIdx);
  }
}


// Simulate all samples
function SimulateAllSamples()
{
  var numSamples = sampleNames.length;
  for (var sampleIdx = 0; sampleIdx < numSamples; sampleIdx++) {
    SimulateAllDrugs(sampleIdx);
  }
}

var DEFAULT_RTAG = [ { pid : -500, sid : -500 } ]

function initializeAcquiredResistance()
{
  clearFlags();

  resistanceTexts = "";

  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if ('annotation' in n) {
      delete n.annotation;
    }
    n.annotation = [];

    if ('rtag' in n) {
      delete n.rtag;
    }
    n.rtag = [];

    if ('potentialPathways' in n) {
      delete n.potentialPathways;
    }
    n.potentialPathways = { };

    if ('resistanceTF' in n) {
      delete n.resistanceTF;
    }
    n.resistanceTF = [];
  }

  annotatePathwayNodes();

  differentialTF = [];
  delete bypassResistance;
  bypassResistance = [];

  currentResistanceTF = null;
}


function determinePotentialPathways(n)
{
  for (var k = 0; k < n.rtag.length; k++) {
    var tag = n.rtag[k];
    if (tag.pid < 0) continue;
    var p = AnalyzedPathways[tag.pid];
    if (tag.sid == p.through.length - 1) {
      n.potentialPathways[tag.pid] = true;
    }
  }
}


var tagEqual = function(s1, s2)
{
  return (s1.pid == s2.pid) && (s1.sid == s2.sid); 
}


function markFaninUnvisited(n)
{
  for (var i = 0; i < n.linkin.length; i++) {
    var link = n.linkin[i];
    if (link.isDisabled) continue;
    var fi   = link.source;
    if (fi != n) fi.visited = false;
  }
}


function addToRtag(n, tag)
{
  for (var i = 0; i < n.rtag.length; i++) {
    var s = n.rtag[i];
    if (tagEqual(s, tag)) {
      return;
    }
  }

  n.rtag[ n.rtag.length ] = tag;
  n.visited = false;

  markFaninUnvisited(n);
}


function addNewRtag(n, tag)
{
  var mutated = false;

  for (var i = 0; i < n.annotation.length; i++) {
    var ann = n.annotation[i];
    if (tag.pid == ann.pid || tag.pid < 0) {
      if (tag.sid == ann.sid + 1 || tag.sid < 0) {
        var nxtSgn = { pid : ann.pid, sid : ann.sid };
        addToRtag(n, nxtSgn);
        mutated = true;
      }
    }
  }

  if (mutated) return;
  addToRtag(n, tag);
}


function justify(n, v, l)
{
  n.visited = true;
  if (n.drugSource) return;

  if (n.inDegree == 0) {
    var linkName = getInteractionName(l);
    var acting_1 = (v == 1) && isActivating(linkName);
    var acting_0 = (v == 0) && isInhibiting(linkName);
    if (acting_1 || acting_0) {
      var beforeCount = (Object.keys(n.potentialPathways).length);
      determinePotentialPathways(n);
      var  afterCount = (Object.keys(n.potentialPathways).length);

      if (afterCount > 0 && beforeCount == 0) {
        bypassResistance[ bypassResistance.length ] = {node: n, val: v} ;
        n.resistanceTF[ n.resistanceTF.length ] = currentResistanceTF;
      }
      else if (afterCount > beforeCount && n.resistanceTF[ n.resistanceTF.length - 1 ] != currentResistanceTF) {
        n.resistanceTF[ n.resistanceTF.length ] = currentResistanceTF;
      }
    }
    return;
  }

  for (var i = 0; i < n.linkin.length; i++) {
    var link = n.linkin[i];
    var fi   = link.source;
    if (link.isDisabled || fi.isDisabled) continue;
    if (isLinkActive(link, currentSampleIndex)) {
      if (fi.visited == true) {
        continue;
      }
      var nextVal = getNextValue(v, link, fi);
      if (nextVal < 0) continue;
      for (var k = 0; k < n.rtag.length; k++) {
        var tag = n.rtag[k];
        if (hasAnnotation(fi)) {
          addNewRtag(fi, tag);
        }
        else {
          addToRtag(fi, tag);
        }
      }
      justify(fi, nextVal, link);
    }
  }
}


function simulateAcquiredResistance()
{
  initializeAcquiredResistance();

  for (var i = 0; i < TranscriptionFactors.length; i++) {
    var n = TranscriptionFactors[i];
    var lastVal = getLastNodeValue(n);
    if (lastVal < 0) continue;
    if (lastVal != n.Value[0]) {
      differentialTF[ differentialTF.length ]  = n;
      currentResistanceTF  = n;
      n.rtag = DEFAULT_RTAG;
      justify(n, n.Value[0], null);
    }
  }

  outputAcquiredResistance();
}


function outputResistanceHeader()
{
  resistanceTexts = "#####################" + "###" + "######" + "###" + "###############" + "<br>";
  resistanceTexts += "Tumor Sample: " + currentSampleIndex + ". " +  sampleNames[currentSampleIndex] + "<br>";
  resistanceTexts += "Acquired Resistance to Drug: ";
  resistanceTexts += addCurrentDrugName();
  resistanceTexts += "Bypass Resistance Source" + " : (Affected TFs)" + "<br>";
  resistanceTexts += "----------> Potential Pathways" + "<br>";
  resistanceTexts += "#####################" + "###" + "######" + "###" + "###############" + "<br>";
  resistanceTexts += " " + "<br>";
}


function outputAcquiredResistance()
{
  outputResistanceHeader();
  for (var i = 0; i < bypassResistance.length; i++) {
    var rp = bypassResistance[i];
    var  n = rp.node;
    var  v = rp.val ;
    resistanceTexts +=  getNodeName(n) + " (" + (v == 1 ? "Activation" : "Inhibition") + ") : ( ";
    for (var k = 0; k < n.resistanceTF.length; k++) {
      var tf = n.resistanceTF[k];
      resistanceTexts +=  getNodeName(tf) + " ";
    }
    resistanceTexts += ")<br>";

    var pid;
    for (pid in n.potentialPathways) {
      if (n.potentialPathways.hasOwnProperty(pid)) {
        var p = AnalyzedPathways[pid];
        resistanceTexts += "---------->" + p.name + " (" + p.description + ") " + "<br>";
      }
    }
    resistanceTexts += "<br>";
  }
}


var addCurrentDrugName = function()
{
  var texts = "";
  for (var k = 0; k < currentDrugIdx.length; k++) {
    var drugIdx = currentDrugIdx[k];
    var currentDrug = Drugs[drugIdx];
    texts += currentDrug.generic_name + "  (" + currentDrug.brand_name + ", " + currentDrug.action + ")" + " ; ";
  }
  texts += "<br>";
  return texts;
}
