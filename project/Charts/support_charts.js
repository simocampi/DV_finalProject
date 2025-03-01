//Support Functions for  All charts

//Global Variables
var full_width = 900;
var margin = { top: 40, right: 70, bottom: 30, left: 50 };
var width = full_width - margin.left - margin.right;
var height = (full_width * 9) / 16 - margin.top - margin.bottom;

var parseMonth = d3.timeParse("%m");
var monthList = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

var parseTime = d3.timeParse("%Y-%m");

//Load the baseline of the corresponding country from the nameCountry_info.json file
function initBaselineAndInfo(dataFile, global = false) {
  var folder;

  if (global) folder = "regions";
  else folder = "countries";

  d3.json(
    "/../data/" + folder + "/" + dataFile + "/" + dataFile + "_info.json"
  ).then((data) => {
    baseline = +data["absolute_temp(C)"];
  });
}

//the annual average from January to December 1950 is reported at June 1950.
function getAnnualData(data) {
  return data.filter((d) => d.Month == 6);
}

//-------------------------- GRIDLINES CHARTS --------------------------------------

function make_x_gridlines(x, n_tick = 8) {
  return d3.axisBottom(x).ticks(n_tick);
}

function make_y_gridlines(y, n_tick = 8) {
  return d3.axisLeft(y).ticks(n_tick);
}

function allDeafaultDataset() {
  var folder;
  var dataFile = document.getElementById("input_countrySelection").value;
  if (dataFile == "") {
    dataFile = "Global Land";
    folder = "regions";
  } else folder = "countries";
  //initBaselineAndInfo(dataFile, true);input_countrySelection
  var csv = "/../../data/" + folder + "/" + dataFile + "/" + dataFile +"_anomalyTable.csv";
  var json = "/../../data/" + folder + "/" + dataFile + "/" + dataFile + "_info.json";
  var csvBaseline = "/../../data/"+folder+"/" + dataFile + "/" + dataFile+"_monthlyAbsoluteTemperature.csv";

  d3.csv(csv)
    .then(function (data) {
      d3.json(json)
        .then((info) => {
          
          d3.csv(csvBaseline)
            .then((dataBaseline)=>{


              var baseline = +info["absolute_temp(C)"];

              parseDataAttributes(data, baseline, dataFile);
              createDefaultLineChart(data);
              createDefaultStripesChart(data);
              readDataTable(data, dataFile, baseline, false, true);
              createHottestColdestLineChart(data);

              parseSeasonalBaseline(dataBaseline, dataFile);
              createDeafaultSeasonalLinechart(data, dataBaseline);
            
            }) .catch((error) => {
              console.log(error);
              //alert("Unable To Load The Dataset!!");
              throw error;
            });
            
            // 
            d3.selectAll(".x_axis_label")
              .attr("transform", "translate(" + width /2 + ", 480)")
            
            d3.selectAll(".y_axis_label")
              .attr("transform", "translate( -50 , " + (height /2 + 60) + " ) rotate(-90 0 0)")
        })
        .catch((error) => {
          console.log(error);
          //alert("Unable To Load The Dataset!!");
          throw error;
        });
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
}

function changeAllData(dataFile) {

  var folder = "countries";
  if(dataFile == "Global Land")
    folder = "regions";
  

  var csv = "/../../data/" + folder + "/" + dataFile + "/" + dataFile + "_anomalyTable.csv";
  var json = "/../../data/" + folder + "/" + "/" + dataFile + "/" + dataFile + "_info.json";
  var csvBaseline = "/../../data/" + folder + "/" + dataFile + "/" + dataFile+"_monthlyAbsoluteTemperature.csv";

  d3.csv(csv)
    .then((data) => {
      
      d3.json(json)
        .then((info) => {
          
          d3.csv(csvBaseline)
            .then((dataBaseline)=>{

              var baseline = +info["absolute_temp(C)"];
          
              parseDataAttributes(data, baseline, dataFile);
              //Update the LineChart
              updateLineChart(data, ".graphics");
              //Update StripesChart
              updateStripesChart(data);
              //Update Table
              readDataTable(data, dataFile, baseline, true, (dataFile == "Global Land") ? true : false);
              //Update Hottest Coldest Linechart
              UpdateHottestColdestLineChart(data);
              parseSeasonalBaseline(dataBaseline, dataFile);
              updateSeasonalLineChart(data, dataBaseline);



            }) .catch((error) => {
              console.log(error);
              //alert("Unable To Load The Dataset!!");
              throw error;
            });
        
        })
        .catch((error) => {
          console.log(error);
          //alert("Unable To Load The Dataset!!");
          throw error;
        });
    })
    .catch((error) => {
      console.log(error);
      //alert("Unable To Load The Dataset!!");
      throw error;
    });
}

function createGridLine(x, y, svg, nameChart, n_tickX = 8, n_tickY = 8) {
  svg
    .append("g")
    .attr("class", "grid")
    .attr("id", "x-grid-" + nameChart)
    .attr("transform", "translate(0," + height + ")")
    .style("stroke-dasharray", "3,3")
    .call(make_x_gridlines(x, n_tickX).tickSize(-height).tickFormat(""));

  svg
    .append("g")
    .attr("class", "grid")
    .attr("id", "y-grid-" + nameChart)
    .style("stroke-dasharray", "3,3")
    .call(make_y_gridlines(y, n_tickY).tickSize(-width).tickFormat(""));
}

function updateGrid(idChart, x, y, svg, n_tickX = 8, n_tickY = 8) {
  d3.selectAll(idChart + " .grid").remove();
  createGridLine(x, y, svg, "seasonal", (n_tickX = 8), (n_tickY = 8));
}

// parse the attribitues useful for the chart and add the baseline
// to the annual_value and ten_years_value
function parseDataAttributes(data, baseline, region = "NaN") {
  data.forEach((d) => {
    
    d.date = parseTime(d.Year + "-" + d.Month);
    d.annual_anomaly = parseFloat(d["Annual Anomaly"]);
    d.annual_unc = parseFloat(d["Annual Unc."]);
    d.annual_value = baseline + parseFloat(d["Annual Anomaly"]);

    d.five_years_value = baseline + parseFloat(d["Five-year Anomaly"]);
    d.five_years_anomaly = parseFloat(d["Five-year Anomaly"]);
    d.five_years_unc = parseFloat(d["Five-year Unc."]);

    d.ten_years_value = baseline + parseFloat(d["Ten-year Anomaly"]);
    d.ten_years_anomaly = parseFloat(d["Ten-year Anomaly"]);
    d.ten_years_unc = parseFloat(d["Ten-year Unc."]);

    d.twenty_years_value = baseline + parseFloat(d["Twenty-year Anomaly"]);
    d.twenty_years_anomaly = parseFloat(d["Twenty-year Anomaly"]);
    d.twenty_years_unc = parseFloat(d["Twenty-year Unc."]);

    d.monthly_value = parseFloat(d["Monthly Anomaly"]);
    d.monthly_temp = baseline + parseFloat(d["Monthly Anomaly"]);
    d.monthly_unc = parseFloat(d["Monthly Unc."]);

    d.baseline = baseline;
    d["region"] = region;
  });
}
