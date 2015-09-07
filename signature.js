
var APOPTOSIS = {
                  name : "APOPTOSIS",
                  description : "Bad/Bim/Bid Bcl-2/Bcl-xL Bax/Bak Caspase-9 Caspase-3",
                  through : [ ["BAD", "BCL2L11", "BID"],
                              ["BCL2", "BCL2L1"],
                              ["BAX", "BAK1"],
                              ["CASP9"],
                              ["CASP3"]
                            ]
                }

var BMP_SMAD  = {
                  name : "BMP-SMAD",
                  description : "Bmpr-1/2 Smad-1/5/8",
                  through : [ ["BMPR1A", "BMPR2"],
                              ["SMAD1", "SMAD5"]
                            ]
                }

var ERK5     = { 
                 name  : "ERK5",
                 description : "Mek5 Erk5/Bmk1",
                 through : [ ["MAP2K5"],
                             ["MAPK7"]
                           ]
               }


var HEDGEHOG  = {
                  name  : "HEDGEHOG",
                  description : "Smo Gli",
                  through : [ ["SMO"],
                              ["GLI1", "GLI2", "GLI3"]
                            ]
                }

var HIPPO     = {
                  name  : "HIPPO",
                  description : "LATS2 YAP1",
                  through : [ ["LATS2"],
                              ["YAP1"]
                            ]
                }

var JAK_STAT = {
                 name  : "JAK-STAT",
                 description : "Jak Stat",
                 through : [ ["JAK1", "JAK2"],
                             ["STAT1", "STAT3", "STAT5A"]
                           ]
               }

var JNK      = {
                 name  : "JNK",
                 description : "Mkk-7/4 Jnk",
                 through : [ ["MAP2K7", "MAP2K4"],
                             ["MAPK8"]
                           ]
               }

var NF_KB    = {
                 name  : "NF-KB",
                 description : "Ikk-Alpha/Beta p50/p65",
                 through : [ ["CHUK", "IKBKB"],
                             ["NFKB1", "RELA"]
                           ]
               }

var NOTCH     = {
                  name  : "NOTCH",
                  description : "Notch1",
                  through : [ ["NOTCH1"],
                            ]
                }

var P38      = { 
                 name  : "P38",
                 description : "Mkk-3/6/4 p38",
                 through : [ ["MAP2K3", "MAP2K6", "MAP2K4"],
                             ["MAPK14"]
                           ]
               }

var P53       = {
                  name  : "P53",
                  description : "Mdm-2/4 p53",
                  through : [ ["MDM2", "MDM4"],
                              ["TP53"],
                            ]
                }

var PI3K_MTOR = {
                  name  : "PI3K-MTOR",
                  description : "PI3K Akt mTOR",
                  through : [ ["PIK3CA", "PIK3R5"],
                              ["AKT1", "AKT3"],
                              ["MTOR"]
                            ]
                }


var RAS_MAPK = { 
                 name  : "RAS-MAPK",
                 description : "Ras Raf Mek-1/2 Erk-1/2",
                 through : [ ["HRAS", "RRAS2", "MRAS", "KRAS", "RRAS"],
                             ["ARAF", "BRAF", "RAF1"],
                             ["MAP2K1", "MAP2K2"],
                             ["MAPK1", "MAPK3"]
                           ]
               }

var RAS_RAL   = {
                  name  : "RAS-RAL",
                  description : "Ras Rgl-1/2 Ral-A/B",
                  through : [ ["HRAS", "RRAS2", "MRAS", "KRAS", "RRAS"],
                              ["RGL1", "RGL2"],
                              ["RALA", "RALB"]
                            ]
                }

var TGFB_SMAD = {
                  name  : "TGFB-SMAD",
                  description : "TGFBR-1/2 Smad-2/3/4",
                  through : [ ["TGFBR1", "TGFBR2"],
                              ["SMAD2", "SMAD4"],
                            ]
                }


var WNT       = {
                  name  : "WNT",
                  description : "Gsk3B B-Catenin",
                  through : [ ["GSK3B"],
                              ["CTNNB1"]
                            ]
                }

var AnalyzedPathways = [
                         APOPTOSIS,
                         BMP_SMAD,
                         ERK5,
                         HEDGEHOG,
                         HIPPO,
                         JAK_STAT,
                         JNK,
                         NF_KB,
                         NOTCH,
                         P38,
                         P53,
                         PI3K_MTOR,
                         RAS_MAPK,
                         RAS_RAL,
                         TGFB_SMAD,
                         WNT,
                       ]
                         
var activePathwayTexts = "";

function annotate(n, pathwayIdx, stateIdx)
{
  if (('annotation' in n) == false) {
    n.annotation = [];
  }
  n.annotation[ n.annotation.length ] = { pid : pathwayIdx, sid : stateIdx };
}


function annotatePathwayNodes()
{
  for (var i = 0; i < AnalyzedPathways.length; i++) {
    var pathway = AnalyzedPathways[i];
    pathway.idx = i;

    for (var j = 0; j < pathway.through.length; j++) {
      var throughNames = pathway.through[j];

      for (var k = 0; k < throughNames.length; k++) {
        var thru = throughNames[k];
        var n = getNode(thru);
        if (n == null) continue;
        annotate(n, i, j);
      }
    }
  }
}

var hasAnnotation = function(n)
{
  if (('annotation' in n) && n.annotation.length > 0) {
    return true;
  }
  return false;
}

