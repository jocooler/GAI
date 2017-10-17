function validate(el) {
	var trainingResult = latestTrainingOutcome;
	$('table', $(el)).remove();
	
	table =  '<table class="table">';
	table += '<tr><th>Buyer</th><th>Origin</th><th>Buy Agreement</th><th>Vendor</th><th>Name</th><th>Status</th><th>Descr</th><th>Vt process used</th><th>Vt agrmt type</th><th>Begin Dt</th><th>Expire Dt</th><th>Max. Amt</th><th>State</th><th>Likeliness of being an IT Project</th></tr>';
	
	$.each(data, function (i, d) {
		var ITness = 0;
		
		try {
			ITness = network.activate(d.inputs);
		} catch (e) {
			console.error(e, d, i);
			return true;
		}
		
		var className = (ITness > 0.5) ? 'it-yes' : 'it-no'; // todo: classes based on certainty - close to 0.5 on both sides get colored.
			
		table += '<tr class="' + className + '">'
		table += '<td>' + d.buyer + '</td>';
		table += '<td>' + d.origin + '</td>';
		table += '<td>' + d.buyId + '</td>';
		table += '<td>' + d.vendor + '</td>';
		table += '<td>' + d.name + '</td>';
		table += '<td>' + d.status + '</td>';
		table += '<td>' + d.desc + '</td>';
		table += '<td>' + d.process + '</td>';
		table += '<td>' + d.type + '</td>';
		table += '<td>' + d.beginDate + '</td>';
		table += '<td>' + d.expireDate + '</td>';
		table += '<td>' + d.amount + '</td>';
		table += '<td>' + d.state + '</td>';
		table += '<td>' + Math.round(ITness*1000)/10 + '%</td>';
		table += '</tr>'
		
		if (training) {
			if (i > 100) return false;
		}
	});
	
	table += '</table>';
	$(el).append(table);
	
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

