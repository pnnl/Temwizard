

//if want to reduce image by ratio
//chnage to domain/range
//if want to reduce image by ratio
//chnage to domain/range
var scale_image = data.dim.scale_image

// convert pixel height to nanometers
var pixels_nanometer = data.dim.pixels_nanometer
var height = data.dim.height/pixels_nanometer
var width = data.dim.width/pixels_nanometer
var separation = data.dim.separation/pixels_nanometer

console.log("pixels_nanometer")
console.log(pixels_nanometer )
console.log("scale_image")
console.log(scale_image )
console.log("pixels_nanometer*scale_image")
console.log(pixels_nanometer*scale_image)
//data used with info by atoms and plane
var neighbors = data.neighbors

var dist = 0

// convert the nanometers to pixels times whatever scale is used
var x_image = d3.scaleLinear()
  .domain([0, 2*width ])
  .range([ 0, 2*width*pixels_nanometer*scale_image]);

// Add Y axis
var y_image = d3.scaleLinear()
  .domain([0, height  ])
  .range([ 0, height*pixels_nanometer*scale_image ]);

var pix_to_nan =  d3.scaleLinear()
  .domain([0, height*pixels_nanometer*scale_image])
  .range([ 0, height]);

var scaled_to_pix =  d3.scaleLinear()
  .domain([0, height*scale_image])
  .range([ 0, height]);

console.log(pix_to_nan(10))

var group_names = neighbors.map(function(d){ return d.sublattice_df }) // list of group names
console.log(group_names)
var cat_color = d3.scaleOrdinal()
.domain(group_names)
.range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])


var margin ={top: 80, right: 600, bottom: 1500, left: 45};

//svg is created at the	<div id="map"></div> in index.html
//append adds <div id="map"> <svg> <g> </g> </svg> </div> to the div
var svg = d3.select("#map").append("svg")
    .attr("width", height + margin.left +margin.right)
    .attr("height", width + margin.top + margin.bottom)
    //The <g> SVG element is a container used to group other SVG elements.
    //Transformations applied to the <g> element are performed on its child elements
    .append("g")
    .attr("transform","translate("+margin.left+","+margin.top+")")

//add image to the background (could make this a user input)
var myimage = svg.append('image')
    .attr('xlink:href', image)
    .attr('width', x_image(width))
    .attr('height', y_image(height))

var selected_squares = new Array();

var multiSelectPlane = d3.selectAll("#multiSelectPlane")
.attr("transform","translate("+margin.left+","+margin.top+")")


//add data to the user-select bars
multiSelectPlane.selectAll("option")
    .data(zone_all)
    .enter()
    .append("option")
    .attr("value", function(d) { return d; })
    .text(function (d, i)  { return "Zone " + i + ": " + d; })
     .property("selected", function(d){ return d === zone_all[0]; })


function drawCircle(x, y, size) {
       console.log('Drawing circle at', x, y, size);
       svg.append("circle")
           .attr('class', 'click-circle')
           .attr("cx", x)
           .attr("cy", y)

      .style("fill", "yellow")
           .attr("r", size);

       selected_squares.push({
           x: x,
           y: y
         })
          console.log(selected_squares)
   }
   var n = 1
   svg.on('click', function() {
       if (n > 2){
         var coords = d3.mouse(this);
         n = 2
         svg.selectAll("circle.click-circle").remove()
         console.log(coords);
         selected_squares = new Array();
         drawCircle(coords[0], coords[1], 5);

   } else if (n ==2) {

  n = n + 1
  var coords = d3.mouse(this);

  drawCircle(coords[0], coords[1], 5);
  dist = Math.hypot(selected_squares[0].x-selected_squares[1].x, selected_squares[0].y-selected_squares[1].y)
  dist = scaled_to_pix(dist)
  dist_nan = pix_to_nan(dist)
  console.log(dist)

  svg.selectAll("text").remove()
  svg.append("text")
          .attr("x", (x_image(width) / 2))
          .attr("y", 0 - (margin.top / 2))
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .text(Math.round(dist) + " pixels / " + pixels_nanometer  + " = "+ Math.round(dist_nan* 100)/100 + "nm");
         }


       else {
         n = n + 1
          var coords = d3.mouse(this);
          drawCircle(coords[0], coords[1], 5);
       }
   });

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
    console.log(options)
    var neighbors_filter = neighbors.filter(function(d){
    return options.includes(d.combined);
    })

  console.log(neighbors_filter)


     d3.selectAll("line.lineAtoms").remove()

      //line connecting each atom to each other depending on the place the user selects
    var lineAtom = svg
                       .selectAll("line.lineAtoms")
                       .data(neighbors_filter)

    var lineAtomEnter = lineAtom
                        .enter()
                        .append("line")
                        .attr('class', 'lineAtoms')

    lineAtomEnter
            .attr("x1", function (d) { return x_image(d.x_position); })
            .attr("y1", function (d) { return y_image(d.y_position); })
            .attr("x2", function (d) { return x_image(d.x_next); })
            .attr("y2", function (d) { return y_image(d.y_next); })
            .attr("stroke-width", 1)
            .attr('stroke', "white")

    lineAtom.exit().remove();

            }

//if user select from top multi select, the lines for the plane will appear on the image - multiple lines are possible
multiSelectPlane.on("change",function(event) {
  update_atom_line()
})

update_atom_line()
