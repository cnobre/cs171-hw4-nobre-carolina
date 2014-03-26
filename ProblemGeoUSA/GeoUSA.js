/**
 * Created by hen on 3/8/14.
 */

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 1060 - margin.left - margin.right;
var height = 800 - margin.bottom - margin.top;

var bbVis = {
    x: 100,
    y: 10,
    w: width - 100,
    h: 300
};

var detailVis = d3.select("#detailVis").append("svg").attr({
    width:350,
    height:200
})

var tooltip = d3.select(".info_box")
	.style("visibility", "hidden")
	
var canvas = d3.select("#vis").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
    })

var svg = canvas.append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });
    
    svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);


var projection = d3.geo.albersUsa().translate([width / 2, height / 2]);//.precision(.1);
var path = d3.geo.path().projection(projection);

var has_data =false;
var dataSet = {};

//x and y scales for detail Vis
var x,y,xAxis,yAxis;

//radius scale for stations
var radius_scale;
 
//var for zoom functionality 
var centered;

	//Setting up axis and scales
    x = d3.scale.linear()
   	    .domain([0,23])
   	    .range([10, 280]);
   	    
	
	y = d3.scale.linear()
	   .range([180,0]);



var projection = d3.geo.albersUsa().translate([width / 2, height / 2]);
var path = d3.geo.path().projection(projection);

function loadStations() {
    d3.csv("../data/NSRDB_StationsMeta.csv",function(error,data){
        
        data.map(function(r)
        	{var info = dataset[r.USAF]; 
	        	if (info != undefined){
		        	r.sum = info.sum;
					r.hourly = info.hourly;	
	        	}
	        	else{
		        	r.sum = 0;
	        	}
        	
        	});
        
        
        var no_data = data.filter(function(d){return d.sum==0}); 
        var good_data = data.filter(function(d){return d.sum>0});
       
        svg.selectAll(".station")
	        .data(good_data)
			.enter().append("svg:circle")
			 .attr("class","station")
			 .attr("class","hasdata")
	         .attr("cx", function(d)
	         	{var screencoord = projection([+d["NSRDB_LON(dd)"],+d["NSRDB_LAT (dd)"]]);
	         	if (screencoord != null)
	         		return screencoord[0]
	         	else
	         		return 0	;})
	         .attr("cy", function(d)
	         	{var screencoord = projection([+d["NSRDB_LON(dd)"],+d["NSRDB_LAT (dd)"]]);
	         	if (screencoord != null)
	         		return screencoord[1]
	         	else
	         		return 0	
	         	})
	         .attr("r", function(r){ if (r.sum >0) {return radius_scale(r.sum)} else {return 2}}) 
	         .on("mouseover", function(d){
	         	tooltip.select("#name").text(d.STATION );
				tooltip.select('#sum').text(d.sum);return tooltip.style("visibility", "visible");})
			 .on("mousemove", function(d){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
			 .on("mouseout", function(d){return tooltip.style("visibility", "hidden");})
			 .on("click",function(d){updateDetailVis(d)});
      
	           
	             
	      svg.selectAll(".bad_station")
	        .data(no_data)
			.enter().append("svg:circle")
			 .attr("class","station")
	         .attr("cx", function(d)
	         	{var screencoord = projection([+d["NSRDB_LON(dd)"],+d["NSRDB_LAT (dd)"]]);
	         	if (screencoord != null)
	         		return screencoord[0]
	         	else
	         		return 0	;})
	         .attr("cy", function(d)
	         	{var screencoord = projection([+d["NSRDB_LON(dd)"],+d["NSRDB_LAT (dd)"]]);
	         	if (screencoord != null)
	         		return screencoord[1]
	         	else
	         		return 0	
	         	})
	         .attr("r", 2)       
	             })
	             
	            
	                       
}


function loadStats() {

    d3.json("../data/reducedMonthStationHour2003_2004.json", function(error,data){
        //completeDataSet= data;
		dataset = data;
		
		var all_sum = [];
		for (var key in data){	
			all_sum.push(data[key].sum);
		}
		
				
		//create radius scale
		radius_scale= d3.scale.linear()
		.domain(d3.extent(all_sum))
	    .range([1,10]);
	    
	   
        loadStations();
    })

}


d3.json("../data/us-named.json", function(error, data) {

var usMap = topojson.feature(data,data.objects.states).features
  
   svg.append("g")
      .attr("id", "states")
    .selectAll("path")
      .data(usMap)
    .enter().append("path")
      .attr("d", path)
      .on("click", clicked);

  svg.append("path")
      .datum(topojson.mesh(data, data.objects.states, function(a, b) { return a !== b; }))
      .attr("id", "state-borders")
      .attr("d", path);

    loadStats();
});


function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {

    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  svg.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  svg.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}



// ALL THESE FUNCTIONS are just a RECOMMENDATION !!!!
var createDetailVis = function(){

	   xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");
	
		yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("right");
	    
	    
	    
	    detailVis.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + 180 + ")")
            .call(xAxis.ticks(12));

        detailVis.append("g")
            .attr("class", "y axis")
            .attr("transform","translate(280,10)")
            .call(yAxis.ticks(10));
            
	    
	        
}


var updateDetailVis = function(data, name){
 
 var all_data = [];
		for (var key in data.hourly){	
			all_data.push(data.hourly[key]);
		}
		 
		y.domain(d3.extent(all_data));
		

if (has_data){

detailVis.selectAll("rect")
			   .data(all_data)
			   .transition()
              .duration(1000)
			   
			   .attr("y", function(d){return y(d)})
			   .attr("width", 10)
			   .attr("height", function(d) {
			   		return (180-y(d))
			   })
			   }
else
{
createDetailVis(); 
detailVis.selectAll("rect")
			   .data(all_data)
			   .enter()
			   .append("rect")
			   .transition()
              .duration(1000)
			   .attr("x", function(d, i) {
			   		return x(i) ;
			   })
			   .attr("y", function(d){  return y(d)})
			   .attr("width", 10)
			   .attr("height", function(d) {
			   		return (180 - y(d))
			   })

			   
			   has_data = true;
			   }
			   
			   //Update Y axis
                detailVis.select(".y.axis")
                    .transition()
                    .duration(1000)
                    .call(yAxis.scale(y).ticks(10));
                    
               //Update Detail Vis city name 
               d3.select("#city_name").text(data.STATION); 
			 
			 

  
}




