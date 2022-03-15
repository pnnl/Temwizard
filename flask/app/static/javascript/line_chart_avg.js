var neighbors = data.neighbors
var feature = data.feature

var scale_image = data.dim.scale_image
var height = data.dim.height*scale_image
var pixels_nanometer = data.dim.pixels_nanometer
//https://www.d3-graph-gallery.com/graph/line_several_group.html
// set the dimensions and margins of the graph
var margin = {top: 50, right: 200, bottom: 30, left: 60},
    width = 800 - margin.left - margin.right
    //height = 400 - margin.top - margin.bottom;

// append the svg2 object to the body of the page
var svg2 = d3.select("#line_chart_avg")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


// List of groups (here I have one group per column)
var allGroup = d3.map(neighbors, function(d){return(d.zone_horizontal)}).keys()

var neighbors_filter = neighbors.filter(function(d){return d.zone_horizontal==allGroup[0]})
neighbors_filter.sort(function(a, b) {
      return d3.ascending(a.y_position, b.y_position)
    })

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
  .key(function(d) { return d.zone;})
  .entries(neighbors_filter);

// Add X axis --> it is a date format
var x = d3.scaleLinear()
  .domain([-.02, .02])
  .range([ 0, width ]);

var xAxis = svg2.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x).ticks(5));

// Add Y axis
var y = d3.scaleLinear()
  .domain([0, height/pixels_nanometer ])
  .range([0 ,  height ]);
var yAxis = svg2.append("g")
.call(d3.axisLeft(y).ticks(20));

var group_names = sumstat.map(function(d){ return d.key }) // list of group names

// Usually you have a color scale in your chart already
var color = d3.scaleOrdinal()
  .domain(group_names)
  .range(d3.quantize(d3.interpolateHcl("red", "blue"), 2));
