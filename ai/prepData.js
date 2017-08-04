var data;

$(document).ready(function() {
	var fileInput = document.getElementById('inputData');

	fileInput.addEventListener('change', function(e) {
		var file = fileInput.files[0],
			reader = new FileReader();
			
		reader.onload = function(e) {
			$('.columns').html('');
			Papa.parse(e.target.result, {
				worker: false,
				complete: doneParsing,
				header:true,
				skipEmptyLines: true
			});
		} 
		 reader.readAsText(file);   
	});
});

function doneParsing(pdata) {
	data = pdata.data;
	renderColumns(pdata.meta.fields);
}

function renderColumns(fields){
	$.each(fields, function (i, v) {
		$clone = $('.columnTemplate').clone();
		$clone.removeClass('columnTemplate').addClass('columnInfo');
		$('.columnName', $clone).html(v);
		$('.columns').append($clone);
	});
	
	$('select, input').off().change(function() {
		$('.createModel').addClass('btn-primary').removeClass('btn-success').html("Create Model");
	});
}