function validate(el) {
	var trainingResult = latestTrainingOutcome;
	$('table', $(el)).remove();
	
	table = '<table class="table"><tr>';
	
	$.each(outputColumns, function (k, v) {
		table += '<th>Actual ' + k  + '</th><th>Predicted ' + k + '</th>';
	});
	
	table += '</tr>';
	
	var bads = 0,
		total = testingData.length*Object.keys(outputColumns).length;
	
	$.each(testingData, function (i, data) {
		table += '<tr>';
		var predictions = network.activate(data.input);
		
		$.each(outputColumns, function (name, outputIndices) {
			var predicted = getPredictedValue(predictions, outputIndices);
			var actual = getPredictedValue(data.output, outputIndices);
			var bad = "";
			
			if (predicted.type === "Category") {
				if (predicted.value !== actual.value) {
					bad = 'bad';
					bads++;
				}
			} else {	// it's linear, see if we're within 10%.
				var err = predicted.value/actual.value;
				if (err < 0.90 || err > 1.10) {
					bad = 'bad';
					bads++;
				}
			}
			
			table += '<td>' + actual.value + '</td><td class="' + bad + '">' + predicted.value + '</td>';
		});
		
		table += '</tr>';
	});
	
	table += '</table>';
	$(el).append(table);
	
	$('h1', $(el).parent()).html('Validation: ' + (1 - Math.round((bads/total)*100)/100) * 100 + '% within 10% error.');
	
}

function getPredictedValue(predictions, outputIndices) {
		index = outputIndices[0],
		value = predictions[outputIndices[0]];
		
	if (outputIndices.length > 1) { // it's a category. We need to get the max activation and decode that one.
		$.each(outputIndices, function (i, number) {
			if (predictions[number] > value) {
				index = number;
				value = predictions[number];
			} 
		});
	}
	var model = outputModel[index];
	
	return {value: model.decode(value), type: model.type};
}

