var margin_stripes = {'top': 10, 'right': 70, 'bottom': 10, 'left': 70};
var width_stripe = full_width - margin_stripes.left - margin_stripes.right;
var height_stripe = full_width*9/40 - margin_stripes.top - margin_stripes.bottom;
var years_stripes;

function getYearsStripes(){

    var years = [];

    for(i=1750; i<= 2020; i++) years.push(i);

    return years;
}



//get x and Y scales of the Linechart
function getStripesScales(){

    var x = d3.scaleTime()
              .domain(d3.extent(years_stripes, function(d) { return d; }))
              .range([ 0, width ]);
              
    // Add Y axis
    var y = d3.scaleLinear()
             .domain([0,1])
             .range([ 0, height/3 ]);
    
    return [x, y];

}


function dataStripes(data_annnual){
    
    var range_year = getCheckedValue("btn-range-year").value;
    var data2=[];
    var i = 0;
    years_stripes.forEach(yr => {

        if( isInList(yr, data_annnual) ){

            var idx = getIdxList(yr, data_annnual);
            data2.push(data_annnual[idx])
        }
            
        else{
            data2[i]={}
            data2[i]["Year"]= yr;
            data2[i][range_year+"_anomaly"] = +("NaN");
        }  

        i++;
    });

    return data2;
}


function createDefaultStripesChart(data){
   
    years_stripes= getYearsStripes();
   
    var data_annnual = getAnnualData(data);
    data_annnual = dataStripes(data_annnual);
    //Scales
    var scales = getStripesScales(data_annnual);
    var x = scales[0];
    var y = scales[1];


    
    var svg = d3.select("#stripechart")
                .append("svg")
                .attr("width", width_stripe + margin_stripes.left + margin_stripes.right)
                .attr("height", height_stripe + margin_stripes.top + margin_stripes.bottom)
                .append("g")
                .attr("transform", "translate(" + margin_stripes.left + "," + margin_stripes.top + ")");

    // add axis

    let stripe_axis = d3.axisBottom()
                        .scale(x)
                        .ticks(6)
                        .tickFormat(d3.format(".0f"));

    svg.append("g")
    .attr("transform", "translate(0," + y(0.8) + ")")
    //.attr("class", "x_axis")
    .call(stripe_axis)
    .select(".domain").remove();
    
    var stripe_width = (width_stripe / data_annnual.length)+2;
    

    var stripes = svg.selectAll('rect')
                     .data(data_annnual)
                     .enter().append("rect")
                     .attr("class", "stripes")
                     .attr("x", (d) => {return  x(d.Year)})
                     .attr("width",  stripe_width)
                     .attr("y",  y(0))
                     .attr("height", y(0.8))
                     .attr("fill", (d)  => colorStripes(data_annnual, d) ) 

    //Events Tooltip
    stripes.on("mouseenter", stripesEnter)
           .on("mouseout", stripesLeave)
           .on("mousemove", stripesMove);
 
}


function colorStripes(data_annnual, d){

    var range_year = getCheckedValue("btn-range-year").value;

    var extent = d3.extent(data_annnual, (d) => d[range_year+"_anomaly"]);

    
    var colors = d3.scaleDiverging(t => d3.interpolateRdBu(1 - t))
                                .domain([extent[0], 0, extent[1]]);


    if( isNaN(d[range_year+"_anomaly"] ) ) 
        return unknown_temp;
    else
        return colors( d[range_year+"_anomaly"]);
}


function updateStripesChart(data){

    var data_annnual = getAnnualData(data);
    data_annnual = dataStripes(data_annnual);

    //Scales
    var scales = getStripesScales(data_annnual);
    var x = scales[0];
    var y = scales[1];

             
    
    var stripe_width = (width_stripe / data_annnual.length)+2;
    
    
    
    var svg = d3.select("#stripechart");

    
    var stripes= svg.selectAll('.stripes')
                     .data(data_annnual)

    stripes.exit().remove();
    
    stripes.attr("x", (d) => { return  x(d.Year)})
            .attr("width",  stripe_width)
            .attr("y",  y(0))
            .attr("height", y(0.8))
            .attr("fill", (d) => colorStripes(data_annnual, d) )
            .merge(stripes)
            .on("mouseover", stripesEnter)
            .on("mouseout", stripesLeave)
                    
}


/*--------------------------------------- CLIMATE STRIPES EVENTS -------------------------------------------- */


function stripesEnter(event, d) {
    var range_year = getCheckedValue("btn-range-year").value;
    var tooltip = d3.select("#stripechart .tooltip");
  
    tooltip.transition();
    var tipText = String(
      "<p style='text-align: center; font-weight: bold; font-size: 13px'> " +
        d.Year +
        "</p>" +
        "<p style='text-align: center; font-weight: bold; font-size: 12px'> " +
        (isNaN(d[range_year + "_anomaly"])
          ? "unknown"
          : d[range_year + "_anomaly"].toFixed(2) + " &deg;C ") +
        (isNaN(d[range_year + "_anomaly"])
          ? ""
          : " &plusmn; " + d[range_year + "_unc"].toFixed(2)) +
        " </p>"
    );
  
    tooltip
      .style("left", String(event.pageX + 20) + "px")
      .style("top", String(event.pageY - 20) + "px")
      .style("display", "block")
      .html(tipText);
  }
  
  function stripesLeave() {
    var tooltip = d3.select("#stripechart .tooltip");
    if (tooltip) tooltip.style("display", "none");
  }
  
  function stripesMove() {
    var tooltip = d3.select("#stripechart .tooltip");
    tooltip
      .style("left", String(event.pageX + 20) + "px")
      .style("top", String(event.pageY - 20) + "px");
  }
  