/**
 * 
 */

var $rc=(
  function() {
    // Polyfill https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
    if (typeof Object.create != 'function') {
      Object.create = (function(undefined) {
        var Temp = function() {};
        return function (prototype, propertiesObject) {
          if(prototype !== Object(prototype) && prototype !== null) {
            throw TypeError('Argument must be an object, or null');
          }
          Temp.prototype = prototype || {};
          if (propertiesObject !== undefined) {
            Object.defineProperties(Temp.prototype, propertiesObject);
          } 
          var result = new Temp(); 
          Temp.prototype = null;
          // to imitate the case of Object.create(null)
          if(prototype === null) {
             result.__proto__ = null;
          } 
          return result;
        };
      })();
    };
    // Polyfill https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
    if (!Array.prototype.reduce) {
      Array.prototype.reduce = function(callback /*, initialValue*/) {
        'use strict';
        if (this == null) {
          throw new TypeError('Array.prototype.reduce called on null or undefined');
        }
        if (typeof callback !== 'function') {
          throw new TypeError(callback + ' is not a function');
        }
        var t = Object(this), len = t.length >>> 0, k = 0, value;
        if (arguments.length == 2) {
          value = arguments[1];
        } else {
          while (k < len && !(k in t)) {
            k++; 
          }
          if (k >= len) {
            throw new TypeError('Reduce of empty array with no initial value');
          }
          value = t[k++];
        }
        for (; k < len; k++) {
          if (k in t) {
            value = callback(value, t[k], k, t);
          }
        }
        return value;
      };
    }
    
    if(typeof Array.prototype.binarySearch != 'function') {
      Array.prototype.binarySearch=function(
        key, compareFunc, fromIndex, toIndex
      ) {
        if(typeof fromIndex=='undefined' || null==fromIndex) {
          fromIndex=0;
        }
        if(typeof toIndex=='undefined' || null==toIndex) {
          toIndex=this.length;
        }
        if(typeof compareFunc != 'function' || null==compareFunc) {
          compareFunc=function(a,b) {
            return a<b ? -1 :(a>b ? 1 : 0); 
          };
        }
        var low = fromIndex;
        var high = toIndex - 1;

        while (low <= high) {
          var mid = (low + high) >>> 1;
          var midVal = this[mid];
          
          var compResult=compareFunc(midVal, key);
          if (compResult < 0) {
            low = mid + 1;
          }
          else if (compResult > 0) {
            high = mid - 1;
          }
          else {
            return mid;
          }
        }
        return -(low + 1);  // key not found.
      };
    }
    
    var toRet={util:{}};
    
    function _isArray(x) {
      var r=(Object.prototype.toString.call(x)==="[object Array]");
      return r;
    }
    toRet.util.isArray=_isArray;

    function _isNum(x) {
      if(typeof(x)==="number") {
        return true;
      }
      var c1=((x-parseFloat(x)+1)>0);
      var c2=((""+x).trim().length>0);
      return  c1 && c2;
    }
    toRet.util.isNum=_isNum;
    
    function _extends(base, sub) {
      // Do a recursive merge of two prototypes, so we don't overwrite 
      // the existing prototype, but still maintain the inheritance chain
      var origProto = sub.prototype;
      sub.prototype = Object.create(base.prototype);
      for (var key in origProto)  {
         sub.prototype[key] = origProto[key];
      }
      // Remember the constructor property was set wrong, let's fix it
      sub.prototype.constructor = sub;
      // In ECMAScript5+ (all modern browsers), you can make the constructor property
      // non-enumerable if you define it like this instead
      Object.defineProperty(sub.prototype, 'constructor', { 
        enumerable: false, 
        value: sub 
      });
    }
    toRet.util.extends=_extends;
    return toRet;
  }
)();