//
// // Add one dot in the legend for each name.
// var size = 20
// svg2.selectAll("mydots")
//   .data(group_names)
//   .enter()
//   .append("rect")
//     .attr("x", width)
//     .attr("y", function(d,i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
//     .attr("width", size)
//     .attr("height", size)
//     .style("fill", function(d){ return color(d)})
//
// // Add one dot in the legend for each name.
// svg2.selectAll("mylabels")
//   .data(group_names)
//   .enter()
//   .append("text")
//     .attr("x", width + size*1.2)
//     .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
//     .style("fill", function(d){ return color(d)})
//     .text(function(d){ return d})
//     .attr("text-anchor", "left")
//     .style("alignment-baseline", "middle")



  var title  = svg2.append("text")
          .attr("x", (width / 2))
          .attr("y", 0 - (margin.top / 2))
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("text-decoration", "underline")
          .text(selectedGroup_value + " by " + selectedColumn);


              // A function that update the chart
                function update2(plane_line) {
                  var selectedGroup_value = d3.select('#selectPlaneSublattice').property("value")
                  var selectedColumn = d3.select("#selectFeature").property("value")

                  //neighbors_filter = neighbors.filter(function(d){return d.zone_horizontal==selectedGroup_value & d[selectedColumn]!=null & d['plane_position_df'] ==0})
                  neighbors_filter = neighbors.filter(function(d){return d.zone_horizontal==selectedGroup_value  & d[selectedColumn]!=null })

                  neighbors_filter.sort(function(a, b) {
                        return d3.ascending(a.y_position, b.y_position)
                      })

                  sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
                    .key(function(d) { return d.zone_plane_orig;})
                    .rollup(function(d) {
                      return {
                          dist_from_avg_line_mean: d3.mean(d, function(e) { return e[selectedColumn]; }),
                          y_position: d3.mean(d, function(e) { return e.y_position; }),
                          dist_from_avg_line_dev: d3.deviation(d, function(e) { return e[selectedColumn]; }),
                          zone: d.map(function(e){
                                  return e.zone;
                                })[0]
                      };
                    })
                    .entries(neighbors_filter)
                    .map(function(d){
                          console.log(d.zone)
                          return d.value;
                      });

                      console.log("sumstat")
                      // have to re-sort
                      sumstat.sort(function(a,b){
                          return a.y_position - b.y_position;
                      })
                    console.log(sumstat)


                  // Add X axis --> it is a date format
                  //y.domain([0, d3.max(neighbors_filter, function(d) { return +d.y_position; })])

                  // Add Y axis
                  x.domain([d3.min(sumstat, function(d) { return +d['dist_from_avg_line_mean']; }), d3.max(sumstat, function(d) { return +d['dist_from_avg_line_mean']; })])
                  x.domain([.25, .45])

                  yAxis.transition().duration(1000).call(d3.axisLeft(y).ticks(40))
                  xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(5))

                  title.text(selectedGroup_value + " by " + selectedColumn);

                  d3.selectAll("path.lines").remove()

                group_sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
                  .key(function(d) { return d.zone;})
                  .entries(sumstat);

                  console.log("group_sumstat")
                  console.log(group_sumstat)
                    //
                    // var content = svg2.selectAll("path.lines").data(group_sumstat)
                    //
                    // var contentEnter = content.enter()
                    // 	    	.append("path")
                    //         .attr("class", "lines")
                    // contentEnter
                    //   .attr("fill", "none")
                    //   .attr("stroke", function(d){ return color(d.key) })
                    //   .attr("stroke-width", 1.5)
                    //   .attr("test3", function(d){ return console.log(d.values) })
                    //   .attr("d", function(d){
                    //     return d3.line()
                    //       .x(function(d) { return x(+d['dist_from_avg_line_mean']); })
                    //       .y(function(d) { return y(+d['y_position']); })
                    //       (d.values)
                    //   })
                    //   content.exit().remove();



                        d3.selectAll("line.lineAtoms2").remove()


                      d3.selectAll("line.lineAtoms2").remove()

                       //line connecting each atom to each other depending on the place the user selects
                       var lineAtom = svg2
                                        .selectAll("line.lineAtoms2")
                                        .data(sumstat)
                    var lineAtomEnter = lineAtom
                                         .enter()
                                         .append("line")
                                         .attr('class', 'lineAtoms2')

                    lineAtomEnter
                             .attr("x1", function (d) { return x(d['dist_from_avg_line_mean'] + d['dist_from_avg_line_dev']); })
                             .attr("y1", function (d) { return y(d.y_position); })
                             .attr("x2", function (d) { return x(d['dist_from_avg_line_mean'] - d['dist_from_avg_line_dev']); })
                             .attr("y2", function (d) { return y(d.y_position); })
                             .attr("stroke-width", 1)
                             .attr('stroke', "black")


                          lineAtom.exit().remove();



                      d3.selectAll("circle.line_dot").remove()

                      //line_dot is the dot in the center two surrounding atoms
                      var line_dot = svg2
                        .selectAll("circle.line_dot")
                        .data(sumstat)

                      var line_dotEnter = line_dot
                        .enter()
                        .append("circle")
                        .attr("class", "line_dot")

                      line_dotEnter
                        .attr("cx", function (d) { return x(d['dist_from_avg_line_mean']); } )
                        .attr("cy", function (d) { return y(d.y_position); } )
                        .attr("fill", "black")
                        .attr("r", 2);


                      line_dotEnter.exit().remove()


                    d3.selectAll("line.lineAtoms2").remove()

                     //line connecting each atom to each other depending on the place the user selects
                     var lineAtom = svg2
                                      .selectAll("line.lineAtoms2")
                                      .data(sumstat)
                  var lineAtomEnter = lineAtom
                                       .enter()
                                       .append("line")
                                       .attr('class', 'lineAtoms2')

                  lineAtomEnter
                           .attr("x1", function (d) { return x(d['dist_from_avg_line_mean'] + d['dist_from_avg_line_dev']); })
                           .attr("y1", function (d) { return y(d.y_position); })
                           .attr("x2", function (d) { return x(d['dist_from_avg_line_mean'] - d['dist_from_avg_line_dev']); })
                           .attr("y2", function (d) { return y(d.y_position); })
                           .attr("stroke-width", 1)
                           .attr('stroke', "white")


                        lineAtom.exit().remove();

                    // //dot for center of atom
                    // var atom_dot = svg2.append('g')
                    //   .selectAll("dot")
                    //   .data(neighbors_filter)
                    //   .enter()
                    //   .append("circle")
                    //     .attr("cx", function (d) { return x(d[selectedColumn]); } )
                    //     .attr("cy", function (d) { return y(d.y_position); } )
                    //     .attr("r", 5)
                    //     .style("fill", "blue")


                    }

update2(3)


            //
            // // When the button is changed, run the updateChart function
            // d3.select("#selectFeature").on("change", function(d) {
            //     // recover the option that has been chosen
            //     // run the updateChart function with this selected option
            //     update2(3)
            // })
