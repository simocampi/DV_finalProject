// Global vars
var projection;
var cur_region = -1;
var map_container;
var c = [0, 0];
var country_list = [];

// MODIFICARE PER CAMBIARE LE DIMENSIONI DELLA MAPPA
var w = 800;
var h = 500;

var zoom = d3.zoom().scaleExtent([1, 20]).on("zoom", zoomed);

function next() {
  if (cur_region < country_list.length) {
    cur_region = cur_region + 1;
    updateMap();
  }
}

function prev() {
  if (cur_region > 0) {
    cur_region = cur_region - 1;
    updateMap();
  }
}

function drawMap(world) {
  svg = d3.select("#svg-map").attr("width", w).attr("height", h);
  map_container = svg.select("#map");

  projection = d3
    .geoEquirectangular()
    .scale(120)
    .translate([w / 2, h / 2]);

  // ******* PART IV *****
  var geoGenerator = d3.geoPath().projection(projection);

  // Draw the background (country outlines)
  map_container
    .selectAll("path")
    .data(topojson.feature(world, world.objects.countries).features)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("id", function (d) {
      country_list.push(d.properties.name);
      return d.properties.name;
    })
    .attr("d", geoGenerator)
    .on("click", function () {
      console.log(d3.select(this).attr("id"));
    });

  c = projection([0, 0]);
}

/**
 * Clears the map
 */
function clearMap() {
  map_container.selectAll("polygon").remove();
  map_container.selectAll("circle").remove();
}

function updateMap() {
  //Clear any previous selections;
  clearMap();
  var bBox = document.getElementById(country_list[cur_region]).getBBox();

  console.log("Curr_region: " + String(cur_region));
  console.log("Country name: " + country_list[cur_region]);
  console.log(bBox);
  console.log("---------------------------------------");

  p1 = [bBox.x, bBox.y]; //sx alto
  p2 = [bBox.x + bBox.width, bBox.y]; //dx alto
  p3 = [bBox.x + bBox.width, bBox.y + bBox.height]; //dx basso
  p4 = [bBox.x, bBox.y + bBox.height]; //sx basso

  //console.log(p1, p2, p3, p4);
  console.log("_________________________________");

  map_container
    .append("polygon")
    .attr("points", function (d) {
      return [p1, p2, p3, p4].join(",");
    })
    .attr("fill", "rgba(255,0,0,0.5)");

  // centro
  c = [bBox.x + bBox.width / 2, bBox.y + bBox.height / 2];
  map_container
    .append("circle")
    .attr("cx", c[0])
    .attr("cy", c[1])
    .attr("r", 0.0)
    .attr("fill", "rgba(255,0,0,0.8)");

  d3.select("#" + country_list[cur_region]).style("fill", "red");

  map_container.transition().call(zoom.translateTo, c[0], c[1]);
}

/* ################################################################# */
// ZOOM
function zoomed() {
  map_container.attr("transform", d3.event.transform);
}

function zoomManager() {
  d3.select("#zoom-in").on("click", function () {
    map_container.transition().call(zoom.scaleBy, 1.5);
  });

  d3.select("#zoom-out").on("click", function () {
    map_container.transition().call(zoom.scaleBy, 0.5);
  });
  d3.select("#zoom-reset").on("click", function () {
    origin = projection([0, 0]);
    map_container
      .transition()
      .call(zoom.translateTo, origin[0], origin[1])
      .transition()
      .call(zoom.scaleTo, 1);
  });
}
zoomManager();

/* ################################################################# */
// LOAD

var region_list = [];

d3.json("../../data/map/countries-10m_V34.json", function (error, world) {
  if (error) {
    console.log(error);
    throw error;
  }

  console.log(world);
  let topology = world;
  topology = topojson.presimplify(topology);

  drawMap(topology);
  country_list = country_list;
  console.log(country_list);
});
