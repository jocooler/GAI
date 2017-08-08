function computeRelativeImportance(inputModel, outputModel, splitCategories) {
	var relative = {};
	for (var n in network.layers.input.list) {
		
		network.layers.input.list[n].relativeImportance = {};
		
		if (splitCategories && inputModel[n].type === "Category") {
			network.layers.input.list[n].relativeImportance[inputModel[n].name + " - " + inputModel[n].decode(1)] = 1;
		} else {
			network.layers.input.list[n].relativeImportance[inputModel[n].name] = 1;
		}
	}
	
	for (var hidden of network.layers.hidden) {
		relativeImportance(hidden);
	}
	
	relativeImportance(network.layers.output);
	
	// compute percentages:
	for (var n in outputModel) {
		var name = outputModel[n].name,
			neuron = network.layers.output.list[n],
			total = 0;
		
		if (splitCategories && outputModel[n].type === "Category") {
			name += " - " + outputModel[n].decode(1);
		}
		relative[name] = computePercentages(neuron.relativeImportance);
	}
	
	return relative;
}

function relativeImportance(layer) {
	for (var neuron of layer.list) {
		neuron.relativeImportance = {}; // empty the object for this neuron
		for (var c in neuron.connections.inputs) {
			connection = neuron.connections.inputs[c];
			var previousImportance = connection.from.relativeImportance; // get the importance computed for the previous layer
			for (input in previousImportance) { // for each importance in the previous layer
				if (neuron.relativeImportance[input]) {
					neuron.relativeImportance[input] += previousImportance[input] * connection.weight; // if it's a category, add them up
				}
				neuron.relativeImportance[input] = previousImportance[input] * connection.weight; // otherwise, it's the first time through, just set it to the previous importance * weight
			}
		}
	}
}

function computePercentages(relativeImportance) {
	var total = 0,
		importance = {};
		
	for (var v in relativeImportance) {
		total += Math.abs(relativeImportance[v]);
	}
	
	for (var v in relativeImportance) {
		importance[v] = Math.round(relativeImportance[v]/total * 10000)/100;
	}
	return importance;
}

function tableImportance() {
	var importance = computeRelativeImportance(inputModel, outputModel, false),
		html = '<table id="relativeImportance" class="table"><thead><tr><td><strong>Output</strong></td>',
		first = Object.keys(importance)[0];
	
	for (var key in importance[first]) {
		html += '<td>' + key + '</td>';
	}
	html += '</tr></thead><tbody>';
	
	for (var row in importance) {
		html += '<tr><td><strong>' + row + '</strong></td>';
		for (var key in importance[row]) {
			html += '<td>' + importance[row][key] + '</td>';
		}
		html += '</tr>';
	}
	
	html += '</tbody></table>';
	
	$('#relativeImportance').remove();
	$('body').append(html);
	return html;
}