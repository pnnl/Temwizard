var neighbors = data.neighbors




//https://www.d3-graph-gallery.com/graph/line_several_group.html
// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;


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
                .data(['inner_angle_center_atom', 'filtered_inner_angle_center_atom', 'sigma_x', 'x_dist_center_atom', 'y_dist_center_atom', 'distance_next',	'distance_prev',	'x_position',	'y_position',	'x_prev',	'y_prev',	'x_next',	'y_next',  'sigma_x',	'sigma_y',	'ellipticity',	'rotation_ellipticity', 'magnitude', 'filtered_magnitude'])
                .enter()
                .append('option')
                .text(function (d) { return d; }) // text showed in the menu
                .attr("value", function (d) { return d; }) // corresponding value returned by the button

                const svg = d3.select("#line_chart")
                .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

                        const t = svg.transition()
                       .duration(750);
                        // List of groups (here I have one group per column)
                        var allGroup = d3.map(neighbors, function(d){return(d.combined)}).keys()

                        var neighbors_filter = neighbors.filter(function(d){return d.combined==allGroup[0]})

                        // group the data: I want to draw one line per group
                        var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
                          .key(function(d) { return d.combined_all;})
                          .entries(neighbors_filter);

                        // Add X axis --> it is a date format
                        var x = d3.scaleLinear()
                          .domain([0, d3.max(neighbors_filter, function(d) { return +d.plane_position_df; })])
                          .range([ 0, width ]);
                        var xAxis = svg2.append("g")
                          .attr("transform", "translate(0," + height + ")")
                          .call(d3.axisBottom(x).ticks(5));

                        // Add Y axis
                        var y = d3.scaleLinear()
                          .domain([0, d3.max(neighbors_filter, function(d) { return +d.inner_angle_center_atom; })])
                          .range([ height, 0 ]);
                        var yAxis = svg2.append("g")
                          .call(d3.axisLeft(y));

                        var group_names = sumstat.map(function(d){ return d.key }) // list of group names
                        var color = d3.scaleOrdinal()
                          .domain(group_names)
                          .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])


function update {

          var selectedGroup = d3.select('#selectPlaneSublattice').property("value")
          var selectedColumn = d3.select("#selectFeature").property("value")
          var neighbors_filter2 = neighbors.filter(function(d){return d.combined==selectedGroup})

          var sumstatFilter = d3.nest() // nest function allows to group the calculation per level of a factor
            .key(function(d) { return d.combined_all;})
            .entries(neighbors_filter2);


          // Add X axis --> it is a date format
          x.domain([0, d3.max(neighbors_filter2, function(d) { return +d.plane_position_df; })])

          // Add Y axis
          y.domain([0, d3.max(neighbors_filter2, function(d) { return +d[selectedColumn]; })])

    svg2.selectAll(".line")
      .data(sumstat)
      .join('path')
      .attr("fill", "none")
      .attr("stroke", function(d){ return color(d.key) })
      .attr("stroke-width", 1.5)
      .attr("d", function(d){
        return d3.line()
          .x(function(d) { return x(+d.plane_position_df); })
          .y(function(d) { return y(+d.inner_angle_center_atom); })
          (d.values)
      })
      );

}

update()


// When the button is changed, run the updateChart function
d3.select("#selectPlaneSublattice").on("change", function(d) {
    // recover the option that has been chosen
    // run the updateChart function with this selected option
    update()
})

d3.select("#selectFeature").on("change", function(d) {
              // recover the option that has been chosen
              // run the updateChart function with this selected option
              update()
          })