(
  function() {
    var obj=function() {
    }
    $rc.CombObject=obj;
    $rc.CombObject.prototype.getValue=function() {
      return 0;
    }
    $rc.CombObject.prototype.getMinValue=function(tol) {
      return 0;
    }
    $rc.CombObject.prototype.getMaxValue=function(tol) {
      return 0;
    }
    $rc.CombObject.prototype.toString=function() {
      var unit=1;
      var separator='R';
      var value=this.getValue();
      if(value>=1e6) {
        unit=1e6;
        separator='M';
      }
      else if(value>=1000) {
        unit=1000;
        separator='K';
      }
      else {
        unit=1;
        separator='R';
      }
      var val=value/unit;
      val=Math.round(val*1000.0)/1000.0;
      var retVal=""+val;
      if(retVal.indexOf('.')>=0) {
        retVal=retVal.replace('.', separator);
      }
      else {
        retVal+=separator;
      }
      return retVal;
    }
  } 
  
)();

(
  function() {
    var obj=function(x) {
      var u=$rc.util;
      this.val=0;
      if(u.isNum(x)) {
        this.val=x-0;
      }
    }
    $rc.Val=obj;
    $rc.Val.prototype={
      getValue : function() {
        return this.val;
      },
      getMinValue : function(tol) {
        return this.val*(1-tol);
      },
      getMaxValue : function(tol) {
        return this.val*(1+tol);
      }
    }
    $rc.util.extends($rc.CombObject,$rc.Val);
  } 
    
)();

(
  function() {
    var obj=function() {
      this.vals=[];
      var a=arguments;
      if(arguments) {
        var args=[];
        for(var k in arguments) {
          args.push(arguments[k]);
        }
        args.forEach(
          function(x) {
            if($rc.util.isNum(x)) {
              this.vals.push(new $rc.Val(x));
            }
            else if(x instanceof $rc.CombObject) {
              this.vals.push(x);
            }
          }, 
          this
        );
      };
    } 
    $rc.Group=obj;
    $rc.Group.prototype={};
    $rc.util.extends($rc.CombObject, $rc.Group);
  }
)();

(
  function() {
    var obj=function Series() {
      $rc.Group.apply(this,arguments);
    };
    $rc.Serial=obj;
    $rc.Serial.prototype={
      getValue : function() {
        var r=this.vals.reduce(
          function(a,b) {
            a=$rc.util.isNum(a) ? a-0 : a.getValue();
            b=$rc.util.isNum(b) ? b-0 : b.getValue();
            return a+b;
           },
           0
        );
        return r;
      },
      getMinValue : function(tol) {
        var r=this.vals.reduce(
          function(a,b) {
            a=$rc.util.isNum(a) ? a : a.getMinValue(tol);
            b=$rc.util.isNum(b) ? b*(1-tol) : b.getMinValue(tol);
            return a+b;
           },
           0
        );
        return r;
      },
      getMaxValue : function(tol) {
        var r=this.vals.reduce(
          function(a,b) {
            a=$rc.util.isNum(a) ? a : a.getMaxValue(tol);
            b=$rc.util.isNum(b) ? b*(1+tol) : b.getMaxValue(tol);
            return a+b;
           },
           0
        );
        return r;
      }        
    };
    $rc.Serial.prototype.toString=function() {
      var toRet="";
      this.vals.forEach(function(e) {
        if(toRet.length>0) {
          toRet+='+';
        }
        toRet+=e.toString();
      });
      return toRet;
    }
    $rc.util.extends($rc.Group, $rc.Serial);
  }
)();

