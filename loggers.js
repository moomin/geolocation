function geolocationTestbedLogger() {
  this.type;

  this.init = function(target) {
    this.output = target;

    this.output.setAttribute('class', 'log-' + this.type);
    this.initOutput();
  }
}

function textLogger() {
  this.type = "text";

  this.initOutput = function() {
  }

  this.log = function(ts, eName, eArgs) {
    var p = document.createElement('p');
    p.innerHTML = ts + ': ' + eName +
    (eArgs === undefined ? '' : '; ' + JSON.stringify(eArgs));
    this.output.appendChild(p);
  }
}
textLogger.prototype = new geolocationTestbedLogger;

function jsonLogger() {
  this.type = 'json';
  var lastNode;

  this.initOutput = function() {
    lastNode = document.createTextNode(']');
    this.output.appendChild(document.createTextNode('['))
    this.output.appendChild(lastNode);
  };

  this.log = function(ts, eName, eArgs) {
    var comma = this.output.childNodes.length > 2 ? ',' : '';
    var text = document.createTextNode(comma + JSON.stringify({'ts':ts,'eName':eName,'eArgs':eArgs}));

    this.output.insertBefore(text,lastNode);
  }
}
jsonLogger.prototype = new geolocationTestbedLogger;

function tableLogger() {
  this.type = 'table';
  var table;

  var createCell = function(element, content) {
    var cell = document.createElement(element);
    cell.innerHTML = content ? content : '';
    return cell;
  }
  this.initOutput = function() {
    var tbl = document.createElement('table');
    var tr = document.createElement('tr');

    tr.appendChild(createCell('th', 'Time'));
    tr.appendChild(createCell('th', 'Event'));
    tr.appendChild(createCell('th', 'Extra'));
    tr.appendChild(createCell('th', 'Map'));

    tbl.appendChild(tr);
    this.output.appendChild(tbl);
    table = tbl;
  }

  this.log = function(ts, eName, eArgs) {
    var row = document.createElement('tr');

    var tdTime = createCell('td', ts);
    var tdEvent = createCell('td', eName);
    var tdExtra = createCell('td');
    var tdLink = createCell('td');

    tdExtra.setAttribute('class', 'extra');
    tdExtra.innerHTML = (eArgs === undefined ? '' : JSON.stringify(eArgs));

    if (eArgs && eArgs.coords !== undefined)
    {
      var link = document.createElement('a');

      link.setAttribute('href', 'https://maps.google.com/?q=' + eArgs.coords.latitude +','+ eArgs.coords.longitude + '&t=h');
      link.setAttribute('target', '_blank');
      link.appendChild(document.createTextNode('map'));

      tdLink.appendChild(link); 
    }

    row.appendChild(tdTime);
    row.appendChild(tdEvent);
    row.appendChild(tdExtra);
    row.appendChild(tdLink);

    table.appendChild(row);
  }

}
tableLogger.prototype = new geolocationTestbedLogger;

function gpxLogger() {
  this.type = 'gpx';
  var footer;

  this.initOutput = function() {
    var pre  = document.createElement('pre');

    var head = document.createTextNode('<?xml version="1.0" encoding="UTF-8" ?><gpx version="1.1" creator="">\n  <trk>\n    <trkseg>\n');
    var foot = document.createTextNode('    </trkseg>\n  </trk>\n</gpx>');

    pre.appendChild(head);
    pre.appendChild(foot);

    footer = foot;
    this.output.appendChild(pre);
    this.output = pre;
  }

  this.log = function(ts, eName, eArgs) {
    var appendix;

    if (eName == 'successCallback')
    {
      var trkpt = '    <trkpt lat="'+ eArgs.coords.latitude
                 +'" lon="'+ eArgs.coords.longitude
                 +'"><time>'+ new Date(eArgs.timestamp).toISOString()
                 +'</time><cmt>'+ JSON.stringify(eArgs) +'</cmt></trkpt>\n';

      //appendix = document.createElement('pre');
      appendix = document.createTextNode(trkpt);
     console.log(appendix, footer); 
    }

    if (appendix !== undefined)
      this.output.insertBefore(appendix, footer);
  }

/*
 <gpx version="1.1" creator=""> 
 <trk>
   <trkseg>
     <trkpt lat="" lon=""><time>toISOString()</time></trkpt>
   </trkseg>
 </trk>
 </gpx>
*/
}
gpxLogger.prototype = new geolocationTestbedLogger;

