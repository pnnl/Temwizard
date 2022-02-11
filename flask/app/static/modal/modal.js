/**
 * Creates a modal
 * @param {(string|HTMLElement|JQuery)} [$header] An HTML string or jQuery for the header
 * @param {(string|HTMLElement|JQuery)} body An HTML string or jQuery for the body
 * @returns {JQuery} A jQuery selection of the modal
 */
function modal($header, body) {
	// Create a semi-transparent curtain to cover the screen
	var $main = $("<div/>", { class: "modal v-align-mid", title: "Close" })
		.on("click", function() { closeModal($(this)); });
	// Create the box for the modal itself
	var $modal = $("<div/>", { class: "modal-container", title: "" }).appendTo($main)
		.on("click", function(event) { event.stopPropagation(); });

	// Add a header
	var $header = $("<div/>", { class: "modal-head" }).appendTo($modal).append($header);
	// Add the X button
	$("<button/>", { text: "✖", class: "close-button" }).appendTo($header)
		.on("click", function () { closeModal($(this).parents(".modal")); });
	// Add the body
	$("<div/>", { class: "modal-body" }).appendTo($modal).append(body);
	// Return the modal so it can be manipulated by what it was called by however it wants
	return $main.appendTo(".modals");
}
/**
 * Closes a modal (just removes it, but if it were to ever do anything else, its here)
 * @param {JQuery} $modal The modal to be closed
 */
function closeModal($modal) {
	$modal.remove();
}