(
  function() {
    var obj=function Parallel() {
      $rc.Group.apply(this,arguments);
    };
    $rc.Parallel=obj;
    $rc.Parallel.prototype={
      getValue : function() {
        switch(this.vals.length) {
          case 0:
            return 0;
          case 1:
            return this.vals[0].getValue();
          default:
            break;
        }
        var r=this.vals.reduce(
          function(a,b) {
            var x=$rc.util.isNum(a) ? a-0 : 1.0/a.getValue();
            var y=$rc.util.isNum(b) ? 1.0/b : 1.0/b.getValue();
            return x+y;
          }
        );
        return 1.0/r;
      },
      getMinValue : function(tol) {
        switch(this.vals.length) {
          case 0:
            return 0;
          case 1:
            return this.vals[0].getMinValue(tol);
          default:
            break;
        }
        var r=this.vals.reduce(
          function(a,b) {
            var x=$rc.util.isNum(a) ? a-0 : 1.0/a.getMinValue(tol);
            var y=$rc.util.isNum(b) ? 1.0/(b*(1-tol)) : 1.0/b.getMinValue(tol);
            return x+y;
          }
        );
        return 1.0/r;
      },
      getMaxValue : function(tol) {
          switch(this.vals.length) {
          case 0:
            return 0;
          case 1:
            return this.vals[0].getMaxValue(tol);
          default:
            break;
        }
        var r=this.vals.reduce(
          function(a,b) {
            var x=$rc.util.isNum(a) ? a-0 : 1.0/a.getMaxValue(tol);
            var y=$rc.util.isNum(b) ? 1.0/(b*(1+tol)) : 1.0/b.getMaxValue(tol);
            return x+y;
          }
        );
        return 1.0/r;
      },
      toString : function() {
        var toRet="";
        this.vals.forEach(function(e) {
          if(toRet.length>0) {
            toRet+='*';
          }
          var series=e instanceof $rc.Serial;
          if(series) {
            toRet+='(';
          }
          toRet+=e.toString();
          if(series) {
            toRet+=')';
          }
        });
        return toRet;
      }
    
    };
    $rc.util.extends($rc.Group, $rc.Parallel);
  }
)();

