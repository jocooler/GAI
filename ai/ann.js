//var network = new Architect.Perceptron(inputNames.length, 10, 10, outputNames.length)
//var trainer = new Trainer(network)
//console.log(miniBatchTrain(10, trainer, trainingData, 20, {iterations: 1, rate:.01, error:Trainer.cost.CROSS_ENTROPY}), trainer.test(testingData));
var network,
	trainer,
	latestTrainingOutcome;

function download(text, name) { // from http://stackoverflow.com/questions/34156282
    var a = document.createElement("a");
    var file = new Blob([text], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}

function buildNetwork() {
	if (training) {
		var inputLayer = new Layer(inputModel.length);
		var outputLayer = new Layer(outputModel.length);
			hidden = [];
		
		$([20, 10]).each(function (i, n) { //hidden layers
			hidden.push(new Layer(n));
			if (i >= 1) {
				hidden[i-1].project(hidden[i], Layer.connectionType.ALL_TO_ALL);
			}
		});
		
		if (hidden.length > 0) {
			inputLayer.project(hidden[0], Layer.connectionType.ALL_TO_ALL);
			hidden[hidden.length - 1].project(outputLayer, Layer.connectionType.ALL_TO_ALL);
		} else {
			inputLayer.project(outputLayer, Layer.connectionType.ALL_TO_ALL);
		}
		
		network = new Network({
			input: inputLayer,
			hidden: hidden,
			output: outputLayer
		});
	}
	trainer = new Trainer(network);
}

function trainNetwork(callback) {
	var iterations = $('#iterations').val(),
		batchSize = $('#batchSize').val(),
		rate = $('#learning').val(),
		error = $('#errorRate').val();
	
	var r = miniBatchTrain(iterations, trainer, trainingData, batchSize, {iterations: 1, rate:rate, error:error, cost: Trainer.cost.CROSS_ENTROPY});
	
	latestTrainingOutcome = r;
	
	if (callback) {
		callback(r);
	} 
}

function showErrorRate(trainingResult) {
	$('span', $('#errorRate').parents('label')).remove();
	$('#errorRate').parents('label').append(' <span style="color:#0D0"> &nbsp; ' + trainingResult.error + '</span>');
}
