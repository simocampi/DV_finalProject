/** @format */

function annualDataStyle() {
  d3.select("#legend-annual-line").remove();
  d3.select("#legend-annual-text").remove();

  d3.select("#range-name-unc").attr("y", 15);

  d3.select("#range-name-line")
    .attr("y1", 23)
    .attr("y2", 23)
    .style("stroke", "steelblue");

  d3.select("#range-name-legend").attr("y", 26);
}

//Create the legend of the Linechart
function createLineChartLegend(svg) {
  var btn = getCheckedValue("btn-range-year");
  legend = svg.append("g").attr("class", "legend");

  legend
    .append("rect")
    .attr("x", 10)
    .attr("width", 290)
    .attr("y", 1)
    .attr("height", 60)
    .attr("class", "legend-square")
    .attr("id", "legend-square-linechart");

  if (btn.value != "annual") {
    legend
      .append("line")
      .attr("x1", 15)
      .attr("x2", 30)
      .attr("y1", 15)
      .attr("y2", 15)
      .attr("class", "line_chart_annual")
      .attr("id", "legend-annual-line");

    legend
      .append("text")
      .attr("x", 37)
      .attr("y", 15)
      .attr("class", "legend")
      .text("Annual Average Temperature")
      .attr("id", "legend-annual-text");
  }

  var label = document.getElementById("label-" + btn.id);
  var range_name = label.innerHTML;

  var y1_range_name = 32,
    y2_range_name = 32,
    y_unc = 32;
  var stroke_color = "red";
  if (btn.value == "annual") {
    y1_range_name = 23;
    y2_range_name = 23;
    y_unc = 15;
    stroke_color = "steelblue";
  }

  legend
    .append("rect")
    .attr("x", 15)
    .attr("width", 15)
    .attr("y", y_unc)
    .attr("height", 16)
    .attr("class", "uncertainty")
    .attr("id", "range-name-unc");

  legend
    .append("line")
    .attr("x1", 15)
    .attr("x2", 30)
    .attr("y1", y1_range_name)
    .attr("y2", y2_range_name)
    .attr("class", "line_chart_range_years")
    .attr("id", "range-name-line")
    .style("stroke", stroke_color);

  legend
    .append("text")
    .attr("x", 39)
    .attr("y", y2_range_name + 3)
    .attr("class", "legend")
    .attr("id", "range-name-legend")
    .html(range_name + " Average Temperature with uncertainty");

  legend
    .append("line")
    .attr("x1", 15)
    .attr("x2", 30)
    .attr("y1", 48)
    .attr("y2", 48)
    .attr("class", "baselines");

  legend
    .append("text")
    .attr("x", 37)
    .attr("y", 50)
    .attr("class", "legend")
    .text("Baseline Temperature");
}

function updateRangeNameLegend(svg) {
  var btn = getCheckedValue("btn-range-year");
  var label = document.getElementById("label-" + btn.id);
  var range_name = label.innerHTML;

  d3.select(".legend").remove();
  createLineChartLegend(svg, btn);

  if (btn.value != "annual") {
    var legend = d3.select("legend-square-linechart");
    legend
      .append("line")
      .attr("x1", 15)
      .attr("x2", 30)
      .attr("y1", 15)
      .attr("y2", 15)
      .attr("class", "line_chart_annual")
      .attr("id", "legend-annual-line");

    legend
      .append("text")
      .attr("x", 37)
      .attr("y", 15)
      .attr("class", "legend")
      .text("Annual Average Temperature")
      .attr("id", "legend-annual-text");

    d3.select("#range-name-unc")
      .attr("y", 24)
      .attr("class", "uncertainty")
      .attr("id", "range-name-unc");

    d3.select("#range-name-line")
      .attr("y1", 32)
      .attr("y2", 32)
      .style("stroke", "red");
  } else annualDataStyle();

  d3.select("#range-name-legend").html(
    range_name + " Average Temperature with uncertainty"
  );
}

