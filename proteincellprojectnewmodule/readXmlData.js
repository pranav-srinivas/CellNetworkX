// Start function when DOM has completely loaded 
$(document).ready(function()
{ 
   var label_val = 1;
   var id_value = 0;
   var pro_name = 'A';
   $("#selectedProteinsValue").val(id_value);
   $("#selectedProteinsName").val(pro_name);
   
   readXmlCreateBubbels(label_val, id_value, pro_name);
});

function selectRespectProtines(id_value, pro_name)
{
   //$("#sliderShowDiv").show();
   $("#selectedProteinsValue").val(id_value);
   $("#selectedProteinsName").val(pro_name);
   
    // Reset SVG
	$("#svcDiv").html('');
	$("#svcDiv").append('');
    
    var id_value_hf = $.trim($("#selectedProteinsValue").val());
    var pro_name_hf = $.trim($("#selectedProteinsName").val());
    if( (id_value != '') && (pro_name!=''))
    {
      
      var label_val = 1;
      readXmlCreateBubbels(label_val, id_value_hf, pro_name_hf);  
    }
    else
    {
       var label_val = 1;
       readXmlCreateBubbels(label_val, id_value, pro_name);   
    }
    
}

function destroExistSVC(slider_scroll_value)
{
    // Reset SVG
	$("#svcDiv").html('');
	$("#svcDiv").append('');
    
    var id_value = $.trim($("#selectedProteinsValue").val());
    var pro_name = $.trim($("#selectedProteinsName").val());
    readXmlCreateBubbels(slider_scroll_value, id_value, pro_name);
}

