//div used for the text box on mouseover
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", .6)

//if want to reduce image by ratio
//chnage to domain/range
var scale_image = data.dim.scale_image

// convert pixel height to nanometers
var pixels_nanometer = data.dim.pixels_nanometer
var height = data.dim.height/pixels_nanometer
var width = data.dim.width/pixels_nanometer
var separation = data.dim.separation/pixels_nanometer

//data used with info by atoms and plane
var neighbors = data.neighbors

// convert the nanometers to pixels times whatever scale is used
var x_image = d3.scaleLinear()
  .domain([0, 2*width ])
  .range([ 0, 2*width*pixels_nanometer*scale_image]);

// Add Y axis
var y_image = d3.scaleLinear()
  .domain([0, height  ])
  .range([ 0, height*pixels_nanometer*scale_image ]);


  // Add X axis --> it is a date format
  var x_image3 = d3.scaleLinear()
    .domain([0, 2*width ])
    .range([ 0, 2*width*pixels_nanometer*2.5]);

  // Add Y axis
  var y_image3 = d3.scaleLinear()
    .domain([0, height  ])
    .range([ 0, height*pixels_nanometer*2.5 ]);

//currently not using monolayers
var monolayer = data.monolayer

var margin ={top: 80, right: 600, bottom: 1500, left: 45};