function changeDataRangeYears() {
  var dataFile = document.getElementById("input_countrySelection").value;
  var folder;

  if (dataFile == "") {
    dataFile = "Global Land";
    folder = "regions";
  } else folder = "countries";

  var csv =
    "/../data/" +
    folder +
    "/" +
    dataFile +
    "/" +
    dataFile +
    "_anomalyTable.csv";
  var json =
    "/../../data/" + folder + "/" + dataFile + "/" + dataFile + "_info.json";

  d3.csv(csv)
    .then((data) => {
      d3.json(json)
        .then((info) => {
          var baseline = +info["absolute_temp(C)"];

          parseDataAttributes(data, baseline, dataFile);
          //Update the LineChart
          updateLineChart(data, ".graphics");

          //Update StripesChart
          updateStripesChart(data);
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

//Draw the area that represents the uncertainty of the temperature measurement
function drawUncertainty(data, svg, x, y) {
  var range_year = getCheckedValue("btn-range-year").value;
  var areaUncGenerator = d3
    .area()
    .x(function (d) {
      return x(d.date);
    })
    .y0(function (d) {
      return y(d[range_year + "_value"] + d[range_year + "_unc"]);
    })
    .y1(function (d) {
      return y(d[range_year + "_value"] - d[range_year + "_unc"]);
    })
    .defined((d) => {
      return !isNaN(d[range_year + "_unc"]);
    });

  svg
    .select(".uncertainty")
    .selectAll("path")
    .data([data])
    .enter()
    .append("path")
    .attr("d", areaUncGenerator);
}

//Update the area that represents the uncertainty of the temperature measurement
function UpdateUncertainty(data, x, y) {
  var range_year = getCheckedValue("btn-range-year").value;
  var areaUncGenerator = d3
    .area()
    .x(function (d) {
      return x(d.date);
    })
    .y0(function (d) {
      return y(d[range_year + "_value"] + d[range_year + "_unc"]);
    })
    .y1(function (d) {
      return y(d[range_year + "_value"] - d[range_year + "_unc"]);
    })
    .defined((d) => {
      return !isNaN(d[range_year + "_unc"]);
    });

  var unc = d3.select(".uncertainty").selectAll("path").data([data]);

  unc.exit().remove();

  unc.enter().append("path").merge(unc).attr("d", areaUncGenerator);
}

function getTimeScale() {
  var timeScale = [];
  for (var Y = 1750; Y <= 2020; Y++) {
    monthList.forEach((m) => {
      timeScale.push(Y + "-" + m);
    });
  }

  return timeScale;
}

function baseLine(data) {
  var timeScale = getTimeScale();
  data_baselines = [];
  timeScale.forEach(() => {
    data_baselines.push({ baseline: data[0].baseline });
  });

  return data_baselines;
}

//get x and Y scales of the Linechart
function getScales(data) {
  var range_year = getCheckedValue("btn-range-year").value;

  var x = d3
    .scaleTime()
    .domain(
      d3.extent(data, function (d) {
        return d.date;
      })
    )
    .range([0, width]);

  // Add Y axis
  var y = d3
    .scaleLinear()
    .domain([
      d3.min(data, function (d) {
        return d.annual_value - d[range_year + "_unc"] - 0.5;
      }),
      d3.max(data, function (d) {
        return d.annual_value + d[range_year + "_unc"] + 0.5;
      }),
    ])
    .range([height, 0]);

  return [x, y];
}

function getLineGenerators(x, y) {
  var range_year = getCheckedValue("btn-range-year").value;

  var valueline_annual = d3
    .line()
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y(d.annual_value);
    })
    .defined((d) => {
      return !isNaN(d.annual_value);
    });

  var valueline_ten_years = d3
    .line()
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y(d[range_year + "_value"]);
    })
    .defined((d) => {
      return !isNaN(d[range_year + "_value"]);
    });

  var valueline_baseline = d3
    .line()
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y(d.baseline);
    });

  return [valueline_annual, valueline_ten_years, valueline_baseline];
}

function getCheckedValue(groupName) {
  var radios = document.getElementsByName(groupName);

  for (i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      return radios[i];
    }
  }
  return null;
}

function createDefaultLineChart(data) {
  // set titles
  var title = document.getElementById("title-climate-changes").innerHTML;
  document.getElementById("title-climate-changes").innerHTML =
    title + " - " + data[0].region;


  //default button

  var svg = d3
    .select("#linechart svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .select("g.graphics")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var scales = getScales(data);
  var x = scales[0];
  var y = scales[1];

  var x_axis = d3.axisBottom(x).tickSizeOuter(0);
  var y_axis = d3.axisLeft(y).tickSizeOuter(0);

  svg
    .select("#x_grid_linechart")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(-height).tickFormat(""));

  // add the Y gridlines
  svg
    .select("#y_grid_linechart")
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

  //lineChartGridline("x_axis", "y_axis");

  var lineGenerators = getLineGenerators(x, y);
  var valueline_annual = lineGenerators[0];
  var valueline_ten_years = lineGenerators[1];
  var valueline_baseline = lineGenerators[2];

  drawUncertainty(data, svg, x, y);

  svg
    .select(".baselines")
    .selectAll("path")
    .data([data])
    .enter()
    .append("path")
    .attr("d", valueline_baseline);

  svg
    .select(".line_chart_annual")
    .selectAll("path")
    .data([data])
    .enter()
    .append("path")
    .attr("d", valueline_annual);

  svg
    .select(".line_chart_range_years")
    .selectAll("path")
    .data([data])
    .enter()
    .append("path")
    .attr("d", valueline_ten_years);

  var tooltipLine = svg
    .append("line")
    .attr("class", "line_tip")
    .attr("id", "linechart-tip");

  var tipBox = svg
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("opacity", 0)
    .attr("class", "tipbox")
    .attr("id", "tipbox-linechart")
    .on("mousemove", (event) =>
      drawTooltipLineChart(
        tipBox,
        event,
        x,
        data,
        tooltipLine,
        "#linechart",
        height
      )
    )
    .on("mouseout", () => removeTooltipLineChart(tooltipLine, "#linechart"));

  createLineChartLegend(svg, btn_ten);

  svg
    .select(".x_axis")
    .attr("transform", "translate(0," + height + ")")
    .call(x_axis);

  svg.select(".y_axis").call(y_axis);
}

