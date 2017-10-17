var data = {},
	items = [];

Papa.parse('../vision-export.csv', {
	download:true,
	worker: true,
	complete: doneParsing,
	header:true,
	skipEmptyLines: true
});

function doneParsing(pdata) {
	data = pdata.data;
	odata=pdata;
	$.each(data, function(i, r) {
		var aiEncoded = [];
		item = new VisionItem(r);
		
		$.each(item.splitName, function (i, v) {
			item['splitName' + i] = v;
		});
		
		$.each(item.splitDesc, function (i, v) {
			item['splitDesc' + i] = v;
		});
		
		
		items.push(item);
	});
	
	data = items;
	
	createModel();
	buildNetwork();

	//to train, do this:
	//miniBatchTrain(1, trainer, trainingData, 10, {iterations: 1, rate:0.1, error:0.000001, cost: Trainer.cost.CROSS_ENTROPY});
	
	// to validate:
	// validate($('#validation'));
}

function splitter(s, l) {
	s = s.toLowerCase() // reduce number of required characters
			.replace(/([^0-9a-z \-])/g, '') // lose punctuation and weirdness
			.substring(0, l) // truncate it
			.padEnd(l); // pad with spaces.
	return s.split('');
}


function VisionItem(dataRow) {
	return {
		buyer: dataRow.Buyer,
		origin: dataRow.Origin,
		buyId: dataRow['Buy Agree ID'],
		vendor: dataRow.Vendor,
		name: dataRow.Name,
		status: dataRow.Status,
		desc: dataRow.Descr,
		process: dataRow['Vt process used'],
		type: dataRow['Vt agrmt type'],
		beginDate: dataRow['Begin Dt'],
		expireDate: dataRow['Expire Dt'],
		amount: dataRow['Max. Amt'],
		state: dataRow.State,
		splitName: splitter(dataRow.Name, 26), // 2/3 of names are shorter than 26. some are up to 40
		splitDesc: splitter(dataRow.Descr, 30) // 30 is the max, but there 25% are over 27 so we may as well keep them all.
	}
}
