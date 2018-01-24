//**************Changing Display status**************
$(function () {
	function toggleLink() {
	    $('#show-less').toggle();
	    $('#show-more').toggle();
	}

	$('#show-more').click(toggleLink);
	$('#show-less').click(toggleLink);
});