(
  function () {
    var coefs=[
        1e-2, 1e-1, 1, 10, 100, 1000
    ];
    var E12SeriesBase=[
      100, 120, 150, 180, 220, 270,
      330, 390, 470, 560, 680, 820
    ];
    var E24SeriesBase= [
      100, 110, 120, 130, 150, 160, 180, 200, 220, 240, 270, 300,
      330, 360, 390, 430, 470, 510, 560, 620, 680, 750, 820, 910
    ];
    $rc.E12Series=[];
    $rc.E24Series=[];
    for(var ci=0; ci<coefs.length; ci++) {
      for(var e12i=0; e12i<E12SeriesBase.length; e12i++) {
        $rc.E12Series[ci*E12SeriesBase.length+e12i]=coefs[ci]*E12SeriesBase[e12i];
      }
      for(var E24i=0; E24i<E24SeriesBase.length; E24i++) {
        $rc.E24Series[ci*E24SeriesBase.length+E24i]=coefs[ci]*E24SeriesBase[E24i];
      }
    }
    
    function makeLBCombs(
      numComps, minimalVal, tolerance,
      srcVals, notifyMe
    ) {
      if(!numComps) {
        return;
      }
      var limit=Math.max(0, (1-tolerance)*minimalVal);
      if(1==numComps) {
        var ix=srcVals.binarySearch(limit);
        if(ix<0) {
          ix=-ix-1;
        }
        for(var i=ix; i<srcVals.length && srcVals[i]>=limit; i++) {
          notifyMe(new $rc.Val(srcVals[i]));
        }
      }
      else {
        // more than one component
        // Parallel combinations then series combinations
        
        // Parallel. Two branches, at the least, both of them must have twice the minimal value
        for(
          var leftCompCount=1; 
          leftCompCount<numComps; 
          leftCompCount++
        ) {
          var rightCount=numComps-leftCompCount;
          var leftBranchConsumer= function(leftValue) {
            var leftVal=leftValue.getValue();
            if(leftVal>=2*limit) {
              // ask for a value that would make the right branch good enough to go over the limit
              var rightValLimit=limit*leftVal/(leftVal-limit);
              makeLBCombs(
                rightCount, rightValLimit, tolerance, srcVals, 
                function (rightValue) {
                  var rightVal=rightValue.getValue();
                  var result=leftVal*rightVal/(leftVal+rightVal);
                  if(result>=limit) {
                    notifyMe(new $rc.Parallel(leftValue, rightValue));
                  }
                }
              );
            }
          };
          makeLBCombs(leftCompCount, 2*limit, tolerance, srcVals, leftBranchConsumer);
        }
        
        // serial combinations
        // Two segments, the first one should go over half the limit
        for(var leftSegCount=1; leftSegCount<numComps; leftSegCount++) {
          var rightCount=numComps-leftSegCount;
          var leftSegConsumer= function(leftSegVal) {
            var leftVal=leftSegVal.getValue();
            var rightValLimit=Math.max(limit-leftVal, 0);
            makeLBCombs(
              rightCount, rightValLimit, 
              tolerance, srcVals, 
              function (rightSegValue) {
                var serialVal=leftVal+rightSegValue.getValue();
                if(serialVal>=limit) {
                  notifyMe(new $rc.Serial(leftSegVal, rightSegValue));
                }
              }
            );
          };
          makeLBCombs(leftSegCount, limit/2, tolerance, srcVals, leftSegConsumer);
        }
      }
    };
    
    function makeUBCombs(
      numComps, maximalVal, tolerance,
      srcVals, notifyMe
    ) {
      if(! numComps) {
        return;
      }
      var limit=(1+tolerance)*maximalVal;
      if(1==numComps) {
        var ix=srcVals.binarySearch(limit);
        if(ix<0) {
          ix=-ix-1;
        }
        for(var i=0; i<srcVals.length && srcVals[i]<=limit; i++) {
          notifyMe(new $rc.Val(srcVals[i]));
        }
      }
      else {
        // more than one component
        // Parallel combinations then series combinations
        
        // Parallel. Two branches, stop at the twice maximal limit, after that, they'll be just symmetrical
        for(var leftCompCount=1; leftCompCount<numComps; leftCompCount++) {
          var rightCount=numComps-leftCompCount;
          var leftBranchConsumer= function(leftValue) {
            var leftVal=leftValue.getValue();
            if(leftVal<=limit*2) {
              // ask for a value that would make the right branch good enough to be under the limit
              var rightValLimit=(leftVal<=limit) ? 0 : limit*leftVal/(leftVal-limit);
              makeUBCombs(
                rightCount, rightValLimit, tolerance, srcVals, 
                function(rightValue) {
                  var rightVal=rightValue.getValue();
                  var result=leftVal*rightVal/(leftVal+rightVal);
                  if(result<=limit) {
                    notifyMe(new $rc.Parallel(leftValue, rightValue));
                  }
                }
              );
            }
          };
          makeLBCombs(leftCompCount, 2*limit, tolerance, srcVals, leftBranchConsumer);
        }
        
        // serial combinations
        // Two segments, stop when the first goes above half the limit
        for(var leftSegCount=1; leftSegCount<numComps; leftSegCount++) {
          var rightCount=numComps-leftSegCount;
          var leftSegConsumer=function(leftSegVal) {
            var leftVal=leftSegVal.getValue();
            var rightValLimit=Math.max(limit-leftVal, 0);
            makeUBCombs(
              rightCount, rightValLimit, 
              tolerance, srcVals, 
              function(rightSegValue) {
                var serialVal=leftVal+rightSegValue.getValue();
                if(serialVal<=limit) {
                  notifyMe(new $rc.Serial(leftSegVal, rightSegValue));
                }
              }
            );
          };
          makeLBCombs(leftSegCount, limit/2, tolerance, srcVals, leftSegConsumer);
        }
      }
    };
    
    function makeVals(
      numComps,
      targetValue, tolerance,
      srcVals,
      notifyMe
    ) {
      if(numComps<=0) {
        return;
      }
      tolerance=Math.abs(tolerance);
      var tol=tolerance>1 ? 1 : tolerance;
      var minV=Math.max(0, targetValue*(1-tol));
      var maxV=targetValue*(1+tol);
      if(targetValue>0) {
        if(numComps==1) {
          // no need to search for a combination 
          var ix=srcVals.binarySearch(minV);
          if(ix<0) {
            ix=-ix-1;
          }
          
          for(
            var i=ix; 
            i<srcVals.length && srcVals[i]<=maxV && srcVals[i]>=minV; 
            i++
          ) {
            notifyMe(new $rc.Val(srcVals[i]));
          }
        }
        else {
          // - Attempt to obtain the same value with one less component
          // - then attempt to do it by a parallel combination
          // - then attempt to do it with a series combination
          makeVals(numComps-1, targetValue, tol, srcVals, notifyMe);
          
          // Parallel combinations
          // Take all combinations that may result in a value twice as big as the minimum one
          for(var numLeftBranch=1; numLeftBranch<numComps; numLeftBranch++) {
            var numRighBranch=numComps-numLeftBranch;
            leftBranchConsumer=function(leftVal) {
              var lVal=leftVal.getValue();
              var rValLimit=maxV*lVal/(lVal-maxV);
              if(rValLimit>=0) {
                makeUBCombs(
                  numRighBranch, rValLimit, 
                  tol, srcVals, function(rightVal) {
                    var rVal=rightVal.getValue();
                    var result=lVal*rVal/(lVal+rVal);
                    if(result>=minV && result<=maxV) {
                      notifyMe(new $rc.Parallel(leftVal, rightVal));
                    }
                  }
                );
              }
            };
            makeLBCombs(numLeftBranch, 2*maxV, tol, srcVals, leftBranchConsumer);
          }
          // serial combination: go up to maxLimit/2
          for(var numLeftSeg=1; numLeftSeg<numComps; numLeftSeg++) {
            var numRightSeg=numComps-numLeftSeg;
            var leftSegConsumer=function(leftVal) {
              var lVal=leftVal.getValue();
              var rValLimit=maxV-lVal;
              if(rValLimit>=0) {
                makeUBCombs(
                  numRightSeg, rValLimit, 
                  tol, srcVals, function(rightVal) {
                    var rVal=rightVal.getValue();
                    var result=(lVal+rVal);
                    if(result>=minV && result<=maxV) {
                      notifyMe(new $rc.Serial(leftVal, rightVal));
                    }
                  }
                );
              }
            };
            makeLBCombs(numLeftSeg, maxV/2, tol, srcVals, leftSegConsumer);
          }
        }
      }
    };
    
    $rc.makeValues=function(
      numComps, targetValue, tolerance,
      srcVals, maxCombinations,
      progressCallback,
      doneCallback
    ) {
      if(
           typeof(maxCombinations)=="undefined"
        || !$rc.util.isNum(maxCombinations)
      ) {
        maxCombinations=64;
      }
      var resultVals=[];
      if(typeof(progressCallback)!="function") {
        progressCallback=function(numCombs, v) {
        };
      }
      if(typeof(doneCallback)!="function") {
        doneCallback=function(numCombs, v) {
        };
      }
      var numCombs=0;
      makeVals(
        numComps, targetValue, tolerance,
        srcVals, function(value) {
          var v=value.getValue();
          var o={v:value, eps:Math.abs(v-targetValue)/targetValue};
          var ix=resultVals.binarySearch(
            o, function(a,b) {
              var e1=a.eps;
              var e2=b.eps;
              return e1<e2 ? -1 :(e1>e2 ? 1 : 0);
            }
          );
          numCombs++;
          if(numCombs>0 && 0==(numCombs%1024)) {
            progressCallback(numCombs, resultVals);
          }
          if(ix<0) {
            ix=-ix-1;
          }
          else {
            // we already know it, or another one with the same value
            return;
          }
          resultVals.splice(ix, 0, o);
          if(resultVals.length>maxCombinations) {
            resultVals.splice(maxCombinations, resultVals.length-maxCombinations);
          }
        } 
      );
      doneCallback(numCombs, resultVals);
      return resultVals;
    };
  }
)
();


