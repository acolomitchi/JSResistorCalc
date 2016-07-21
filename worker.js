importScripts('rescomb.js');

var $rc=init$rc();

var savedTolerance=null;

onmessage=function(e) {
  if(typeof(e.data)!="undefined") {
    if("start"==e.data.cmd) {
      // take the parameters and start
      var numRes=e.data.numRes;
      var target=e.data.target;
      var tolerance=e.data.tolerance;
      var combType=e.data.combType;
      var srcVals;
      if("E24"==e.data.srcVals) {
        srcVals=$rc.E24Series;
        numRes=Math.min(3, numRes);
      }
      else if("E12"==e.data.srcVals) {
        srcVals=$rc.E12Series;
        numRes=Math.min(4, numRes);
      }
      else if($rc.util.isArray(e.data.srcVals)) {
        srcVals=e.data.srcVals;
      }
      start(numRes, target, tolerance, srcVals, combType);
    }
  }
}

/* 
 * the Serial/Parallel instances don't survive the transfer
 * to the worker's master. Thus transferring the data
 * as a map-object, with the combination specified as string
 */
function convert(vals) {
  var valObjs=[];
  vals.forEach(function(e) {
    var c=e.v.toString();
    var v=e.v.getValue();
    var min=e.v.getMinValue(savedTolerance);
    var max=e.v.getMaxValue(savedTolerance);
    min=Math.round(min*100000)/100000;
    max=Math.round(max*100000)/100000;
    valObjs.push( {
        c:c,
        v:v,
        min:min,
        max:max
      }
    );
  });
  return valObjs;
}
function progress(numCombs, vals) {
  postMessage({
      type:"progress",
      combs: numCombs, 
      vals: convert(vals)
    }
  );
}

function done(numCombs, vals) {
  postMessage({
      type:"done", 
      combs: numCombs, 
      vals: convert(vals)
    }
  );
}

function start(numResistors, targetValue, tolerance, srcVals, combType) {
  savedTolerance=tolerance;
  $rc.makeValues(
    numResistors, targetValue, tolerance, srcVals, 
    64, combType, progress, done
  );
}