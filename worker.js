importScripts('rescomb.js');

var savedTolerance=null;
var savedTarget=null;

onmessage=function(e) {
  if(typeof(e.data)!="undefined") {
    if("start"==e.data.cmd) {
      // take the parameters and start
      var numRes=e.data.numRes;
      var target=e.data.target;
      var tolerance=e.data.tolerance;
      var srcVals;
      if("E24"==e.data.srcVals) {
        srcVals=$rc.E24Series;
        numRes=Math.min(3, numRes);
      }
      else /* if("E12"==e.data.srcVals) */ {
        // TODO handle the case of provided custom value array
        srcVals=$rc.E12Series;
        numRes=Math.min(4, numRes);
      }
      start(numRes, target, tolerance, srcVals);
    }
  }
}

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
        v:(new $rc.Val(v)).toString()+"<br>("+v+")",
        eps:e.eps,
        min:min+"<br>("+Math.round((min-savedTarget)/savedTarget*1000000)/10000+"%)",
        max:max+"<br>("+Math.round((max-savedTarget)/savedTarget*1000000)/10000+"%)"
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

function start(numResistors, targetValue, tolerance, srcVals) {
  savedTolerance=tolerance;
  savedTarget=targetValue;
  $rc.makeValues(
    numResistors, targetValue, tolerance, srcVals, 
    64, progress, done
  );
}