function initializePathwayAnalysis()
{
  clearFlags();
  activePathwayTexts = "";

  for (var i = 0; i < gNodes.length; i++) {
    var n = gNodes[i];
    if ('annotation' in n) {
      delete n.annotation;
    }
    n.annotation = [];

    if ('signature' in n) {
      delete n.signature;
    }
    n.signature = [];

    if ('activePathways' in n) {
      delete n.activePathways;
    }
    n.activePathways = { };
  }

  annotatePathwayNodes();
}

var DEFAULT_SIGNATURE = [ { pid : -100, sid : -100 } ]
var tumorActivePathways = { };

function computePathwaySignatures()
{
  initializePathwayAnalysis();

  for (var i = 0; i < primaryInputs.length; i++) {
    var n = primaryInputs[i];
    if (n.isTF) continue;
    n.signature = DEFAULT_SIGNATURE;
    propagateSignatureForward(n);
  }

  outputPathwayHeader();
  tumorActivePathways = { };

  for (var i = 0; i < TranscriptionFactors.length; i++) {
    var n = TranscriptionFactors[i];
    determineActivePathways(n); 
    outputActivePathways(n);
  }

  outputTumorWideActivePathways();
}


function outputTumorWideActivePathways()
{
  var pid;
  activePathwayTexts += "#####################" + "###" + "######" + "###" + "###############" + "<br>";
  activePathwayTexts += "All Tumor Pathways: " + "<br>";
  activePathwayTexts += "#####################" + "###" + "######" + "###" + "###############" + "<br>" + " " + "<br>";

  for (pid in tumorActivePathways) {
    if (tumorActivePathways.hasOwnProperty(pid)) {
      var p = AnalyzedPathways[pid];
      activePathwayTexts += "---------->" + p.name + " (" + p.description + ") " + "<br>";
    }
  }
  activePathwayTexts += "<br>";
}


function outputPathwayHeader()
{
  activePathwayTexts = "#####################" + "###" + "######" + "###" + "###############" + "<br>";
  activePathwayTexts += "Tumor Sample: " + currentSampleIndex + ". " +  sampleNames[currentSampleIndex] + "<br>";

  if (hasSimulationData && perturbationsNodes.length == 0) {
    activePathwayTexts += "Simulated Drug: " ;
    activePathwayTexts += addCurrentDrugName();
  }

  activePathwayTexts += "Transcription Factors" + " : " + "Status" + " : " + "Active Signaling Pathways" + "<br>";
  activePathwayTexts += "#####################" + "###" + "######" + "###" + "###############" + "<br>";
  activePathwayTexts += " " + "<br>";
}


function outputActivePathways(n)
{
  if (Object.keys(n.activePathways).length == 0) return;

  var pid;
  activePathwayTexts += getNodeName(n) + " : ";

  if (hasSimulationData) {
    activePathwayTexts += ( (getLastNodeValue(n) == 1) ? "Active" : "Inactive") + "<br>";
  }
  else {
    activePathwayTexts += (isNodeActive(n, currentSampleIndex) ? "Active" : "Inactive") + "<br>";
  }

  for (pid in n.activePathways) {
    if (n.activePathways.hasOwnProperty(pid)) {
      var p = AnalyzedPathways[pid];
      activePathwayTexts += "---------->" + p.name + " (" + p.description + ") " + "<br>";
    }
  }
  activePathwayTexts += "<br>";
}


function determineActivePathways(n)
{
  for (var k = 0; k < n.signature.length; k++) {
    var sgn = n.signature[k];
    if (sgn.pid < 0) continue;
    var p = AnalyzedPathways[sgn.pid];
    if (sgn.sid == p.through.length - 1) {
      n.activePathways[sgn.pid] = true;
      tumorActivePathways[sgn.pid] = true;
    }
  }
}


var signelEqual = function(s1, s2)
{
  return (s1.pid == s2.pid) && (s1.sid == s2.sid); 
}


function addNewSignature(n, sgn)
{
  var mutated = false;

  for (var i = 0; i < n.annotation.length; i++) {
    var ann = n.annotation[i];
    if (sgn.pid == ann.pid || sgn.pid < 0) {
      if (sgn.sid == ann.sid - 1 || sgn.sid < 0) {
        var nxtSgn = { pid : ann.pid, sid : ann.sid };
        addToSignature(n, nxtSgn);
        mutated = true;
      }
    }
  }

  if (mutated) return;
  addToSignature(n, sgn);
}


function markFanoutUnvisited(n)
{
  for (var i = 0; i < n.linkout.length; i++) {
    var link = n.linkout[i];
    var fo   = link.target;
    if (fo != n) fo.visited = false;
  }
}


function addToSignature(n, sgn)
{
  for (var i = 0; i < n.signature.length; i++) {
    var s = n.signature[i];
    if (signelEqual(s, sgn)) {
      return;
    }
  }

  n.signature[ n.signature.length ] = sgn;
  n.visited = false;

  markFanoutUnvisited(n);
}


function propagateSignatureForward(n)
{
  n.visited = true;

  for (var i = 0; i < n.linkout.length; i++) {
    var link = n.linkout[i];
    var fo   = link.target;
    if (link.isDisabled || fo.isDisabled) continue;
    if (isLinkActive(link, currentSampleIndex)) {
      if (fo.visited == true) {
        continue;
      }
      if (isLinkZerotoZero(link, currentSampleIndex)) {
        continue;
      }

      for (var k = 0; k < n.signature.length; k++) {
        var sgn = n.signature[k];
        if (hasAnnotation(fo)) {
          addNewSignature(fo, sgn);
        }
        else {
          addToSignature(fo, sgn);
        }
      }
      propagateSignatureForward(fo);
    }
  }
}


PathSignature = [

                ]
