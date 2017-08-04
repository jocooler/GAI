function visualize(network) {
	var box = 25;
	var gutter = 20;
	var border = 1;
	var boxSize = {
		w: box,
		h: box,
		vMargin: 250,
		hMargin: 30
	};
	
	var options = {
		color:'white',
		sColor: 'black',
		textColor: 'black',
		font: 'arial',
		fontSize: '8px',
	}
	
	var max = getMaxWidth(network);
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d'); // get the context just once, for performance reasons.
	
	canvas.width = (boxSize.w + boxSize.hMargin*2) * max;
	canvas.height = (boxSize.h + boxSize.vMargin) * (2 + network.layers.hidden.length);
	context.clearRect(0, 0, canvas.width, canvas.height);

	
	var net = network.toJSON(),
		righting = 10,
		bottoming = 32,
		layer = "input",
		stepSize = (canvas.width - boxSize.w - boxSize.hMargin) / (network.layers.input.size - 1),
		firstOutput = 0;

	$.each(net.neurons, function (i, neuron) {
		if (neuron.layer != layer) {
			bottoming += (boxSize.h + boxSize.vMargin);
			righting = 10;
			layer = neuron.layer;
			if (layer == "output") {
				firstOutput = i;
				var newStep = (canvas.width - boxSize.w - boxSize.hMargin)/(network.layers.output.size - 1);
				if (newStep > stepSize * 2) {
					stepSize = stepSize * 2;
					righting = (canvas.width - network.layers.output.size * stepSize + boxSize.w) /2;
				} else {
					stepSize = newStep;
				}
			} else {
				var newStep = (canvas.width - boxSize.w - boxSize.hMargin)/(network.layers.hidden[layer].size - 1);
				if (newStep > stepSize * 2) {
					stepSize = stepSize * 2;
					righting = (canvas.width - network.layers.hidden[layer].size * stepSize + boxSize.w) /2;
				} else {
					stepSize = newStep;
				}
			}
		}
		neuron.x = righting;
		neuron.w = boxSize.w;
		neuron.y = bottoming;
		neuron.h = boxSize.h;
		neuron.cx = righting + boxSize.w/2;
		neuron.cy = bottoming + boxSize.w/2;
		
		righting += stepSize;
		
	});
	
	var maxConnection = 0;
	$.each(net.connections, function (i, connection) {
		maxConnection = Math.max(maxConnection, Math.abs(connection.weight));
	});
	
	var connectionScaleFactor = 2 / maxConnection;
	
	
	$.each(net.connections, function (i, connection) {
		var f = net.neurons[connection.from],
			t = net.neurons[connection.to],
			color = "blue";

		if (connection.weight < 0) {
			color = "red"
		}
		connect(f.cx, f.cy, t.cx, t.cy, connection.weight * connectionScaleFactor, context, options, boxSize.w, color);
		
	});
	
	context.lineWidth = 2;
	$.each(net.neurons, function(i, neuron) {
		drawBox(neuron.x, neuron.y, boxSize.w, boxSize.h, 0, 0, options, context);
	});
	
	context.fillStyle = "black";
	context.font = "12px serif";
	context.textBaseline = "center";
	context.textAlign = "center";
	
	$.each(inputModel, function (i, input) {
		if (input.type == "Category") {
			var t = input.decode(); 
		} else {
			var t = input.name;
		}
		
		var y = net.neurons[i].y + ((i%2 == 1) ? boxSize.h * 2 : -1 * boxSize.h /2);
		
		drawLabel(t, net.neurons[i].x + boxSize.w / 2, y, context, options)
		
	});
	
	$.each(outputModel, function (i, output) {
		if (output.type == "Category") {
			var t = output.decode(); 
		} else {
			var t = output.name;
		}
		
		var y = net.neurons[i+firstOutput].y + boxSize.h * 2;
		
		drawLabel(t, net.neurons[i+firstOutput].x + boxSize.w / 2, y, context, options)
		
	});
	
	
	//add the table of %s
	
	tableImportance();
}


function drawBox(x, y, w, h, b, i, options, context) { // x,y is center top, b is the box, i is the index of the layer we're in.

	context.fillStyle = options.color;
	//context.fillRect(x, y, w, h);
	context.beginPath()
	context.arc(x + w/2, y + w/2, w/2, 0,2 * Math.PI);
	context.fill();
	context.strokeStyle = options.sColor;
	//context.strokeRect(x, y, w, h);
	context.arc(x + w/2, y + w/2, w/2, 0, 2 * Math.PI);
	context.stroke();
/*
	context.fillStyle = options.textColor;
	context.font = options.fontSize + "px " + options.font;
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText(b._name, x, y+h/2); // center the text, place it 12px above center. */
}

function connect(x1, y1, x2, y2, width, context, options, radius, color) {
	context.lineWidth = width;
	context.strokeStyle = color || options.sColor;
	context.beginPath();
	context.moveTo(x1,y1 + radius/2 - 2);
	context.lineTo(x2,y2 - radius/2 + 2);
	context.stroke();
}

function drawLabel(text, x, y, context, options) {
	context.fillText(text, x, y)
}

function getMaxWidth(network) {
	var max = Math.max(network.layers.input.size,network.layers.output.size);
	$.each(network.layers.hidden, function (i, hiddenLayer) {
		max = Math.max(hiddenLayer.size, max);
	});
	return max;
}