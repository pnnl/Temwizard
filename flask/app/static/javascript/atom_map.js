
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


    // create a tooltip
var Tooltip = d3.select("#map")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")

//user-select bars
//maybe should have all in the same replace
//and replace multiSelectSublattice with place select in line chart
var multiSelectPlane = d3.selectAll("#multiSelectPlane")
var selectedColumn = d3.select("#selectFeature").property("value")
var selectedGroup_value = d3.select('#selectPlaneSublattice').property("value")
var selectedGroup = d3.select('#selectPlaneSublattice')

neighbors_filter = neighbors.filter(function(d){return d.combined==selectedGroup_value})

//add data to the user-select bars
multiSelectPlane.selectAll("option")
    .data(zone_all)
    .enter()
    .append("option")
    .attr("value", function(d) { return d; })
    .text(function(d) { return d; })
     .property("selected", function(d){ return d === zone_all[0]; })

restore_boolean = true

//initially filtered_neightbors only includes the data with the 2nd listed plane
var selectedGroup_value = d3.select('#selectPlaneSublattice').property("value")

neighbors_filter = neighbors.filter(function(d){return d.combined==selectedGroup_value && d[selectedColumn] != null})

//var shades=d3.scaleQuantile().range(['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'])
var shades=d3.scaleLinear()
  .range(["white", "blue"])
  .domain([d3.min(neighbors_filter, function(d) { return +d[selectedColumn]}),d3.max(neighbors_filter, function(d) { return +d[selectedColumn] })])

var group_names = neighbors.map(function(d){ return d.sublattice_df }) // list of group names

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

                             }

   var title2  = svg.append("text")
           .attr("x", (x_image(width) / 2))
           .attr("y", 0 - (margin.top / 2))
           .attr("text-anchor", "middle")
           .style("font-size", "16px")
           .style("text-decoration", "underline")
           .text(selectedGroup_value + " by " + selectedColumn);

function update_atom_min(){

  var selectedColumn = d3.select("#selectFeature").property("value")
  shades.domain([d3.min(neighbors_filter, function(d) { return +d[selectedColumn]}),d3.max(neighbors_filter, function(d) { return +d[selectedColumn] })])

  var selectedGroup_value = d3.select('#selectPlaneSublattice').property("value")

  title2.text(selectedGroup_value + " by " + selectedColumn);


  if (selectedGroup_value != "null"){
    neighbors_filter = neighbors.filter(function(d){return d.combined==selectedGroup_value && d[selectedColumn] != null})}
  else{
    neighbors_filter = neighbors.filter(function(d){return d.plane== null})}

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
      .attr("stroke","white")
      .attr("stroke-width", 2)
      .attr("test", function(d) {return console.log(shades(+d[selectedColumn]))})
      .style("fill", function(d) {return shades(+d[selectedColumn])})
      //.attr("test", function(d) {return console.log(zone_all[1].includes(d.combined)) })
      .style("fill-opacity", .4)
      .on("mouseover", function(d) {
            Tooltip
                   .style("opacity", 1)
                   .style("left", (d3.event.pageX) + "px")
                   .style("top", (d3.event.pageY - 28) + "px")
                   .style('font-size', '14px')
                  .html("Features: " + " <br/> "  +
                                "<b>" +  "inner_angle_center_atom: " + "</b>" + d.inner_angle_center_atom + " <br/> "  +
                                "<b>" +   "sigma_x: " + "</b>"  + d.sigma_x + " <br/> "  +
                                "<b>" +   "x_dist_center_atom: " + "</b>" + d.x_dist_center_atom + " <br/> "  +
                                "<b>" +   "y_dist_center_atom: " + "</b>" + d.y_dist_center_atom + " <br/> "  +
                                "<b>" +   "distance_next: " + "</b>" + d.distance_next + " <br/> "  +
                                "<b>" +   "distance_prev: " + "</b>" + d.distance_prev + " <br/> "  +
                                "<b>" +   "magnitude: " + "</b>" + d.magnitude + " <br/> "  +
                                "<b>" +   "area: " + "</b>" + d.filtered_area + " <br/> "  +
                                "<b>" +   "area: " + "</b>" + d.area + " <br/> "  +
                                "<b>" +   "ratio_aspect: " + "</b>" + d.ratio_aspect)

                console.log("MOUSEIN")})
                .on("mouseout", function() {
                    console.log("MOUSEIN")
                })

    atom_rect.exit().remove();

//add line for the angle of the line
    d3.selectAll("line.angleLine").remove()
    //line from center of atom to the center of 4 surrounding atoms (*10)
    var angleLine = svg
          .selectAll("line.angleLine")
          .data(neighbors_filter)

    var angleLineEnter = angleLine
          .enter()
          .append("line")
          .attr("class", "angleLine")

    angleLineEnter
        .attr("x1", function (d) { return x_image(d.filtered_x_position); })
        .attr("y1", function (d) { return y_image(d.filtered_y_position); })
        .attr("x2", function (d) { return x_image(d.filtered_arrow_x); })
        .attr("y2", function (d) { return y_image(d.filtered_arrow_y); })
        .attr("stroke-width", 3)
        .attr('stroke', "white")

      angleLineEnter.exit().remove()


      d3.selectAll("circle.center_dot").remove()

      //center_dot is the dot in the center two surrounding atoms
      var center_dot = svg
        .selectAll("circle.center_dot")
        .data(neighbors_filter)

      var center_dotEnter = center_dot
        .enter()
        .append("circle")
        .attr("class", "center_dot")

      center_dotEnter
        .attr("cx", function (d) { return x_image(d.center_neighborsx); } )
        .attr("cy", function (d) { return y_image(d.center_neighborsy); } )
        .attr("fill", "green")

      center_dotEnter.exit().remove()
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
update_atom_min()
update2(3)

//if user select from top multi select, the lines for the plane will appear on the image - multiple lines are possible
multiSelectPlane.on("change",function(event) {
  update_plane_selection()
  update_atom_line()
  update_atom_min()
  update2(3)
})

//this should be select one, reusing the #selectPlaneSublattice in line chart
selectedGroup.on("change",function(event) {
  update_plane_selection()
  update_atom_line()
  update_atom_min()
  update2(3)
          })

d3.select("#selectFeature").on("change",function(event) {
  update_plane_selection()
  update_atom_line()
  update_atom_min()
  update2(3)
      })

d3.select("#selectPlane").on("change",function(event) {
      update_plane_selection()
      update_atom_line()
      update_atom_min()
      update2(3)
    })

d3.select("#selectPolygon").on("change",function(event) {
        update_plane_selection()
        update_atom_line()
        update_atom_min()
        update2(3)
      })