function readXmlCreateBubbels(label_val, selectedProteinsIndex, proteinsRespectName)
{
    
       //var proteinsRespectName = $.trim($("#selectedProteinsName").val());
       var proteinsValueArray = [];
       
       var xmlMainData = '<proteins><label1><proteinspart><name proteins="A" >A</name><value proteins="A" >1</value></proteinspart><proteinspart><name proteins="B" >B</name><value proteins="B">3</value></proteinspart> <proteinspart><name proteins="C" >C</name><value proteins="C" >5</value></proteinspart> <proteinspart><name proteins="D" >D</name><value proteins="D" >4</value></proteinspart> </label1><label2><proteinspart><name proteins="A" >A</name><value proteins="A" >3</value></proteinspart><proteinspart><name proteins="B" >B</name><value proteins="B" >4</value></proteinspart> <proteinspart><name proteins="C" >C</name><value proteins="C" >1</value></proteinspart> <proteinspart><name proteins="D" >D</name><value proteins="D" >2</value></proteinspart> </label2><label3><proteinspart><name proteins="A" >A</name><value proteins="A" >2</value></proteinspart><proteinspart><name proteins="B" >B</name><value proteins="B" >1</value></proteinspart> <proteinspart><name proteins="C" >C</name><value proteins="C" >4</value></proteinspart><proteinspart><name proteins="D" >D</name><value proteins="D" >5</value></proteinspart> </label3><label4><proteinspart><name proteins="A" >A</name><value proteins="A" >4</value></proteinspart><proteinspart><name proteins="B" >B</name><value proteins="B" >5</value></proteinspart><proteinspart><name proteins="C" >C</name><value proteins="C" >2</value></proteinspart> <proteinspart><name proteins="D" >D</name><value proteins="D" >3</value></proteinspart></label4><label5><proteinspart><name proteins="A" >A</name><value proteins="A" >5</value></proteinspart><proteinspart><name proteins="B" >B</name><value proteins="B" >2</value></proteinspart> <proteinspart><name proteins="C" >C</name><value proteins="C" >4</value></proteinspart> <proteinspart><name proteins="D" >D</name><value proteins="D" >5</value></proteinspart></label5></proteins>',
       xmlParsed = $.parseXML(xmlMainData),
       $xml = $(xmlParsed);
       
       $($xml.find('value[proteins="' + proteinsRespectName + '"]')).each(function(p)
       {
          	proteins_value = $(this).text();
            proteinsValueArray.push(proteins_value);
            // console.log("Proteins Value = "+proteins_value);
       });
        
        // Get unique element of proteins value array. 
        var proteinsArrayUnique = proteinsValueArray.filter(function(itm,i,proteinsValueArray){
            return i == proteinsValueArray.indexOf(itm);
        });

       //console.log("Proteins Origenal Array = "+proteinsValueArray);
       //console.log("Proteins Unique Array = "+proteinsArrayUnique);
       var proteinsArrayLength = (proteinsArrayUnique.length);
      //  var shortProteinsArray = proteinsArrayUnique.sort(); 
       var shortProteinsArray = proteinsArrayUnique;
       /**
           var proteins_min_val = shortProteinsArray[0];
           var proteins_max_val_index = (proteinsArrayLength - 1);
           var proteins_max_val = shortProteinsArray[proteins_max_val_index]
       */
       
       var proteins_min_val = Math.min.apply(Math,shortProteinsArray); 
       var proteins_max_val = Math.max.apply(Math,shortProteinsArray); 
       
       //console.log("Proteins "+proteinsRespectName+" Unique Array Min Value = "+proteins_min_val+", Max Value = "+proteins_max_val);
       
       $('.slider-bar').attr('min', proteins_min_val).attr('max', proteins_max_val).attr('value', proteins_min_val); // Assign Min and Max value to Dynamic slider.
       if(proteinsArrayLength == 5){ var sliderDynamicMargin = 90;}
       if(proteinsArrayLength == 4){ var sliderDynamicMargin = 120;}
       else{var sliderDynamicMargin = 90;}
      
        var dynamicSlider = ''; // Create dynamic slider.
        for(pl=0; pl<proteinsArrayLength; pl++)
        {
            dynamicSlider += '<span style="margin-right:'+sliderDynamicMargin+'px;margin-top: 20px;" id="range'+pl+'">'+shortProteinsArray[pl]+'</span>';
        } 
        
        $("#appendDynamicSlide").html(dynamicSlider);
        //console.log(dynamicSlider);

       var XmlToJsonData = []; // Define Json data array.

		// Run the function for each proteinspart tag in the XML file
        var xml_label = 'label'+label_val+' > proteinspart';
  
		$(xml_label,xmlParsed).each(function(i) 
        {
			proteins_name = $(this).find("name").text();
			proteins_value = $(this).find("value").text();
            // console.log("Proteins Details : Name = "+proteins_name+" Value = "+proteins_value);
            
            item = {}
			item ["name"] = proteins_name;
			item ["size"] = proteins_value;
			XmlToJsonData.push(item);
            
		});
        
          var JsonXmlStringComplete = {"children": XmlToJsonData}; // Complete dynamic json.
		  var JsonXmlString = JSON.stringify(JsonXmlStringComplete); // Convert json in to string.
		  // console.log("JSON Data After Reading XML File = " +JsonXmlString); // Dynamic json in string formate.
	
        // This will calculate height and weight for body.
        var diameter = 200,  // Overall dimater.
            format = d3.format(",d"),
            //color = d3.scale.category20c(); // For Static Bubbles Color.
            color = ''; // For Dynamic Bubbles Color.
            // console.log("Init Formate = "+format);
        
        // This used for bubbles layouts.
        var bubble = d3.layout.pack()
            .sort(null)
            .size([diameter, diameter])
            .padding(20); // padding betweens bubbles.
        
        // This will calculate height and width according to diameter.
        var svg = d3.select("#svcDiv").append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("class", "bubble");
        
        // This will set colours for Bubbles.
        var setColor = function(radious) 
        {
    		if (radious < 1) return "#846868";
    		if (radious < 2) return "#839096";
    		if (radious < 3) return "#FF3300";
    		if (radious < 4) return "#576c93";
    		if (radious < 5) return "#434f7b";
    		if (radious < 6) return "#ca4c4d";
    		if (radious < 7) return "#e3b333";
    		if (radious < 8) return "#398eb5";
    		if (radious < 9) return "#f2184b";
    		if (radious < 10) return "#6d6d6d";
    		if (radious < 11) return "#ffa500";
    		if (radious < 12) return "#ff77aa";
    		if (radious < 13) return "#731d1d";
    		if (radious < 14) return "#a5682a";
    		if (radious < 15) return "#ffc0cb";
    		if (radious < 16) return "#646464";
    		if (radious < 17) return "#800000";
    		if (radious < 18) return "#e2c9b9";
    		if (radious < 19) return "#ff7920";
    		if (radious < 20) return "#4b9484";
    		if (radious < 21) return "#576c93";
    		if (radious < 22) return "#898c66";
    		if (radious < 23) return "#434f7b";
    		if (radious < 24) return "#CC6699";
    		if (radious < 25) return "#E4C1C1";
    		if (radious < 26) return "#846868";
    		if (radious < 27) return "#839096";
    		if (radious < 28) return "#FF3300";
    		if (radious < 29) return "#576c93";
    		if (radious < 30) return "#434f7b";
    		if (radious < 31) return "#ca4c4d";
    		if (radious < 32) return "#e3b333";
    		if (radious < 33) return "#398eb5";
    		if (radious < 34) return "#f2184b";
    		if (radious < 35) return "#6d6d6d";
    		if (radious < 36) return "#ffa500";
    		if (radious < 37) return "#ff77aa";
    		if (radious < 38) return "#731d1d";
    		if (radious < 39) return "#a5682a";
    		if (radious < 40) return "#663300";
    		if (radious < 41) return "#ffc0cb";
    		if (radious < 42) return "#646464";
    		if (radious < 43) return "#800000";
    		if (radious < 44) return "#e2c9b9";
    		if (radious < 45) return "#ff7920";
    		if (radious < 46) return "#4b9484";
    		if (radious < 47) return "#576c93";
    		if (radious < 48) return "#898c66";
    		if (radious < 49) return "#434f7b";
    		if (radious < 50) return "#CC6699";
    		if (radious < 51) return "#E4C1C1";
    		if (radious < 52) return "#846868";
    		if (radious < 53) return "#839096";
    		if (radious < 54) return "#FF3300";
    		if (radious < 55) return "#576c93";
    		if (radious < 56) return "#434f7b";
    		if (radious < 57) return "#ca4c4d";
    		if (radious < 58) return "#e3b333";
    		if (radious < 59) return "#398eb5";
    		if (radious < 60) return "#f2184b";
    		if (radious < 61) return "#6d6d6d";
    		if (radious < 62) return "#ffa500";
    		if (radious < 63) return "#ff77aa";
    		if (radious < 64) return "#731d1d";
    		if (radious < 65) return "#a5682a";
    		if (radious < 66) return "#ffc0cb";
    		if (radious < 67) return "#646464";
    		if (radious < 68) return "#800000";
    		if (radious < 69) return "#e2c9b9";
    		if (radious < 70) return "#ff7920";
    		if (radious < 71) return "#4b9484";
    		if (radious < 72) return "#576c93";
    		if (radious < 73) return "#898c66";
    		if (radious < 74) return "#434f7b";
    		if (radious < 75) return "#CC6699";
    		if (radious < 76) return "#E4C1C1";
    		if (radious < 77) return "#846868";
    		if (radious < 78) return "#839096";
    		if (radious < 79) return "#FF3300";
    		if (radious < 80) return "#576c93";
    		if (radious < 81) return "#434f7b";
    		if (radious < 82) return "#ca4c4d";
    		if (radious < 83) return "#e3b333";
    		if (radious < 84) return "#398eb5";
    		if (radious < 85) return "#f2184b";
    		if (radious < 86) return "#6d6d6d";
    		if (radious < 87) return "#ffa500";
    		if (radious < 88) return "#ff77aa";
    		if (radious < 89) return "#731d1d";
    		if (radious < 90) return "#a5682a";
    		if (radious < 91) return "#ffc0cb";
    		if (radious < 92) return "#646464";
    		if (radious < 93) return "#800000";
    		if (radious < 94) return "#e2c9b9";
    		if (radious < 95) return "#ff7920";
    		if (radious < 96) return "#4b9484";
    		if (radious < 97) return "#576c93";
    		if (radious < 98) return "#898c66";
    		if (radious < 99) return "#434f7b";
    		if (radious < 100) return "#FDD7E4";
    		return "#B7161E";
    	};

		// Calculation for respective proteins.
		var parseMainJsonData = JSON.parse(JsonXmlString);
        
		// calculate json data size.
		var mainCount = Object.keys(parseMainJsonData.children).length

		var respectiveDesign = '';
		for(j=0;j<mainCount;j++)
		{
			var mainProteinName = parseMainJsonData.children[j].name;
			var mainProteinValue = parseMainJsonData.children[j].size;
			
			if(mainProteinName != '') // For radio button to select proteins.
			{
                 //var selectedProteinsIndex  = $("#selectedProteinsValue").val();
                 // console.log("Selected Index = "+selectedProteinsIndex);
                 if(selectedProteinsIndex == j){ var selectProteinsStyle = 'checked = "checked"'; }
                 else { var selectProteinsStyle = ''; }
                 
                 respectiveDesign += '<span style="display:inline;"><input type="radio" name="respectratioradio" id="respectratioradio'+j+'" '+selectProteinsStyle+' value="'+mainProteinName+'" onclick="selectRespectProtines('+j+',\''+mainProteinName+'\')">'+mainProteinName+'</span>&nbsp;&nbsp;&nbsp;';
			}
		}
        
		var completeRespectiveDesign = '<b><br/><br/>Select Proteins : </b><br/>'+respectiveDesign;
		$("#respectProteinsShowDiv").html(completeRespectiveDesign);
	
        /*
          Read JSON data and it will create nodes as well as details related to the nodes.
        */
        //d3.json("dynamic.json", function(error, root) // It will take json data from http request (Start).
    	console.log("FINAL JSON DATA TO DRAW BUBBELS = " +JsonXmlString); // Dynamic json in string formate.
        root = JSON.parse(JsonXmlString); // It will take json data from json data array string (Start).
        if(root)
        {
             // Calculate translate co-ordinate. 
             var node = svg.selectAll(".node")
                  .data(bubble.nodes(classes(root))
                  .filter(function(d) { return !d.children; }))
                  .enter().append("g") // To add tab (<g> </g>).
                  .attr("class", "node") // To add class node in <g> tag (<g class="node"> </g>).
                  .attr("transform", function(d) { 
                      //console.log("Translate Cordinate X = "+d.x+", Translate Cordinate Y = "+d.y); 
                      return "translate(" + d.x + "," + d.y + ")";  
                   });
              
              // set title to circle.
              node.append("title")
                   .text(function(d){ 
                       //console.log("Main Name = "+d.className+", Formate Value = "+d.value);
                       return "Protine Name : "+d.className+', Protine Size : '+d.value;
                   });
                
              // create circle.   
              node.append("circle")
                  .attr("r", function(d) {
                     // console.log("Radious = "+d.r);
                     return d.r; // For Dynamic Bubbles Color.
    				})
                    
                   // set the colour to circle.
                  .style("fill", function(d) { 
                     //console.log("Color = "+d.packageName);
                     //console.log("Color = "+color(d.packageName));
                     return setColor(d.r); // For Dynamic Bubbles Color.
                    });
        
              // set text to circle as well as break string according to radious.
              node.append("text")
                  .attr("dy", ".3em")
                  .style("text-anchor", "middle")
                  .text(function(d) { return d.className.substring(0, d.r / 3); });
                  
        //}); // It will take json data from http request (End).
        } // It will take json data from json data array string (End).
        
        // Returns a flattened hierarchy containing all leaf nodes under the root.
        function classes(root) 
        {
              var classes = [];
              function recurse(name, node) 
              {
                //console.log(node);
                if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
                else classes.push({packageName: name, className: node.name, value: node.size});
              }
            
              recurse(null, root);
              return {children: classes};
        }
        
        d3.select(self.frameElement).style("height", diameter + "px");
        
}
	 