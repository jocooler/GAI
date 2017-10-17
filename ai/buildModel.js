var inputModel,
	outputModel,
	inputColumns = {},
	outputColumns = {},
	trainingData = [],
	testingData = [];


	/*
	Model {
		type: "Linear" | "Category",
		encode: function(val)
		decode: function(val)
		name: (string) columnName
	}
	*/
	
function createModel() {
	//do some cleanup
	inputModel = [];
	outputModel = [];
	inputColumns = {};
	outputColumns = {};
	trainingData = [];
	testingData = [];

	
	$.each(data, function (i, dataPoint) {
		dataPoint.inputs  = [];
		dataPoint.outputs = [];
	});
	
	//prepare models of all columns. this is pre-done so the same AI can be used again for additional data with potentially more values without rebuilding the network, but for best results the network should be retrained regularly.
	inputModel = inputModel.concat(
		analyzeColumn('buyer', 'buyers'),
		analyzeColumn('vendor', 'vendors'),
		analyzeColumn('origin', 'origins'),
		analyzeColumn('buyer', 'buyers'),
	);
	
	$.each(data[0], function (k, v) { // encode each character, using the first item as a model
		if (k.indexOf('split') === 0) { // find all the "split" columns
			inputModel = inputModel.concat(analyzeColumn(k, 'characters'));
		}
	});
	
	outputModel = analyzeColumn('type', 'output');
		
	// figure out which inputs/outputs go with which columns.
	
	$.each(inputModel, function (i, m) {
		if (m && !Array.isArray(inputColumns[m.name])) {
			inputColumns[m.name] = [];
		}
		
		inputColumns[m.name].push(i);
	});
	
	$.each(outputModel, function (i, m) {
		if (!Array.isArray(outputColumns[m.name])) {
			outputColumns[m.name] = [];
		}
		
		outputColumns[m.name].push(i);
		outputColumns[m.name].type = m.type;
	});
	
	// prepare data according to model.
	prepareData(data, inputModel, outputModel);
	
	// split into testing and training datasets
	$.each(data, function (i, dataPoint) {
		var a = {input: dataPoint.inputs, output: dataPoint.outputs};
		if (Math.random() < 0.1) { //get 10% testing data by default.
			testingData.push(a);
		} else {
			trainingData.push(a);
		}
	});
	modelReady = true;
	$(document).trigger('modelReady');
}

function analyzeColumn(name, type) {
	var models = [];
	
	if (type === "output") { // encode output specially
		return [{ // immediately returns this hard-coded object.
			name: "type", // at the moment we're just using type to determine a training set.
			type: 'Linear',
			encode: function (val) {
				if (val === 'Info tech' || val === 'Data usage') {
					return 1;
				}
				return 0;
			},
			decode: function (v) {
				return v;
			}
			
		}];
	}
	
	// everything else.
	
	var values = encodings[type];
	$.each(values, function (i, v) {
		models.push({
			name: name,
			type: 'Category',
			encode: function (val) {
				if (val == v) {
					return 1;
				}
				return 0;
			},
			decode: function () {
				return v;
			}
			
		});
	});
	return models;
}


function prepareData(data, inputModel, outputModel) {
	$.each(data, function (i, dataPoint) {
		$.each(inputModel, function (i, model) {
			var p = model.encode(dataPoint[model.name]);
			dataPoint.inputs.push(p);
		});
		
		$.each(outputModel, function (i, model) {
			var p = model.encode(dataPoint[model.name]);
			dataPoint.outputs.push(p);
		});
	
	});
	
}
