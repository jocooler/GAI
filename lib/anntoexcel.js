function toXL(network) {
  var j = network.toJSON(),
      n = j.neurons,
      c = j.connections,
      layers = [],
      outstring = '';
      
  for (var i = 0; i<n.length; i++) { 
    n[i].id = i; // set the ids of the neurons for easy access
    n[i].incomingConnections = c.filter(function (e) { // store all connections to the neuron internally, also for easy access.
      return e.to == i;  // numbers and strings, and so on throughout
    })
  }
  
  var inputs = n.filter(function (e) {
    return e.layer === 'input';
  });
  
  layers.push(inputs);
  
  for (var i = 0; ; i++) {
    var nl = n.filter(function (e) {return e.layer == i});
    
    if (!nl.length) {
      break;
    } else {
      layers.push(nl);
    }
  } 
  
  var outputs = n.filter(function(e) {
    return e.layer === 'output';
  });
  
  layers.push(outputs);
  
  /* Set Rows and Columns */
  
  for (var i = 0; i<layers.length; i++) { // setting rows and columns
    for (var j = 0; j<layers[i].length; j++) {
      layers[i][j].row = i + 1;
      colStr = '';
      if (j >= 26) {
        colStr = String.fromCharCode(97 + Math.floor(j/26) -1); // this gets us to 676 neurons in a layer. I think that should be enough for an excel file.
      }
      layers[i][j].col = colStr + String.fromCharCode(97 + j%26); // 97 = a
    }
  }
  
  for (var i = 0; i<c.length; i++) {
    for (var j = 0; j < n.length; j++) {
      if (n[j].id == c[i].to) {
        c[i].toRC = n[j].col + n[j].row;
      } else if (n[j].id == c[i].from) {
        c[i].fromRC = n[j].col + n[j].row;
      }
    }
  }

  /* Start Building String */
  
  for (var i = 0; i<layers[0].length; i++) { // input layer, just tabs
    outstring += "\t";
  }
  
  outstring += "\n";
  
  for (var i = 1; i < layers.length; i++) { // all other layers
    for (var j = 0; j < layers[i].length; j++) {
      outstring += "=1/(1+EXP(-1*(";
      //outstring += "=TANH((("
      for (var k=0; k < layers[i][j].incomingConnections.length; k++) {
        var cxn = layers[i][j].incomingConnections[k];
        outstring += cxn.fromRC + "*" + Math.round(cxn.weight*100000)/100000 + "+";
      }
      
      outstring += layers[i][j].bias + "))) \t";
    }
    
    outstring += "\n";
  }
  return outstring;
}