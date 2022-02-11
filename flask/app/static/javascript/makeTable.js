

function makeTable(id) {


	var data, sort_by, filter_cols; // Customizable variables

	var table; // A reference to the main DataTable object


	// Main function, where the actual plotting takes place.
	function _table(targetDiv) {
	  // Create and select table skeleton
	  var tableSelect = targetDiv.append("table")
	    .attr("class", "display compact")
	    .attr("id", id)
	    .style("visibility", "hidden"); // Hide table until style loads;

	  // Set column names
	  var colnames = Object.keys(data[0]);
		if(typeof filter_cols !== 'undefined'){
			// If we have filtered cols, remove them.
			colnames = colnames.filter(function (e) {
				// An index of -1 indicate an element is not in the array.
				// If the col_name can't be found in the filter_col array, retain it.
				return filter_cols.indexOf(e) < 0;
			});
		}


		// Here I initialize the table and head only.
		// I will let DataTables handle the table body.
	  var headSelect = tableSelect.append("thead");
	  headSelect.append("tr")
	    .selectAll('td')
	    .data(colnames).enter()
		    .append('td')
		    .html(function(d) { return d; });

		if(typeof sort_by !== 'undefined'){
			// if we have a sort_by column, format it according to datatables.
			sort_by[0] = colnames.indexOf(sort_by[0]); //colname to col idx
			sort_by = [sort_by]; //wrap it in an array
		}


	  // Apply DataTable formatting: https://www.datatables.net/
	  $(document).ready(function($) {

        $.noConflict();
        
	    $("#".concat(id)).DataTable({
	    destroy: true,


				// Here, I am supplying DataTable with the data to fill the table.
				// This is more efficient than supplying an already contructed table.
				// Refer to http://datatables.net/manual/data#Objects for details.
	    data: data,
        dom: 'Bfrtip',
        buttons: [{
        extend: 'csvHtml5',
        text: "Download CSV"
        
        }],
	      columns: colnames.map(function(e) { return {data: e}; }),
	      "order": sort_by
	    });

	    tableSelect.style("visibility", "visible");
	  });
	}


	/**** Setter / getters functions to customize the table plot *****/
	_table.datum = function(_){
    if (!arguments.length) {return data;}
    data = _;

    return _table;
	};
	_table.filterCols = function(_){
    if (!arguments.length) {return filter_cols;}
    filter_cols = _;

    return _table;
	};
	_table.sortBy = function(colname, ascending){
    if (!arguments.length) {return sort_by;}

		sort_by = [];
		sort_by[0] = colname;
		sort_by[1] = ascending ? 'asc': 'desc';

    return _table;
	};


	// This is the return of the main function 'makeTable'
	return _table;
}