var svg = d3.select("#map").append("svg")
    .attr("width", x_image(width) + margin.left +margin.right)
    .attr("height", y_image(height) + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate("+margin.left+","+margin.top+")")

//have jpg image as background
var myimage = svg.append('image')
    .attr('xlink:href', image)
    .attr('width', x_image(width))
    .attr('height', y_image(height))

  //   // Add the path using this helper function
  // svg.append('rect')
  //   .attr('x', 15)
  //   .attr('y', y_image(height))
  //   .attr('width', 100*scale_image)
  //   .attr('height', 20)
  //   .attr('stroke', 'black')
  //   .attr('fill', 'white');
  //
  // svg.append('text')
  //   .attr('x', 15)
  //   .attr('y', y_image(height)+50)
  //   .attr('stroke', 'black')
  //   .style("font-size", 19)
  //   .text("100px (* image scale)")
//user-select bars
//maybe should have all in the same replace
//and replace multiSelectSublattice with place select in line chart
var multiSelectPlane = d3.selectAll("#multiSelectPlane")
var selectedColumn = d3.select("#selectFeature").property("value")
var selectedGroup_value = d3.select('#selectPlaneSublattice').property("value")
var selectedGroup = d3.select('#selectPlaneSublattice')

neighbors_filter = neighbors.filter(function(d){return d.combined==selectedGroup_value})

// var x2 = d3.scaleLinear()
//             .range([ 0, 100])
//             .domain([d3.min(neighbors_filter, function(d) { return +d[selectedColumn]}),d3.max(neighbors_filter, function(d) { return +d[selectedColumn] })])
//
// var xAxis2 = svg.append("g")
//   .attr("transform", "translate(" + (x_image(width) + 300) + ",-15)")
//   .call(d3.axisTop(x2).ticks(2, "s"));
//add data to the user-select bars
multiSelectPlane.selectAll("option")
    .data(zone_all)
    .enter()
    .append("option")
    .attr("value", function(d) { return d; })
    .text(function(d) { return d; })
     .property("selected", function(d){ return d === zone_all[0]; })

restore_boolean = true

//uncomment when sublattice B is between sublattice A (should have option in user interface)
// var dot_monolayer = svg.append('g')
//   .selectAll("dot")
//   .data(monolayer)
//   .enter()
//   .append("circle")
//     .attr("cx", function (d) { return x_image(d.x_monolayer); } )
//     .attr("cy", function (d) { return y_image(d.y_monolayer); } )
//     //.attr("test", function (d) { return d.a != null ? console.log(anglescale(d.a)): console.log(2)})
//     //.attr("test2", function (d) { return console.log(d.a)})
//     .attr("r", function (d) { return 3})
//     .style("fill", "blue")

//
// var ellipse = svg
// 	.selectAll("ellipse")
// 	.data(neighbors)
// 	.enter()
// 	.append("ellipse")
// 	.attr("cx", function (d) { return d.x_position * ratio; })
// 	.attr("cy", function (d) { return d.y_position * ratio; })
// 	.attr("rx", function (d) { return d.sigma_x * ratio; })
// 	.attr("ry", function (d) { return d.sigma_y * ratio; })
//   .style("stroke", "blue")
//   .style("fill", "none")
//   //


//initially filtered_neightbors only includes the data with the 2nd listed plane
var selectedGroup_value = d3.select('#selectPlaneSublattice').property("value")
neighbors_filter = neighbors.filter(function(d){return d.combined==selectedGroup_value && d[selectedColumn] != null})


//var shades=d3.scaleQuantile().range(['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'])
var shades=d3.scaleQuantile().range(['#bdbd00', '#c7c700', '#cccc00', '#d1d100', '#dbdb00', '#e0e000', '#e6e600', '#f0f000', '#f5f500'])
              .domain([d3.min(neighbors_filter, function(d) { return +d[selectedColumn]}),d3.max(neighbors_filter, function(d) { return +d[selectedColumn] })])

// var bar_colors=d3.scaleLinear().range([ 0, 100])
//               .domain([d3.min(neighbors_filter, function(d) { return +d[selectedColumn]}),d3.max(neighbors_filter, function(d) { return +d[selectedColumn] })])

var group_names = neighbors.map(function(d){ return d.sublattice_df }) // list of group names
console.log(group_names)
var cat_color = d3.scaleOrdinal()
.domain(group_names)
.range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

//dot for center of atom
var atom_dot = svg.append('g')
  .selectAll("dot")
  .data(neighbors)
  .enter()
  .append("circle")
    .attr("cx", function (d) { return x_image(d.x_position); } )
    .attr("cy", function (d) { return y_image(d.y_position); } )
    .attr("r", 3)
    .style("fill", function(d){return cat_color(d.sublattice_df)})



      function update_atom_line(){
        options = []
        for (var option of d3.select('#multiSelectPlane').property("selectedOptions")){
        options.push(option.value)
        }
        var neighbors_filter = neighbors.filter(function(d){
                return options.includes(d.combined);
               })


               neighbors_filter.sort(function(a, b) {
                     return d3.ascending(a.x_position, b.x_position)
                   })

               sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
                 .key(function(d) { return d.combined_all;})
                 .entries(neighbors_filter);

                 console.log("sumstat")
                 console.log(sumstat)

               d3.selectAll("path.lines2").remove()


               var content2 = svg.selectAll("path.lines2").data(sumstat)

               var contentEnter2 = content2.enter()
                       .append("path")
                       .attr("class", "lines2")

               contentEnter2
                 .attr("stroke-width", .5)
                 .attr('stroke', "white")

        .attr("fill", "none")
                 .attr("d", function(d){
                   return d3.line()
                     .x(function(d) { return x_image(d.x_position); })
                     .y(function(d) { return y_image(d.y_position); })
                     (d.values)
                 })
                 content2.exit().remove();

                //
                //   d3.selectAll("line.lineAtoms").remove()
                //
                //    //line connecting each atom to each other depending on the place the user selects
                //    var lineAtom = svg
                //                     .selectAll("line.lineAtoms")
                //                     .data(neighbors_filter)
                // var lineAtomEnter = lineAtom
                //                      .enter()
                //                      .append("line")
                //                      .attr('class', 'lineAtoms')
                //
                // lineAtomEnter
                //          .attr("x1", function (d) { return x_image(d.x_position); })
                //          .attr("y1", function (d) { return y_image(d.y_position); })
                //          .attr("x2", function (d) { return x_image(d.x_next); })
                //          .attr("y2", function (d) { return y_image(d.y_next); })
                //          .attr("stroke-width", 1)
                //          .attr('stroke', "white")
                //          //update2 also changes the width of the current line in the line_chart
                //          //maybe should make separate function
                //          // .on("mouseover", function(d) {
                //          //       update2( d.combined_all)
                //          //       div.transition()
                //          //           .duration(200)
                //          //           .style("opacity", .9);
                //          //       div	.html( d.combined_all)
                //          //           .style("left", (d3.event.pageX) + "px")
                //          //           .style("top", (d3.event.pageY - 28) + "px");
                //          //       })
                //
                //       lineAtom.exit().remove();


                             }



   var title2  = svg.append("text")
           .attr("x", (x_image(width) / 2))
           .attr("y", 0 - (margin.top / 2))
           .attr("text-anchor", "middle")
           .style("font-size", "16px")
           .style("text-decoration", "underline")
           .text(selectedGroup_value + " by " + selectedColumn);



function update_atom(){
  var selectedColumn = d3.select("#selectFeature").property("value")


  var selectedGroup_value = d3.select('#selectPlaneSublattice').property("value")
  var selectedplane_value = d3.select('#selectPlane').property("value")
  var selectedpolygon_value = d3.select('#selectPolygon').property("value")
  console.log(selectedplane_value)
  console.log(selectedpolygon_value)
  console.log(selectedGroup_value)

  if (selectedGroup_value != "null"){
    neighbors_filter = neighbors.filter(function(d){return d.combined==selectedGroup_value && d[selectedColumn] != null})}
  else{
    neighbors_filter = neighbors.filter(function(d){return d.plane== null})}
  console.log(neighbors_filter)


  plane_filter = neighbors.filter(function(d){return d.combined==selectedGroup_value && d[selectedColumn] != null && d.plane == selectedplane_value})

  one_plane_filter = neighbors.filter(function(d){return d.combined==selectedGroup_value && d[selectedColumn] != null && d.plane == selectedplane_value && d.plane_position_df == selectedpolygon_value})

  console.log(one_plane_filter)
  console.log(plane_filter)
  console.log(shades.domain())
  title2.text(selectedGroup_value + " by " + selectedColumn);

// since using new plane and new selected data, reset the plane

if (selectedColumn == "filtered_ratio_aspect")
    shades
      .domain([.8,1.2])
// else if (selectedColumn == "filtered_area")
//     shades
//       .domain([(.9 * separation)**2, (1.3 * separation)**2])
// else if (selectedColumn == "filtered_magnitude")
//           shades
//             .domain([0,separation/8])
else
  shades
    .domain([d3.min(neighbors_filter, function(d) { return +d[selectedColumn]}),d3.max(neighbors_filter, function(d) { return +d[selectedColumn] })])



    d3.selectAll("polygon.horz_selected_shapes").remove()

    //add color coded rectangles with values corresponding the 2nd plane (the default)
    var atom_rect_horz_selected_shapes = svg.selectAll("polygon.horz_selected_shapes").data(plane_filter)
    var atom_rectEnter_horz_selected_shapes = atom_rect_horz_selected_shapes
      .enter()
      .append("polygon")
      .attr("class", "horz_selected_shapes")
      .attr("transform", function(d, i) { return "translate(" + (x_image(width)+ 150) + "," + (i * 120) + ")"; });


    atom_rectEnter_horz_selected_shapes
    .attr("points",function(d) {    return (x_image3(d.neighbor_1x_zero) + "," +	y_image3(d.neighbor_1y_zero)	+ " " + x_image3(d.neighbor_2x_zero) + "," +	y_image3(d.neighbor_2y_zero) + " " +	 x_image3(d.neighbor_3x_zero) + "," +	y_image3(d.neighbor_3y_zero) + " " +	x_image3(d.neighbor_4x_zero) + "," +	y_image3(d.neighbor_4y_zero))})
    .attr("stroke","blue")
    .attr("stroke-width", 3)
    .style("fill", function(d) {return shades(+d[selectedColumn])})
    //.attr("test", function(d) {return console.log(zone_all[1].includes(d.combined)) })
    .style("opacity", 0)

    atom_rect_horz_selected_shapes.exit().remove();



    d3.selectAll("polygon.horz_selected_polygon").remove()

    //add color coded rectangles with values corresponding the 2nd plane (the default)
    var atom_rect_horz_selected_polygon = svg.selectAll("polygon.horz_selected_polygon").data(plane_filter)
    var atom_rectEnter_horz_selected_polygon = atom_rect_horz_selected_polygon
      .enter()
      .append("polygon")
      .attr("class", "horz_selected_polygon")
      .attr("transform", function(d, i) { return "translate(" + (x_image(width)+ 150) + "," + (i * 120) + ")"; });


    atom_rectEnter_horz_selected_polygon
    .attr("points",function(d) {    return (x_image3(one_plane_filter[0]["neighbor_1x_zero"]) + "," +	y_image3(one_plane_filter[0]["neighbor_1y_zero"])	+ " " + x_image3(one_plane_filter[0]["neighbor_2x_zero"]) + "," +	y_image3(one_plane_filter[0]["neighbor_2y_zero"]) + " " +	 x_image3(one_plane_filter[0]["neighbor_3x_zero"]) + "," +	y_image3(one_plane_filter[0]["neighbor_3y_zero"]) + " " +	x_image3(one_plane_filter[0]["neighbor_4x_zero"]) + "," +	y_image3(one_plane_filter[0]["neighbor_4y_zero"]))})
    .attr("stroke","red")
    .attr("stroke-width", 3)
    //.style("fill", function(d) {return shades(+d[selectedColumn])})
    //.attr("test", function(d) {return console.log(zone_all[1].includes(d.combined)) })
    //.style("opacity", 0)

    atom_rect_horz_selected_polygon.exit().remove();



    d3.selectAll("polygon.highlight_plane").remove()

    //add color coded rectangles with values corresponding the 2nd plane (the default)
    var atom_rect_highlight_plane = svg.selectAll("polygon.highlight_plane").data(plane_filter)
    var atom_rectEnter_highlight_plane = atom_rect_highlight_plane
          .enter()
          .append("polygon")
          .attr("class", "highlight_plane")

    atom_rectEnter_highlight_plane
    .attr("points",function(d) {
    return x_image(d.neighbor_1x) + "," +	y_image(d.neighbor_1y)	+ " " + x_image(d.neighbor_2x) + "," +	y_image(d.neighbor_2y) + " " +	x_image(d.neighbor_3x) + "," +	y_image(d.neighbor_3y) + " " +		x_image(d.neighbor_4x) + "," +	y_image(d.neighbor_4y)
    })
    .attr("stroke", "blue")
    .attr("stroke-width", 5)
    .style("fill", function(d) {return shades(+d[selectedColumn])})
    //.attr("test", function(d) {return console.log(zone_all[1].includes(d.combined)) })
    .style("opacity", .5)

    atom_rect_highlight_plane.exit().remove();



    d3.selectAll("polygon.highlight_one_polygon").remove()

    //add color coded rectangles with values corresponding the 2nd plane (the default)
    var atom_rect_highlight_one_polygon = svg.selectAll("polygon.highlight_one_polygon").data(one_plane_filter)
    var atom_rectEnter_highlight_one_polygon = atom_rect_highlight_one_polygon
                          .enter()
                          .append("polygon")
                          .attr("class", "highlight_one_polygon")

    atom_rectEnter_highlight_one_polygon
        .attr("points",function(d) {
            return x_image(d.neighbor_1x) + "," +	y_image(d.neighbor_1y)	+ " " + x_image(d.neighbor_2x) + "," +	y_image(d.neighbor_2y) + " " +	x_image(d.neighbor_3x) + "," +	y_image(d.neighbor_3y) + " " +		x_image(d.neighbor_4x) + "," +	y_image(d.neighbor_4y)
        })
        .attr("stroke", "red")
        .attr("stroke-width", 5)
        .style("fill", function(d) {return shades(+d[selectedColumn])})
        //.attr("test", function(d) {return console.log(zone_all[1].includes(d.combined)) })
        .style("opacity", .5)

      atom_rect_highlight_one_polygon.exit().remove();


      d3.selectAll("polygon.overlap").remove()

      //add color coded rectangles with values corresponding the 2nd plane (the default)
      var atom_rect_overlap = svg.selectAll("polygon.overlap").data(plane_filter)
      var atom_rectEnter_overlap = atom_rect_overlap
                            .enter()
                            .append("polygon")
                            .attr("class", "overlap")


      atom_rectEnter_overlap
          .attr("points",function(d) {    return (x_image(width) + x_image3(d.neighbor_1x_zero)) + "," +	y_image3(d.neighbor_1y_zero)	+ " " + (x_image(width) + x_image3(d.neighbor_2x_zero)) + "," +	y_image3(d.neighbor_2y_zero) + " " +	(x_image(width) + x_image3(d.neighbor_3x_zero)) + "," +	y_image3(d.neighbor_3y_zero) + " " +	(x_image(width) + x_image3(d.neighbor_4x_zero)) + "," +	y_image3(d.neighbor_4y_zero)
          })
          .attr("stroke","black")
          .attr("stroke-width", 1)
          .style("fill", function(d) {return shades(+d[selectedColumn])})
          //.attr("test", function(d) {return console.log(zone_all[1].includes(d.combined)) })
          .style("opacity", .1)

        atom_rect_overlap.exit().remove();

        var bar_colors=d3.scaleLinear().range([ 0, 100])
                      .domain([d3.min(neighbors_filter, function(d) { return +d[selectedColumn]}),d3.max(neighbors_filter, function(d) { return +d[selectedColumn] })])



                      // Add X axis --> it is a date format
        x2.domain([d3.min(neighbors_filter, function(d) { return +d[selectedColumn]}),d3.max(neighbors_filter, function(d) { return +d[selectedColumn] })])

        xAxis2.transition().duration(1000).call(d3.axisBottom(x2).ticks(4));

        d3.selectAll("rect.overlap4").remove()

        //add color coded rectangles with values corresponding the 2nd plane (the default)
        var atom_rect_overlap4 = svg.selectAll("rect.overlap4").data(plane_filter)
        var atom_rectEnter_overlap4 = atom_rect_overlap4
                              .enter()
                              .append("rect")
                              .attr("class", "overlap4")
                              .attr("transform", function(d, i) { return "translate(" + (x_image(width)+ 300) + "," + (i * 120) + ")"; });


        atom_rectEnter_overlap4
            .attr("test", function(d) { console.log(bar_colors(+d[selectedColumn]))} )
            .attr("test2", function(d) { console.log(+d[selectedColumn])} )
            .attr("width", function(d) { return bar_colors(+d[selectedColumn])} )
            .attr("height", 20)
            .style("fill", function(d) {return shades(+d[selectedColumn])})
          // .attr("width", function(d) { bar_colors(+d[selectedColumn])})
          // .attr("height", 20);

          atom_rect_overlap4.exit().remove();


            d3.selectAll("polygon.tiles").remove()

            //add color coded rectangles with values corresponding the 2nd plane (the default)
            var atom_rect = svg.selectAll("polygon.tiles").data(neighbors_filter)
            var atom_rectEnter = atom_rect
                                  .enter()
                                  .append("polygon")
                                  .attr("class", "tiles")
            atom_rectEnter
                .attr("points",function(d) {
                    return x_image(d.neighbor_1x) + "," +	y_image(d.neighbor_1y)	+ " " + x_image(d.neighbor_2x) + "," +	y_image(d.neighbor_2y) + " " +	x_image(d.neighbor_3x) + "," +	y_image(d.neighbor_3y) + " " +		x_image(d.neighbor_4x) + "," +	y_image(d.neighbor_4y)
                })
                .attr("stroke","red")
                .attr("stroke-width", 3)
                .style("fill", function(d) {return shades(+d[selectedColumn])})
                //.attr("test", function(d) {return console.log(zone_all[1].includes(d.combined)) })
                .style("fill-opacity", 0)
                .on("mouseover", function(d) {

                    d3.select("#tooltip")
                      .style("left", (d3.event.pageX) + "px")
                      .style("top", (d3.event.pageY - 28) + "px")
                      .select("#value")
                      .html("Combined All: " + d.combined_all + " <br/> "  +
                                      "inner_angle_center_atom: " + d.inner_angle_center_atom + " <br/> "  +
                                      "filtered_inner_angle_center_atom: " + d.inner_angle_center_atom + " <br/> "  +
                                      "sigma_x: " + d.sigma_x + " <br/> "  +
                                      "x_dist_center_atom: " + d.x_dist_center_atom + " <br/> "  +
                                      "y_dist_center_atom: " + d.y_dist_center_atom + " <br/> "  +
                                      "distance_next: " + d.distance_next + " <br/> "  +
                                      "distance_prev: " + d.distance_prev + " <br/> "  +
                                      "magnitude: " + d.magnitude + " <br/> "  +
                                      "area: " + d.filtered_area + " <br/> "  +
                                      "area: " + d.area + " <br/> "  +
                                      "ratio_aspect: " + d.ratio_aspect);


                    d3.select("#tooltip").classed("hidden", false);

                   })
                   .on("mouseout", function() {


                    d3.select("#tooltip").classed("hidden", true);

                   })

            atom_rect.exit().remove();

//add line for the angle of the line
            // d3.selectAll("line.angleLine").remove()
            // //line from center of atom to the center of 4 surrounding atoms (*10)
            // var angleLine = svg
            //       .selectAll("line.angleLine")
            //       .data(neighbors_filter)
            //
            // var angleLineEnter = angleLine
            //       .enter()
            //       .append("line")
            //       .attr("class", "angleLine")
            //
            //   angleLineEnter
            //       .attr("x1", function (d) { return x_image(d.filtered_x_position); })
            //       .attr("y1", function (d) { return y_image(d.filtered_y_position); })
            //       .attr("x2", function (d) { return x_image(d.filtered_arrow_x); })
            //       .attr("y2", function (d) { return y_image(d.filtered_arrow_y); })
            //       .attr("stroke-width", 3)
            //       .attr('stroke', "white")
            //       // .on("mouseover", function(d) {
            //       //         div.transition()
            //       //             .duration(200)
            //       //             .style("opacity", .9);
            //       //         div	.html( d.combined_all)
            //       //             .style("left", (d3.event.pageX) + "px")
            //       //             .style("top", (d3.event.pageY - 28) + "px");
            //       //           }
            //       //         )
            //
            //     angleLineEnter.exit().remove()

                //
                // d3.selectAll("circle.center_dot").remove()
                //
                // //center_dot is the dot in the center two surrounding atoms
                // var center_dot = svg
                //   .selectAll("circle.center_dot")
                //   .data(neighbors_filter)
                //
                // var center_dotEnter = center_dot
                //   .enter()
                //   .append("circle")
                //   .attr("class", "center_dot")
                //
                // center_dotEnter
                //   .attr("cx", function (d) { return x_image(d.center_neighborsx); } )
                //   .attr("cy", function (d) { return y_image(d.center_neighborsy); } )
                //   .attr("fill", "green")
                //   .attr('r', 2)
                  // .on("mouseover", function(d) {
                  //         div.transition()
                  //             .duration(200)
                  //             .style("opacity", .9);
                  //         div	.html(d.x_position + "<br/>"  + d.y_position + "<br/>"  )
                  //             .style("left", (d3.event.pageX) + "px")
                  //             .style("top", (d3.event.pageY - 28) + "px");
                  //         })
                  //     .on("mouseout", function(d) {
                  //         div.transition()
                  //             .duration(500)
                  //             .style("opacity", 0);
                  //     });


                // center_dotEnter.exit().remove()



                d3.selectAll("rect.overlap4").remove()

                //add color coded rectangles with values corresponding the 2nd plane (the default)
                var atom_rect_overlap4 = svg.selectAll("rect.overlap4").data(plane_filter)
                var atom_rectEnter_overlap4 = atom_rect_overlap4
                                      .enter()
                                      .append("rect")
                                      .attr("class", "overlap4")
                                      .attr("transform", function(d, i) { return "translate(" + (x_image(width)+ 300) + "," + (i * 120) + ")"; });


                atom_rectEnter_overlap4
                    .attr("test", function(d) { console.log(bar_colors(+d[selectedColumn]))} )
                    .attr("test2", function(d) { console.log(+d[selectedColumn])} )
                    .attr("width", function(d) { return bar_colors(+d[selectedColumn])} )
                    .attr("height", 20)
                    .style("fill", function(d) {return shades(+d[selectedColumn])})
                  // .attr("width", function(d) { bar_colors(+d[selectedColumn])})
                  // .attr("height", 20);

                  atom_rectEnter_overlap4.exit().remove();

          //http://bl.ocks.org/mbostock/3202354 and https://www.d3-graph-gallery.com/graph/custom_legend.html

          // clear current legend
          d3.selectAll("rect.legendrect").remove()


          //write out in the legend how much the value of the selected column is increasing with each increase in shading
          min_color=(shades.domain()[1]-shades.domain()[0])/9


          var legendrect = svg
                            .selectAll("rect.legendrect")
                            .data(['#bdbd00', '#c7c700', '#cccc00', '#d1d100', '#dbdb00', '#e0e000', '#e6e600', '#f0f000', '#f5f500'])

          var legendrectEnter = legendrect
                                  .enter()
                                  .append("rect")
                                  .attr("class", "legendrect")
                                  .attr("transform", function(d, i) { return "translate(" + (x_image(width)+ 400) + "," + (20 + i * 40) + ")"; });

          legendrectEnter
              .attr("width", 20)
              .attr("height", 40)
              .style("fill", function(d){ return d})

              // .on("click", function(d) {
              //       console.log("changing the div?")
              //       div.transition()
              //           .duration(200)
              //           .style("opacity", .9)
              //       div	.html( "Combined All: " + d.combined_all + "<br/>"  +
              //                 "inner_angle_center_atom: " + d.inner_angle_center_atom + "<br/>"  +
              //                 "filtered_inner_angle_center_atom: " + d.filtered_inner_angle_center_atom + "<br/>"  +
              //                 "sigma_x: " + d.sigma_x + "<br/>"  +
              //                 "x_dist_center_atom: " + d.x_dist_center_atom + "<br/>"  +
              //                 "y_dist_center_atom: " + d.y_dist_center_atom + "<br/>"  +
              //                 "distance_next: " + d.distance_next + "<br/>"  +
              //                 "distance_prev: " + d.distance_prev + "<br/>"  +
              //                 "filtered_magnitude: " + d.filtered_magnitude + "<br/>"  +
              //                 "area: " + d.area )
              //           .style("left", (d3.event.pageX) + "px")
              //           .style("top", (d3.event.pageY - 28) + "px");
              //       })

          legendrectEnter.exit().remove()



          // clear current legend
          d3.selectAll("text.legendtext").remove()


          //write out in the legend how much the value of the selected column is increasing with each increase in shading
          min_color=(shades.domain()[1]-shades.domain()[0])/9


          var legendtext = svg
                            .selectAll("text.legendtext")
                            .data(['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'])

          var legendtextEnter = legendtext
                                  .enter()
                                  .append("text")
                                  .attr("class", "legendtext")
                                  .attr("transform", function(d, i) { return "translate(" + (x_image(width) + 450) + "," + (20 + i * 40) + ")"; });

          legendtextEnter
              .attr("x", 26)
              .attr("y", 10)
              .attr("dy", ".35em")
              .text(function(d,i) {return shades.domain()[0] + min_color*i});

          legendrectEnter.exit().remove()




}


function update_plane_selection(){
  var selectedColumn = d3.select("#selectFeature").property("value")


  var selectedGroup_value = d3.select('#selectPlaneSublattice').property("value")


  neighbors_filter = neighbors.filter(function(d){return d.combined==selectedGroup_value && d[selectedColumn] != null})

  var allPolygons = d3.nest()
  .key(function(d) { return d.plane_position_df;})
  .entries(neighbors_filter );

  var allPlanes = d3.nest()
  .key(function(d) { return d.plane;})
  .entries(neighbors_filter );


  d3.selectAll("option.plane").remove()

  // add the options to the button
  var plane_select = d3.select("#selectPlane")
                        .selectAll('option.plane')
                        .data(allPlanes)

  var plane_selectEnter = plane_select
                            .enter()
                            .append('option')
                            .attr("class", 'plane')
  plane_selectEnter
    .text(function (d) { return d.key; }) // text showed in the menu
    .attr("value", function (d) { return d.key; }) // corresponding value returned by the button

  plane_selectEnter.exit().remove();


    d3.selectAll("option.polygons").remove()
    // add the options to the button
    var polygon_select = d3.select("#selectPolygon")
                          .selectAll('option.polygon')
                          .data(allPolygons)

    var polygon_selectEnter = polygon_select
                              .enter()
                              .append('option')
                              .attr("class", 'polygon')
    polygon_selectEnter
      .text(function (d) { return d.key; }) // text showed in the menu
      .attr("value", function (d) { return d.key; }) // corresponding value returned by the button

    polygon_selectEnter.exit().remove();

  }
update_plane_selection()
update_atom_line()
// update_atom()

//if user select from top multi select, the lines for the plane will appear on the image - multiple lines are possible
multiSelectPlane.on("change",function(event) {
  update_plane_selection()
  update_atom_line()
})

//this should be select one, reusing the #selectPlaneSublattice in line chart
selectedGroup.on("change",function(event) {
  update2(3)
  update_plane_selection()
  // update_atom()
                      })



d3.select("#selectFeature").on("change",function(event) {
        update2(3)
        update_plane_selection()
        // update_atom()

      })
d3.select("#selectPlane").on("change",function(event) {
      //
      // update_atom()

    })

d3.select("#selectPolygon").on("change",function(event) {
        //
        // update_atom()

      })
// svg.selectAll("polygon")
//     .data(neighbors)
//   .enter().append("polygon")
//     .attr("points",function(d) {
//         return x_image(d.neighbor_1x) + "," +	y_image(d.neighbor_1y)	+ " " + x_image(d.neighbor_2x) + "," +	y_image(d.neighbor_2y) + " " +	x_image(d.neighbor_3x) + "," +	y_image(d.neighbor_3y) + " " +		x_image(d.neighbor_4x) + "," +	y_image(d.neighbor_4y)
//     })
//     .attr("stroke","black")
//     .attr("stroke-width",5)
//     .style("fill", function(d) {return shades(+d[selectedColumn])})
// // A function that update the chart
// function update(selectedGroup_value) {
//      restore_boolean = false

      // Give these new data to update line
      // dot
      //     .style("fill", function (d) {
      //       var a = 0;
      //        var b = 0;

            //  a += (d.x_position >= selectedGroup_value.x_position - x_position_range)? 1 : 0; b += 1;
            //  a += (d.x_position <= selectedGroup_value.x_position + x_position_range)? 1 : 0; b += 1;
            //
            //  a += (d.y_position >= selectedGroup_value.y_position - y_position_range)? 1 : 0; b += 1;
            //  a += (d.y_position <= selectedGroup_value.y_position + y_position_range)? 1 : 0; b += 1;
            //
            //  a += (d.a >= selectedGroup_value.a - angle_range)? 1 : 0; b += 1;
            //  a += (d.a <= selectedGroup_value.a + angle_range)? 1 : 0; b += 1;
            //
            // a += (d.distance_next  >= selectedGroup_value.distance_next - dist_next)? 1 : 0; b += 1;
            // a += (d.distance_next  <= selectedGroup_value.distance_next + dist_next)? 1 : 0; b += 1;
            //
            // a += (d.distance_prev  >= selectedGroup_value.distance_prev - dist_prev)? 1 : 0; b += 1;
            // a += (d.distance_prev  <= selectedGroup_value.distance_prev + dist_prev)? 1 : 0; b += 1;
            //
            // a += (d.ellipticity >= selectedGroup_value.ellipticity - ellipticity_range)? 1 : 0; b += 1;
            // a += (d.ellipticity <= selectedGroup_value.ellipticity + ellipticity_range)? 1 : 0; b += 1;
            //
            //  a += (d.sigma_x >= selectedGroup_value.sigma_x - sigma_x_range )? 1 : 0; b += 1;
            //  a += (d.sigma_x <= selectedGroup_value.sigma_x + sigma_x_range)? 1 : 0; b += 1;
            //
            //  a += (d.sigma_y >= selectedGroup_value.sigma_y - sigma_y_range)? 1 : 0; b += 1;
            //  a += (d.sigma_y <= selectedGroup_value.sigma_y + sigma_y_range)? 1 : 0; b += 1;
            //
            //  console.log(selectedGroup_value.distance_next)
            //  console.log(d.distance_next )
            //  console.log(dist_next)

    //         return a==b ? "blue": "none"})
    //
    // }

// function restore(selectedGroup_value) {
//     console.log("restore?")
//     restore_boolean = true
//
//       // Give these new data to update line
//       dot
//           .style("fill", function (d) { return d.a != null ? "blue": "yellow"})
//     }