//Update the X and Y axes
function updateAxis(x_axis_class, y_axis_class, x, y) {
  // update  x Axis
  d3.select(x_axis_class)
    .transition()
    .duration(500)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // update  y Axis
  d3.select(y_axis_class)
    .transition()
    .duration(500)
    .call(d3.axisLeft(y).tickSizeOuter(0));
}

function updateLineChart(data, grafic_class) {
  // update titles
  var title = document
    .getElementById("title-climate-changes")
    .innerHTML.split("-");
  document.getElementById("title-climate-changes").innerHTML =
    title[0] + " - " + data[0].region;

 
  //Get scales and update axis
  var scales = getScales(data);
  var x = scales[0];
  var y = scales[1];

  //.graphics
  var svg = d3.select(grafic_class);

  //re-define the lines generator
  // .defined(...) => are not considered the NaN values
  var lineGenerators = getLineGenerators(x, y);
  var valueline_annual = lineGenerators[0];
  var valueline_ten_years = lineGenerators[1];
  var valueline_baseline = lineGenerators[2];

  //Update the area that represents the uncertainty
  UpdateUncertainty(data, x, y);

  updateRangeNameLegend(svg);
  updateAxis(".x_axis", ".y_axis", x, y);

  var annual_line = svg
    .select(".line_chart_annual")
    .selectAll("path")
    .data([data]);
  annual_line.exit().remove();
  annual_line
    .enter()
    .append("path")
    .merge(annual_line)
    .attr("d", valueline_annual);

  var ten_line = svg
    .select(".line_chart_range_years")
    .selectAll("path")
    .data([data]);
  ten_line.exit().remove();
  ten_line
    .enter()
    .append("path")
    .merge(ten_line)
    .attr("d", valueline_ten_years)
    .style("stroke", function (d) {
      var range_year = getCheckedValue("btn-range-year").value;
      if (range_year == "annual") return "steelblue";
      else return "red";
    })
    .style("stroke-width", function (d) {
      var range_year = getCheckedValue("btn-range-year").value;
      if (range_year == "annual") return "1px";
    });

  var base_line = svg.select(".baselines").selectAll("path").data([data]);
  base_line.exit().remove();
  base_line
    .enter()
    .append("path")
    .merge(base_line)
    .attr("d", valueline_baseline);

  //Update The tooltip
  var tooltipLine = d3.select("#linechart-tip");
  var tipBox = d3
    .select("#tipbox-linechart")
    .on("mousemove", (event) =>
      drawTooltipLineChart(
        tipBox,
        event,
        x,
        data,
        tooltipLine,
        "#linechart",
        height
      )
    )
    .on("mouseout", () => removeTooltipLineChart(tooltipLine, "#linechart"));

  svg
    .select("#x_grid_linechart")
    .transition()
    .duration(500)
    .call(d3.axisBottom(x).tickSize(-height).tickFormat(""));

  // add the Y gridlines
  svg
    .select("#y_grid_linechart")
    .transition()
    .duration(500)
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));
}



/*------------------------------------- EVENTS CLIMATE CHANGES LINECHART-----------------------------------------  */


function drawTooltipLineChart(
  self,
  event,
  x,
  data,
  tooltipLine,
  id_chart,
  height
) {
  var btn = getCheckedValue("btn-range-year");

  var label = document.getElementById("label-" + btn.id);
  var range_name = label.innerHTML;

  var tooltip = d3.select(id_chart + " .tooltip");

  const date = x.invert(d3.pointer(event, self.node())[0]);

  //find date correspondece comparing difference in milliseconds
  var elem = data.find(
    (d) => Math.abs(d.date - date) < 1000 * 60 * 60 * 24 * 16
  );

  tooltipLine
    .attr("stroke", "black")
    .attr("x1", x(date))
    .attr("x2", x(date))
    .attr("y1", 0)
    .attr("y2", height);

  var tipText = String(
    "<b> <p style='text-align: center; font-size: 15px;'>" +
      elem.date.getFullYear() +
      "</p>" +
      "Baseline: " +
      elem.baseline +
      " &deg;C <br/>" +
      "Annual  Avg: " +
      elem.annual_value.toFixed(2) +
      " &deg;C " +
      " &plusmn; " +
      elem.annual_unc.toFixed(2) +
      "<br/>" +
      (btn.value != "annual"
        ? String(
            range_name +
              "  Avg: " +
              elem[btn.value + "_value"].toFixed(2) +
              " &deg;C " +
              " &plusmn; " +
              elem[btn.value + "_unc"].toFixed(2) +
              "</b>"
          )
        : "")
  );

  tooltip
    .html("")
    .style("display", "block")
    .style("left", String(event.pageX + 20) + "px")
    .style("top", String(event.pageY - 20) + "px")
    .append("div")
    .html(tipText);
}

function removeTooltipLineChart(tooltipLine, id_chart) {
  var tooltip = d3.select(id_chart + " .tooltip");
  if (tooltip) tooltip.style("display", "none");
  if (tooltipLine) tooltipLine.attr("stroke", "none");
}
