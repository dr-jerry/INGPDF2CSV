let dropArea = document.getElementById('drop-area');
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
   dropArea.addEventListener(eventName, preventDefaults, false)
});

function preventDefaults (e) {
   e.preventDefault()
   e.stopPropagation()
}
['dragenter', 'dragover'].forEach(eventName => {
   dropArea.addEventListener(eventName, highlight, false)
});

['dragleave', 'drop'].forEach(eventName => {
   dropArea.addEventListener(eventName, unhighlight, false)
});

function highlight(e) {
   dropArea.classList.add('highlight');
}

function unhighlight(e) {
  dropArea.classList.remove('highlight');
}
dropArea.addEventListener('drop', handleDrop, false)
var reader = new FileReader();
reader.onload = function(evt) {
    var lines = evt.target.result.split(/1 0 0 1 1\.42.*\n(?=\(\d{2}-\d{2}-\d{4}\))/);
    console.log("length is " + lines.length);
    var table = document.getElementById("resp-table-body");
    var blob = ["Datum;Naam;Soort;Bedrag;IBAN;Omschrijving\n"];
    lines.forEach(transaction => { blob.push(parseLine(transaction, table)); })
    saveAs(new Blob(blob, {type: 'text/plain'}), 'mutaties.csv');
}
function handleDrop(e) {
  let dt = e.dataTransfer
  let files = dt.files

  handleFiles(files)
}
function parseLine(line, node) {
    var lineNr = 0;
    var date = line.match(/^\((\d{2}-\d{2}-\d{4})\)/);
    if (date) {
	let bedrag = 0.0
	var row = document.createElement("div");
	row.classList.add("resp-table-row");
	var cells = [], colls = [];
	for (i=0;i<6;i++) {
	    colls[i] = "";
	    cells[i] = document.createElement("div");
	    cells[i].classList.add("table-body-cell");
	    row.appendChild(cells[i]);
	}
	try {
	    let bedragField = line.match(/^1 0 0 1 4[6789]\d.*\n\(([-+]) ([\d,.]+)\)/m)
	    bedrag = (bedragField[1].startsWith('-') ? -1 : 1)
		* parseFloat(bedragField[2].replace(".","").replace(",","."));
	} catch (e) {
	    console.log(lineNr + " error is " + e +"\n" +line);
	}
	var matched,
	    oms = "",
	    omsre = /^1 0 0 1 62.\d*.*\n\((.*?)\)/gm,
	    index = 1,
	    iban;
	    
        //Datum;Naam;Soort;Bedrag;IBAN;Omschrijving
	while (matched = omsre.exec(line)) {
	    if (iban = matched[1].match(/IBAN: (.*)/)) {
		cells[4].append(document.createTextNode(iban[1]));
		colls[4] = iban[1];
	    } else {
		cells[index].append(document.createTextNode(matched[1]));
		colls[index] += matched[1];
	    }
	    if (index === 5) cells[index].append(document.createElement('br'));
	    index = 5;
	}
	var soort = line.match(/^1 0 0 1 323\.\d.*\n\((.+?)\)/m)[1];
	cells[2].append(document.createTextNode(soort));
	colls[2] = soort;
	cells[3].append(document.createTextNode(`${bedrag}`));
	colls[3] = `${bedrag}`
	cells[0].appendChild(document.createTextNode(date[1]));
	colls[0] = date[1] ? date[1] : "";
	node.appendChild(row);
	lineNr += 1;
	return colls.join(";") + "\n";
    }
}

function handleFiles(files) {
([...files]).forEach((file) => {
	    reader.readAsText(file);

})
}
