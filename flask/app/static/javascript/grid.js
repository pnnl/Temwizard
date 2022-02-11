//height and width are imported at index.html, which is calculated in app.py, and can still be accessed here
var height = dim.height
var width = dim.width
var dist = 50


//using the margin convention: https://bl.ocks.org/mbostock/3019563
var margin ={top: 100, right: 50, bottom: 50, left: 50};

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
    .attr('xlink:href', dim.image)
    .attr('width', width)
    .attr('height', height)
var selected_squares = new Array();
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

      console.log(coords);
      drawCircle(coords[0], coords[1], 5);
      console.log(n)

               console.log(selected_squares[0])
              dist = Math.hypot(selected_squares[0].x-selected_squares[1].x, selected_squares[0].y-selected_squares[1].y)

console.log(dist)

svg.selectAll("text").remove()
svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(dist);





       } else {

         n = n + 1
          var coords = d3.mouse(this);

          console.log(coords);
          drawCircle(coords[0], coords[1], 5);
          console.log(n)


       }


   });

//
// function update(width_input){
//
//   //function to create data that will be used to make the squares
//   function gridData(width_input) {
//     //update var for total rows and columns
//     total_columns = Math.floor(width/width_input)
//     total_rows = Math.floor(height/width_input)
//
//     var data = new Array();
//     var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
//     var ypos = 1;
//     var width_square = width_input;
//     var height_square = width_input;
//     var click = 0;
//
//     // iterate for rows
//     for (var row = 0; row < total_rows; row++) {
//
//
//       // iterate for cells/columns inside rows
//       for (var column = 0; column < total_columns; column++) {
//         data.push({
//           x: xpos,
//           y: ypos,
//           width: width_square,
//           height: height_square,
//           type: document.getElementById('fname').value,
//           click: click
//         })
//         // increment the x position. I.e. move it over by 50 (width variable)
//         xpos += width_square;
//       }
//       // reset the x position after a row is complete
//       xpos = 1;
//       // increment the y position for the next row. Move it down 50 (height variable)
//       ypos += height_square;
//     }
//     return data;
//   }
//
//   var gridData = gridData(width_input);
//   //remove and delete the previously drawn rectangles
//   d3.selectAll("rect.mygrid").remove()
//
//   var row_data = svg
//   //the rect in class "mygrid" will be created in the next step, but you select it before creating it
//   .selectAll("rect.mygrid")
//   .data(gridData)
//
//   //for each row in the data, a rect is created
//   var row_enter = row_data
//   .enter()
//   .append("rect")
//   .attr("class", "mygrid")
//
//   //introduce the features associated with the square
//   row_enter
//   .attr("x", function(d) { return d.x; })
//   .attr("y", function(d) { return d.y; })
//   .attr("width", function(d) { return d.width; })
//   .attr("height", function(d) { return d.height; })
//   .style("fill", "#fff")
//   .style("stroke", "yellow")
//   .attr("fill-opacity", 0)
//   .on('click', function(d) {
//   selected_squares.push({
//     x: d.x,
//     y: d.y,
//     type: document.getElementById('fname').value,
//     new_height: height
//
//   })
//      d3.select(this).style("fill", document.getElementById('fname').value).attr("fill-opacity", .4)
//   });
//
//   row_enter.exit().remove();
//   }
//
//   //use the value from the slider to set the total number of squares that fit in the image
//   var width_input = document.getElementById('mySlider').value
//   var total_rows = Math.floor(width/width_input)
//   var total_columns = Math.floor(height/width_input)
//
//   // collect selected squares here
//   var selected_squares = new Array();
//
//   //initially using 50 pixels
//   update(50)
//
//
//   // Listen to the slider
//   d3.select("#mySlider").on("change", function(d){
//     //get brand new array to collect selected squares
//     selected_squares = new Array();
//     //use value on slider to decide width and number of squares
//     selectedValue = this.value
//     update(parseFloat(selectedValue))
//   })

  //
  // function drawCircle(x, y) {
  //       console.log('Drawing circle at', x, y);
  //       svg.append("circle")
  //           .attr('class', 'click-circle')
  //           .attr("cx", x)
  //           .attr("cy", y)
  //           .attr("r", 4);
  //   }
  //
  //   svg.on('click', function() {
  //       var coords = d3.mouse(this);
  //
  //       console.log(coords);
  //       drawCircle(coords[0], coords[1], 2);
  //   });
