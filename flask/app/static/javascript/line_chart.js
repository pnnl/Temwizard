var neighbors = data.neighbors
var feature = data.feature
console.log(feature)

//https://www.d3-graph-gallery.com/graph/line_several_group.html
// set the dimensions and margins of the graph
var margin = {top: 50, right: 200, bottom: 30, left: 60},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// append the svg2 object to the body of the page
var svg2 = d3.select("#line_chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


// List of groups (here I have one group per column)
var allGroup = d3.map(neighbors, function(d){return(d.combined)}).keys()

var neighbors_filter = neighbors.filter(function(d){return d.combined==allGroup[0]})
neighbors_filter.sort(function(a, b) {
      return d3.ascending(a.x_position, b.x_position)
    })

console.log(neighbors_filter)
// add the options to the button
d3.select("#selectPlaneSublattice")
  .selectAll('myOptions')
  .data(allGroup)
  .enter()
  .append('option')
  .text(function (d) { return d; }) // text showed in the menu
  .attr("value", function (d) { return d; }) // corresponding value returned by the button

// add the options to the button
d3.select("#selectFeature")
  .selectAll('myOptions')
  .data(feature)
  .enter()
  .append('option')
  .text(function (d) { return d; }) // text showed in the menu
  .attr("value", function (d) { return d; }) // corresponding value returned by the button


var selectedGroup_value = d3.select('#selectPlaneSublattice').property("value")
var selectedColumn = d3.select("#selectFeature").property("value")
// group the data: I want to draw one line per group
var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
  .key(function(d) { return d.combined_all;})
  .entries(neighbors_filter);

// Add X axis --> it is a date format
var x = d3.scaleLinear()
  .domain([0, d3.max(neighbors_filter, function(d) { return +d.x_position; })])
  .range([ 0, width ]);
var xAxis = svg2.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x).ticks(5));

// Add Y axis
var y = d3.scaleLinear()
  .domain([0, d3.max(neighbors_filter, function(d) { return +d[selectedColumn]; })])
  .range([ height, 0 ]);
var yAxis = svg2.append("g")
  .call(d3.axisLeft(y));

var group_names = sumstat.map(function(d){ return d.key }) // list of group names

// Usually you have a color scale in your chart already
var color = d3.scaleOrdinal()
  .domain(group_names)
  .range(d3.quantize(d3.interpolateHcl("#fafa6e", "#2A4858"), 20));

// Add one dot in the legend for each name.
var size = 20
svg2.selectAll("mydots")
  .data(group_names)
  .enter()
  .append("rect")
    .attr("x", width)
    .attr("y", function(d,i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d){ return color(d)})

// Add one dot in the legend for each name.
svg2.selectAll("mylabels")
  .data(group_names)
  .enter()
  .append("text")
    .attr("x", width + size*1.2)
    .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function(d){ return color(d)})
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")



  var title  = svg2.append("text")
          .attr("x", (width / 2))
          .attr("y", 0 - (margin.top / 2))
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("text-decoration", "underline")
          .text("nM from Avg Plane Line by X Position ");


              // A function that update the chart
                function update2(plane_line) {
                  var selectedGroup_value = d3.select('#selectPlaneSublattice').property("value")
                  var selectedColumn = d3.select("#selectFeature").property("value")

                  console.log(neighbors)

                  neighbors_filter = neighbors.filter(function(d){return d.combined==selectedGroup_value & d[selectedColumn]!=null})

                  neighbors_filter.sort(function(a, b) {
                        return d3.ascending(a.x_position, b.x_position)
                      })
                  console.log(neighbors_filter)
                  sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
                    .key(function(d) { return d.combined_all;})
                    .entries(neighbors_filter);


                  // Add X axis --> it is a date format
                  x.domain([0, d3.max(neighbors_filter, function(d) { return +d.x_position; })])

                  // Add Y axis
                  y.domain([d3.min(neighbors_filter, function(d) { return +d[selectedColumn]; }), d3.max(neighbors_filter, function(d) { return +d[selectedColumn]; })])
                  console.log(sumstat)


                  yAxis.transition().duration(1000).call(d3.axisLeft(y))
                  xAxis.transition().duration(1000).call(d3.axisBottom(x))

                  title.text("nM from Avg Plane Line by X Position ");

                  d3.selectAll("path.lines").remove()


                  var content = svg2.selectAll("path.lines").data(sumstat)

                  var contentEnter = content.enter()
                  	    	.append("path")
                          .attr("class", "lines")
                  contentEnter
                    .attr("fill", "none")
                    .attr("stroke", function(d){ return color(d.key) })
                    .attr("stroke-width", 1.5)
                    .attr("d", function(d){
                      return d3.line()
                        .x(function(d) { return x(+d.x_position); })
                        .y(function(d) { return y(+d[selectedColumn]); })
                        (d.values)
                    })
                    content.exit().remove();

                    }

update2(3)


            //
            // // When the button is changed, run the updateChart function
            // d3.select("#selectFeature").on("change", function(d) {
            //     // recover the option that has been chosen
            //     // run the updateChart function with this selected option
            //     update2(3)
            // })
