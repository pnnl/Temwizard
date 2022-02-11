

//if want to reduce image by ratio
//chnage to domain/range
var scale_image = data.scale_image

var pixels_nanometer = data.pixels_nanometer

//convert height and width from pixels to nanometers
var height = data.height/pixels_nanometer
var width = data.width/pixels_nanometer

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

function drawCircle(x, y, size) {
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
         selected_squares = new Array();
         drawCircle(coords[0], coords[1], 5);

   } else if (n ==2) {

  n = n + 1
  var coords = d3.mouse(this);

  drawCircle(coords[0], coords[1], 5);
  var dist = Math.hypot(selected_squares[0].x-selected_squares[1].x, selected_squares[0].y-selected_squares[1].y)
  dist = scaled_to_pix(dist)

  document.getElementById('test').value = dist


  svg.selectAll("text").remove()
  svg.append("text")
          .attr("x", (width / 2))
          .attr("y", 0 - (margin.top / 2))
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .text(dist);
         }

       else {
         n = n + 1
          var coords = d3.mouse(this);
          drawCircle(coords[0], coords[1], 5);
       }
   });
