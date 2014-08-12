var myProteins = [];
var myExpressions = [];
var numberOfSeries = 0;
var numberOfDataPoint = 0;
var minExprValue = 0;
var maxExprValue = 0;
var avgExprValue = 0;


function resetExpressions()
{
  delete myExpressions;
  myExpressions = [];
  minExprValue = 0;
  maxExprValue = 0;
  avgExprValue = 0;
  delete myProteins;
  myProteins = [];

  delete myNodes;
  myNodes = {};
}


function computeMinMaxExprValue()
{
  minExprValue = myExpressions[0][0];
  maxExprValue = myExpressions[0][0];
  var sum = 0;

  for (var i = 0; i < numberOfSeries; ++i) {
    for (var j = 0; j < numberOfDataPoint; ++j) {
	sum = myExpressions[i][j] + sum;
      if (myExpressions[i][j] < minExprValue) {
        minExprValue = myExpressions[i][j];
      }
      if (myExpressions[i][j] > maxExprValue) {
        maxExprValue = myExpressions[i][j];
      }
    }
  }
  avgExprValue = sum / (numberOfSeries * numberOfDataPoint);
}


function loadExpressionCSV(fileName)
{
  d3.csv(fileName, function(lines) {

    resetExpressions();

    var line  = d3.entries(lines[0]);
    for (var i = 0; i < line.length; i++) {
      var key = line[i].key;
      myNodes[key] = 1;
      myProteins[i] = key;
    }

    for (var i = 0; i < lines.length; i++) {
      var expr = d3.entries(lines[i]);
      var exprData = [];
      for (var j = 0; j < expr.length; j++) {
        exprData[j] = parseFloat(expr[j].value);
      }
      myExpressions[i] = exprData;
    }

    numberOfSeries = myExpressions.length;
    numberOfDataPoint = myExpressions[0].length;

    computeMinMaxExprValue();
  });
}


function loadExpressionTxt(fileName)
{
  d3.text(fileName, function(text) {
    var lines = d3.csv.parseRows(text).map(function(row) {
      return row;
    });

    resetExpressions();

    var line  = lines[0][0];
    var genes = line.split(/\s+/g);

    for (var i = 0; i < genes.length; i++) {
      myNodes[genes[i]] = 1;
      myProteins[i] = genes[i];
    }

    for (var i = 1; i < lines.length; i++) {
      var line  = lines[i][0];
      var expr  = line.split(/\s+/g);

      // expr is array of float strings; convert to array of floats
      var exprData = [];
      for (var j = 0; j < expr.length; j++) {
        exprData[j] = parseFloat(expr[j]);
      }

      myExpressions[i-1] = exprData;
    }

    numberOfSeries = myExpressions.length;
    numberOfDataPoint = myExpressions[0].length;

    computeMinMaxExprValue();
  });
}

function loadExpressionData(fileName)
{
  if (fileName == "") {
    console.log("No expression data file provided");
    return;
  }

  var extension = fileName.split('.').pop();

  if (extension == "txt" || extension == "expr" || extension == "tsv") {
    loadExpressionTxt(fileName);
  }
  else if (extension == "csv") {
    loadExpressionCSV(fileName);
  }
  else {
    console.log("Unsupported expression data file extension");
  }
}

