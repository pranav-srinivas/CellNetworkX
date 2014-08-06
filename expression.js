var myExpressions = {};

function loadExpressionData(fileName)
{
    if (fileName == "") {
	console.log("No expression data file provided");
	return;
    }

    loadExpressionTxt(fileName);
}

function loadExpressionTxt(fileName)
{
    d3.text(fileName, function(text) {
	   var lines = d3.csv.parseRows(text).map(function(row) { 
		   return row;
	   });
	   delete myNodes;
           myNodes = {};

           var line = lines[0][0];
	   var genes = line.split(/\s+/g);

	   for (var i = 0; i < genes.length; i++) {
	       myNodes[genes[i]] = 1;
	   }
	   
	   delete myExpressions;
	   myExpressions = {};

	   for (var i = 1; i < lines.length; i++) {
	       var line = lines[i][0];
	       var expr = line .split(/\s+/g);
	       myExpressions[i-1] = expr;
	   }
     });  
}


