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
	
	// go through columns.
	$('.columnInfo').each(function (i, $el) {
		var name = $('.columnName', $el).html();
		if (!$('.target', $el).is(":checked")) {
			// it's an input
			inputModel = inputModel.concat(
				analyzeColumn($('.columnName', $el).html(), $('.columnType', $el).val())
			);
		} else {
			// it's an output
			outputModel = outputModel.concat(
				analyzeColumn($('.columnName', $el).html(), $('.columnType', $el).val())
			);
		}
	});
	
	// figure out which inputs/outputs go with which columns.
	
	$.each(inputModel, function (i, m) {
		if (!Array.isArray(inputColumns[m.name])) {
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
	
	//todo: remove UI code. probably:
	// return {inputs: inputModel, outputs: outputModel, testing: testingData, training: trainingData}; 
	
	$('#inputLayerSize').val(inputModel.length);
	$('#outputLayerSize').val(outputModel.length);
	
	$('.createModel').removeClass('btn-primary').addClass('btn-success').html("Model Up To Date");
}

function analyzeColumn(name, type) {
	var models = [];
	if (type === "Ignore") {
		return;
	} else if (type === "Category") {
		var values = findUniqueValues(name);
		$.each(values, function (i, v) {
			
			models.push(
			
			{
				name: name,
				type: type,
				encode: function (val) {
					if (val == v) {
						return 1;
					}
					return 0;
				},
				decode: function () {
					return v;
				}
				
			}
			
			);
		});
		
	} else { // it's linear data
		var adjustments = computeScaleFactor(name);
		if (adjustments) { // if !adjustments, the column was usable and is in the log. Look for "has". TODO: make this info available in the UI.

			models.push(
			
			{
				name: name,
				type: type,
				encode: function (val) {
					if (val != +val) { //can't convert to a number... TODO: document this
						console.info(val + " cannot be reliably converted to a number.");
						return 0; 
					}
					val = +val + adjustments.shift;
					return +val * adjustments.scale;
				},
				decode: function (val) {
					val = val / adjustments.scale;
					return val - adjustments.shift;
				}
			}
			
			);
		}
		
		return models;
	}
}

function findUniqueValues(name) {
	var values =[];
	$.each(data, function (i, d) {
		var point = d[name];
		if (!point) {
			point = null;
		}
		if (values.indexOf(point) < 0) {
			values.push(point);
		}
	});
	return values;
}

function computeScaleFactor(name) {
	var max = -9007199254740991,
		min =  9007199254740991,
		hasNonNull = false;
	$.each(data, function (i, d){
		var point = +d[name]; //unary operator converts to number.
		
		if (point != d[name]) {
			console.info(name + " " + d[name] + " cannot be reliably converted to a number");
			return true;
		}
		
		hasNonNull = true;
		
		if (point < min) {
			min = point;
		}
		if (point > max) {
			max = point;
		}
	});

	var minDelta = 0 - min;
	max += minDelta;
	if (!hasNonNull || max == min) {
		console.log(name, "has no non-null values or is all the same");
		return;
	}
	return {shift: minDelta, scale: 1/roundUp(Math.ceil(max)), max: max, min: min};	
}

function roundUp(x){
    var y = Math.pow(10, x.toString().length-1);
    return Math.ceil(x/y)*y;
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
