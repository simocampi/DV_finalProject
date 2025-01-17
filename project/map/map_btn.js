var width_btn = 31;
var height_btn = 31;
var r = 5;

/* -------------------------------------------------------------------------------------- */
/*                       ZOOM IN                                                          */
var zoom_in_btn = d3.select("#zoom-in");
zoom_in_btn
  .select("path")
  .attr("d", topRoundedRect(0, 0, width_btn, height_btn, r));
zoom_in_btn
  .append("line")
  .attr("x1", width_btn / 2 - 7)
  .attr("y1", height_btn / 2)
  .attr("x2", width_btn / 2 + 7)
  .attr("y2", height_btn / 2)
  .style("stroke", "black")
  .style("stroke-width", 2)
  .attr("pointer-events", "none");

zoom_in_btn
  .append("line")
  .attr("x1", width_btn / 2)
  .attr("y1", height_btn / 2 - 7)
  .attr("x2", width_btn / 2)
  .attr("y2", height_btn / 2 + 7)
  .style("stroke", "black")
  .style("stroke-width", 2)
  .attr("pointer-events", "none");

/* -------------------------------------------------------------------------------------- */
/*                       ZOOM OUT                                                         */
var zoom_out_brn = d3.select("#zoom-out");
zoom_out_brn
  .select("path")
  .attr("d", bottomRoundedRect(0, 0, width_btn, height_btn, r));
zoom_out_brn
  .append("line")
  .attr("x1", width_btn / 2 - 7)
  .attr("y1", height_btn / 2)
  .attr("x2", width_btn / 2 + 7)
  .attr("y2", height_btn / 2)
  .style("stroke", "black")
  .style("stroke-width", 2)
  .attr("pointer-events", "none");

/* -------------------------------------------------------------------------------------- */
/*                       ZOOM RESET                                                       */
var zoom_reset_btn = d3.select("#zoom-reset");
zoom_reset_btn.select("rect").attr("width", width_btn).attr("height", height_btn);

var inner_circle = zoom_reset_btn
  .append("circle")
  .attr("r", 5)
  .attr("cx", width_btn / 2)
  .attr("cy", height_btn / 2)
  .attr("fill", "black")
  .attr("pointer-events", "none")
  .attr("visibility", "hidden");

var radius = 7.5
var s = 3.4 
var ha = "M " + (width_btn / 2) + " "+ ((height_btn / 2)-radius-s)
        + "v " + s
        + "a" + radius + "," + radius + " 0 0 1 " + (+radius) + "," + (+radius)
        + "h " + s
        + "h " + (-s)
        + "a" + radius + "," + radius + " 0 0 1 " + (-radius) + "," + (+radius)
        + "v "+ s
        + "v "+ (-s)
        + "a" + radius + "," + radius + " 0 0 1 " + (-radius) + "," + (-radius)
        + "h " + (-s)
        + "h " + s
        + "a" + radius + "," + radius + " 0 0 1 " + (+radius) + "," + (-radius);

var outer_circle = zoom_reset_btn
  .append("path")
  .attr("d", ha)
  .attr("fill", "none")
  .style("stroke", "black")
  .style("stroke-width", 1.3)
  .attr("pointer-events", "none")
  .attr("visibility", "hidden");


var globe_img = zoom_reset_btn.append("svg:image")
                      .attr("xlink:href", "/project/images/globe.svg")
                      .attr("pointer-events", "none")
                      .attr("width", width_btn - (s*2))
                      .attr("height", height_btn - (s*2))
                      .attr("x", s)
                      .attr("y", s);

function no_zoom() {
  globe_img.attr("visibility", "hidden");

  inner_circle.attr("visibility", "visible");
  outer_circle.attr("visibility", "visible");
}

function set_globe_icon() {
  inner_circle.attr("visibility", "hidden");
  outer_circle.attr("visibility", "hidden");

  globe_img.attr("visibility", "visible");
  
}

/* -------------------------------------------------------------------------------------- */
/*                       ANIMATION                                                        */

var animation_btn = d3.select("#animation");
var l = 8;
animation_btn
  .select("path")
  .attr("d", roundedRect(0, 0, width_btn, width_btn, width_btn / 2))
  .style("stroke-width", 1.5);

var play_ico = animation_btn
  .append("path")
  .attr(
    "d",
    roundedTriangle(width_btn / 2 - l + 2, width_btn / 2 - l, l * 2, l * 2)
  )
  .attr("fill", "balck")
  .attr("visibility", "hidden")
  .attr("pointer-events", "none");

var stop_ico = animation_btn
  .append("path")
  .attr("d", roundedRect(width_btn / 2 - l, width_btn / 2 - l, l * 2, l * 2, 1))
  .attr("fill", "black")
  .attr("visibility", "hidden")
  .attr("pointer-events", "none");

async function play() {
  stop_ico.attr("visibility", "hidden");
  play_ico.attr("visibility", "visible");
  console.log("PLAY");
}

async function stop() {
  play_ico.attr("visibility", "hidden");
  stop_ico.attr("visibility", "visible");
  console.log("STOP");
}
