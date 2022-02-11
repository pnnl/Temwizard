"use strict";

/*
 * This is the client side js file for the pyCHIP webapp. It communicates with the pyCHIP app
 * and facilitates the transfer and display of information on the app.
 *
 *
 * TODO:
 * always be listening for the click on the 'go' button
 * when go button is clicked, send grid size to chipper
 * get the chipped images back from chipper
 * for each image: add figure to chip div with image and class 'chip' and click listener
 */

(function() {

  window.addEventListener('load', init);

  /**
   * populates the home page with book covers and adds functionality to the home button
   */
  function init() {
    id('go').addEventListener('click', chipIt);
  }

  function chipIt() {
    // getChips()

    // these are from the grid slider from Marjolein
    var total_rows = 16;
    var total_columns = 16;
    showChips(total_rows, total_columns);
  }


  function selectChip() {
    this.classList.add('selected');
    this.classList.remove('selectable');
  }

  /**
   * Populates the chip view with the chips
   * @param {object} number of rows and columns in the grid (kind of backwards)
   */
  function showChips(total_rows, total_columns) {
    // iterate through each row and column to get the image names
    for (let i=0; i < total_rows; i++) {
        let row = document.createElement('div');
        row.classList.add('img_row');

        for (let j=0; j < total_columns; j++) {
            let img_name = 'cropX_' + i + '_Y_' + j;
            let chipFig = document.createElement('fig');
            let chipImg = document.createElement('img');
            var getUrl = window.location;
            var baseUrl = getUrl .protocol + "//" + getUrl.host + "/"
            chipImg.src = baseUrl + 'static/all_queries/' + img_name + '.jpg';
            console.log("this is the string")
            console.log(chipImg.src)
            chipImg.alt = img_name;
            chipFig.appendChild(chipImg);
            chipFig.id = img_name;
            chipFig.classList.add('selectable');
            chipFig.addEventListener('click', selectChip);
            row.appendChild(chipFig);
           }
        id('chips_holder').appendChild(row);
    }

    for (let i = 0; i < chips.length; i++) {
      let title = chips[i];
      /**let title = chips[i]['title'];**/

    }
  }


  // --------------------------- helper functions -------------------------- //
  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} response - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  function checkStatus(response) {
    if (response.ok) {
      return response;
    } else {
      throw Error("Error in request: " + response.statusText);
    }
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }
})();
