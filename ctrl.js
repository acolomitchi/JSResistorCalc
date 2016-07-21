  function Ctrl() {
    this.rcWorker=null;
    this.valSet=$rc.E12Series; // the chosen value set

    var owner=this; // to have it as a variable in closures
    
    this.updateData=function(data, done) {
      var numCombs=$("#numCombs");
      numCombs.html("# within "+Math.round(this.tolerance*1000)/10+"% of target: "+
        (null!=data ? data.combs : 0)
      );
      if(done) {
        $("#cancelSupport").empty();
        $("#cancelSupport").html("Done!");
      }
      var resTBody=$("#resTable tbody");
      resTBody.empty();
      var ownerCtrl=this;
      if(null!==data && "undefined"!=typeof(data.vals) && $rc.util.isArray(data.vals)) {
        data.vals.forEach(
          function(e) {
            var minTxt=
              e.min+"<br>("+Math.round((e.min-ownerCtrl.target)/ownerCtrl.target*1000000)/10000+"%)";
            ;
            var maxTxt=
              e.max+"<br>("+Math.round((e.max-ownerCtrl.target)/ownerCtrl.target*1000000)/10000+"%)";
            ;
            var valTxt=(new $rc.Val(e.v)).toString()+"<br>("+Math.round(e.v*1000)/1000+")";
            var eps=(e.v-ownerCtrl.target)/ownerCtrl.target;
            eps=Math.round(eps*1000000)/10000;
            resTBody.append(
              "<tr><td>"+e.c+"</td>"+
              "<td>"+valTxt+"</td>"+
              "<td>"+eps+"</td>"+
              "<td>"+minTxt+"</td>"+
              "<td>"+maxTxt+"</td>"+
              "</tr>"
            );
          }
        );
      }
    }
    function showCustomSubsetDialog(subset, doneCallback) {
      var d=$("#custom-choice-dialog");
      var nRows=subset.nRows;
      var nCols=subset.v.length/nRows;
      function valueIx(rIx, cIx) {
        return cIx*nRows+rIx;
      };
      function valueId(rIx, cIx) {
        return "cvId"+valueIx(rIx,cIx);
      };
      var str="<table style='border:none;width:100%'><tr>";
      for(var cIx=0;cIx<nCols;cIx++) {
        var has=false;
        for(var rIx=0; rIx<nRows && !has; rIx++) {
          var valObj=subset.v[valueIx(rIx, cIx)];
          has=valObj.s;
        }
        str+=
            "<td align='right'>&darr;&nbsp;<input type='checkbox' value='"+cIx
          + "' id='reset"+cIx+"'"
        ;
        if(has) {
          str+="checked='checked'";
        }
        str+="/></td>";
      }
      str+="</tr>";
      for(var rIx=0; rIx<nRows;rIx++) {
        str+="<tr>";
        for(var cIx=0; cIx<nCols;cIx++) {
          var vIx=valueIx(rIx,cIx);
          var vId=valueId(rIx, cIx);
          var valObj=subset.v[vIx];
          str+="<td align='right'><label for='"+vId+"'>"+valObj.v.toString()+"</label>";
          str+="<input type='checkbox' id='"+vId+"' value='"+vIx+"'";
          if(valObj.s) {
            str+=" checked='checked'";
          }
          str+="/></td>";
        }
        str+="</tr>";
      }
      str+="</table>";
      d.html(str);
      for(var cIx=0;cIx<nCols;cIx++) {
        d.find("#reset"+cIx).change(function(e) {
          var enAll=$(this).is(':checked');
          var cIx=$(this).val();
          for(var i=0;i<nRows;i++) {
            d.find("#"+valueId(i,cIx)).attr("checked",enAll);
            // Darn, changing it programatically doesn't trigger an event. 
            // Well, adjust the corresponding value manually
            var vIx=valueIx(i,cIx);
            subset.v[vIx].s=enAll;
          }
        });
        for(var rIx=0;rIx<nRows;rIx++) {
          var chBox=d.find("#"+valueId(rIx,cIx));
          chBox.change(function(e) {
            var sel=$(this).is(":checked");
            var vIx=$(this).val()-0; // make it number
            subset.v[vIx].s=sel;
          });
          // chBox.checkboxradio();
        }
      }
      d.dialog(
        {
          resizable: false,
          height: "auto",
          width: 460,
          maxHeight : 520,
          modal: true,
          autoOpen: false,
          buttons: {
            "OK": function() {
              $( this ).dialog( "close" );
              $("custom-choice-dialog").empty();
              var valSet=[];
              subset.v.forEach(valObj=>{
                if(valObj.s) {
                  valSet.push(valObj.v.getValue());
                }
              });
              doneCallback(valSet);
            },
            Cancel: function() {
              $( this ).dialog( "close" );
              $("custom-choice-dialog").empty();
            }
          }
        }
      );
      d.dialog("open");
    }
    this.showE12subset=function() {
      var resSet=[];
      var saved=window.sessionStorage['E12_subset'];
      saved=
        (typeof(saved)==="undefined" || null===saved) 
        ? $rc.E12Series 
        : saved.split(',')
      ;
      $rc.E12Series.forEach(function(e) {
        var ix=saved.binarySearch(e);
        resSet.push({v:new $rc.Val(e),s:(ix>=0)});
      });
      var subset={nRows:12,v:resSet};
      var ctrlOwner=this;
      showCustomSubsetDialog(subset, function(valSet) {
        ctrlOwner.valSet=valSet;
        ctrlOwner.adjustMaxNum();
        window.sessionStorage['E12_subset']=valSet;
      });
      

    }
    
    this.showE24subset=function() {
      var resSet=[];
      var saved=window.sessionStorage['E24_subset'];
      saved=
          (typeof(saved)==="undefined" || null===saved) 
        ? $rc.E24Series 
        : saved.split(',')
      ;
      $rc.E24Series.forEach(function(e) {
        var ix=saved.binarySearch(e);
        resSet.push({v:new $rc.Val(e),s:(ix>=0)});
      });
      var subset={nRows:24,v:resSet};
      var ctrlOwner=this;
      showCustomSubsetDialog(subset, function(valSet) {
        ctrlOwner.valSet=valSet;
        ctrlOwner.adjustMaxNum();
        window.sessionStorage['E24_subset']=valSet;
      });
    }

    this.compute=function() {
      if(null!=this.rcWorker) {
        this.rcWorker.terminate();
        this.rcWorker=null;
      }
      this.updateData(null, false);
      var target=$("#resistorValue").val();
      if(false==$rc.util.isNum(target)) {
        alert("Expecting a number as the 'Desired value'");
        return;
      }
      this.target=target-0;
      this.rcWorker=new Worker("worker.js");
      var ownerCtrl=this;
      this.rcWorker.onmessage=function(e) {
        if(typeof(e.data)!="undefined") {
          var type=e.data.type;
          if("progress"==type || "done"==type) {
            ownerCtrl.updateData(e.data, "done"==type);
          }
          if("done"==type) {
            this.rcWorker.terminate();
            this.rcWorker=null;
          }
        }
      }
      this.rcWorker.onerror=function(e) {
        // TODO handle it better
        alert(e.message);
      }
      var series=$("#rSeries").val();
      this.tolerance=(series.startsWith("E24") ? 0.05 : 0.1);
      series=this.valSet;
      var combType=$('#combType').val();
      var owner=this;
      $("#cancelSupport").html("<button id='cancelBtn'>Cancel</button>");
      $("#cancelSupport").find("#cancelBtn").click(
        function(e) {
          if(null!=owner.rcWorker) {
            owner.rcWorker.terminate();
            owner.rcWorker=null;
            setTimeout(
              function() {
                $("#cancelSupport").html("Interrupted!");
              },850
            );
          }
        }
      );
      this.rcWorker.postMessage({
        cmd:"start",
        numRes:$("#numComponents").val(),
        target: this.target,
        tolerance:this.tolerance,
        srcVals:series,
        combType:combType
      });
    }
    
    this.adjustMaxNum=function() {
      if(typeof(this.valSet)!="undefined") {
        var maxNum=6;
        if(this.valSet.length<=24) {
          maxNum=6;
        }
        else if(this.valSet.length<=36) {
          maxNum=5;
        }
        else if(this.valSet.length<=72) {
          maxNum=4;
        }
        else {
          maxNum=3;
        }
        var numSelected=$("#numComponents").find(":selected").val();
        if(numSelected>maxNum) {
          numSelected=maxNum;
        }
        for(i=1; i<=maxNum; i++) {
          var opt=$("#numComponents").find("[value="+i+"]");
          opt.prop("disabled",false);
          if(i==numSelected) {
            opt.prop("selected", true);
          }
        }
        for(i=maxNum+1; i<=6; i++) {
          $("#numComponents").find("[value="+i+"]").prop("disabled",true); 
        }
      }
    }
    
    $("#resistorValue").on("input",
      function(e) {
        var valStr=$("#resistorValue").val();
        var validVal=$rc.util.isNum(valStr) && (valStr-0)>0;
        $("#computeButton").prop('disabled', !validVal);
      }
    );
    var owner=this;
    $("#rSeries").find("option").on("click",
      function(e) {
        var v=$("#rSeries").val();
        if("E24"==v) {
          owner.valSet=$rc.E24Series;
          owner.adjustMaxNum();
        }
        else if("E12"==v) {
          owner.valSet=$rc.E12Series;
          owner.adjustMaxNum();
        }
        else if("E12_subset"==v) {
          owner.showE12subset();
        }
        else if("E24_subset"==v) {
          owner.showE24subset();
        }
      }
    );
    $("#computeButton").prop('disabled', true);
    $("#resistorValue").val("");
    $("#numComponents").find("[value=3]").prop("selected", true);
    $("#rSeries").find("[value=E12]").prop("selected", true);
    this.adjustMaxNum();
    var owner=this;
    $("#computeButton").click(
      function(){
        owner.compute();
      }
    );
  }
