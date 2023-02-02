#include "jsx_modules.jsx"

// Set the true dimensions of live text.
// Illustrator does not provide the user the true dimensions of live text as they are based on the
// bounding box that is visible around any live text. This script is a workaround.

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

// TODO:
// VERY LARGE INPUT NUMBERS CAUSE ERROR

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  sourceDoc = activeDocument
  
  if(sourceDoc.textFrames.length == 0) {
    alert("There are no live text objects in the document.")
    return
  }
  var artObjects
  
  if(selection.length == 0) {
    executeMenuCommand('Text Objects menu item');
    if(selection.length == 0) {
      alert("Can't find or select any text objects.\n\nAre your text/layers locked/hidden?")
      return
    }
    artObjects = selection
  } else {
    var targetTextFrames = []
    for(var i = 0; i < sourceDoc.textFrames.length; i++) {
      if(sourceDoc.textFrames[i].selected) {
        targetTextFrames.push(sourceDoc.textFrames[i])
      }
    }
    if(targetTextFrames.length == 0) {
      alert("There are no live text objects in this selection.")
      return
    }
    artObjects = targetTextFrames
  }
  var artObjects_original = []
  for(var i = 0; i < artObjects.length; i++) {
    artObjects_original.push({
      width: artObjects[i].width, 
      height: artObjects[i].height,
      position: artObjects[i].position
    })
  }
  
  var docUnits = getDocUnit()
  if(docUnits === false) return
  
  var textOutlines = outlineText(artObjects)
  
  var dimGoal = dialog_setLiveTextDims(artObjects, textOutlines, docUnits)
  
  if(dimGoal == false) {
    deleteObjects(textOutlines)
    return
  }
  
  for(var i = 0; i < artObjects.length; i++) {
    var wScale = dimGoal[0] * docUnits.multiplier / textOutlines[i].width
    var hScale = dimGoal[1] * docUnits.multiplier / textOutlines[i].height
    artObjects[i].width *= wScale
    artObjects[i].height *= hScale
    // scale outlines for future check in order to compare with live text scale that may have reached max size
    textOutlines[i].width *= wScale
    textOutlines[i].height *= hScale
  }
  
  var textOutlines_scaleCheck = outlineText(artObjects)
  textOutlines_scaleCheck[0].name = "SCALE CHECK"
  var textOutlines_incorrectFinalScale = 0
  for(var i = 0; i < textOutlines_scaleCheck.length; i++) {
    if(prec(textOutlines_scaleCheck[i].width, 0) != prec(textOutlines[i].width, 0) || prec(textOutlines_scaleCheck[i].height, 0) != prec(textOutlines[i].height, 0)) {
      textOutlines_incorrectFinalScale++
    }
  }
  
  if(textOutlines_incorrectFinalScale > 0) {
    var expandAndScaleLiveText = dialog_maxLiveTextScaleReached(dimGoal, docUnits)
    if(!expandAndScaleLiveText) {
      for(var i = 0; i < artObjects.length; i++) { // revert scaling from original scale test
        artObjects[i].width = artObjects_original[i].width
        artObjects[i].height = artObjects_original[i].height
        artObjects[i].position = artObjects_original[i].position
      }
      deleteObjects(textOutlines_scaleCheck)
      deleteObjects(textOutlines)
      return
    } else { // expand and scale live text
      for(var i = 0; i < artObjects.length; i++) {
        artObjects[i] = artObjects[i].createOutline()
        artObjects[i].width = dimGoal[0] * docUnits.multiplier
        artObjects[i].height = dimGoal[1] * docUnits.multiplier
      }
    }
  }
  
  deleteObjects(textOutlines_scaleCheck)
  deleteObjects(textOutlines)
  // artObjects[0].createOutline()
}

function dialog_maxLiveTextScaleReached(dimGoal, docUnits) {
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":5,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"maxLiveTextScaleReached","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Max Live Text Size Reached","preferredSize":[0,0],"margins":20,"orientation":"column","spacing":10,"alignChildren":["left","top"]}},"item-1":{"id":1,"type":"StaticText","parentId":0,"style":{"enabled":true,"varName":"scaleErrMsg","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":true,"text":"n live text object(s) couldn't be scaled to:\n\nWidth: dimGoal[0] \nHeight: dimGoal[1] \n\n...because your input dimensions are larger than the maximum allowed for live text objects.","justify":"left","preferredSize":[300,0],"alignment":null,"helpTip":null}},"item-2":{"id":2,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"userBtns","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":"center"}},"item-3":{"id":3,"type":"Button","parentId":2,"style":{"enabled":true,"varName":"cancel","text":"Cancel","justify":"center","preferredSize":[0,30],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"Button","parentId":2,"style":{"enabled":true,"varName":"ok","text":"Expand and Scale","justify":"center","preferredSize":[0,30],"alignment":null,"helpTip":null}},"item-5":{"id":5,"type":"StaticText","parentId":0,"style":{"enabled":true,"varName":"question","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":true,"text":"Do you want to expand the selected text so it can be scaled?","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-6":{"id":6,"type":"Divider","parentId":0,"style":{"enabled":true,"varName":null}}},"order":[0,1,6,5,2,3,4],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
  */ 
  
  // MAXLIVETEXTSCALEREACHED
  // =======================
  var maxLiveTextScaleReached = new Window("dialog"); 
  maxLiveTextScaleReached.text = "Max Live Text Size Reached"; 
  maxLiveTextScaleReached.orientation = "column"; 
  maxLiveTextScaleReached.alignChildren = ["left","top"]; 
  maxLiveTextScaleReached.spacing = 10; 
  maxLiveTextScaleReached.margins = 20; 
  
  var scaleErrMsg = maxLiveTextScaleReached.add("group"); 
  scaleErrMsg.preferredSize.width = 300; 
  scaleErrMsg.orientation = "column"; 
  scaleErrMsg.alignChildren = ["left","center"]; 
  scaleErrMsg.spacing = 0; 
  
  scaleErrMsg.add("statictext", undefined, "Live text object(s) couldn't be scaled to input of: ", {name: "scaleErrMsg"}); 
  scaleErrMsg.add("statictext", undefined, "", {name: "scaleErrMsg"}); 
  scaleErrMsg.add("statictext", undefined, "Width: " + prec(dimGoal[0], 2) + " " + docUnits.unit_short, {name: "scaleErrMsg"}); 
  scaleErrMsg.add("statictext", undefined, "Height: " + prec(dimGoal[1], 2) + " " + docUnits.unit_short, {name: "scaleErrMsg"}); 
  scaleErrMsg.add("statictext", undefined, "", {name: "scaleErrMsg"}); 
  scaleErrMsg.add("statictext", undefined, "...because the final live text dimensions would be larger", {name: "scaleErrMsg"}); 
  scaleErrMsg.add("statictext", undefined, "than the maximum allowed by Illustrator.", {name: "scaleErrMsg"}); 
  scaleErrMsg.preferredSize.width = 300; 
  
  var divider1 = maxLiveTextScaleReached.add("panel", undefined, undefined, {name: "divider1"}); 
  divider1.alignment = "fill"; 
  
  var question = maxLiveTextScaleReached.add("statictext", undefined, undefined, {name: "question"}); 
  question.text = "Do you want to expand the selected text so it can be scaled?"; 
  
  // USERBTNS
  // ========
  var userBtns = maxLiveTextScaleReached.add("group", undefined, {name: "userBtns"}); 
  userBtns.orientation = "row"; 
  userBtns.alignChildren = ["left","center"]; 
  userBtns.spacing = 10; 
  userBtns.margins = 0; 
  userBtns.alignment = ["center","top"]; 
  
  var cancel = userBtns.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Cancel"; 
  cancel.preferredSize.height = 30; 
  
  var ok = userBtns.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "Expand and Scale"; 
  ok.preferredSize.height = 30; 
  
  var choice = maxLiveTextScaleReached.show();
  
  switch (choice) {
    case 1: // ok
    return true
    
    case 2: // cancel
    return false
    
    default:
    break;
  }
}

function outlineText(artObjects) {
  var textOutlines = []
  for(var i = 0; i < artObjects.length; i++) {
    textOutlines.push(artObjects[i].duplicate())
    textOutlines[i] = textOutlines[i].createOutline()
  }
  return textOutlines
}

function deleteObjects(artObjects) {
  for(var i = 0; i < artObjects.length; i++) {
    artObjects[i].remove()
  }
}

function dialog_setLiveTextDims(artObjects, textOutlines, docUnits) {
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":34,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"setLiveTextDims","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":false,"borderless":false,"resizeable":false},"text":"Set true dimensions of live text","preferredSize":[0,0],"margins":[20,30,20,30],"orientation":"row","spacing":30,"alignChildren":["center","center"]}},"item-2":{"id":2,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"cancel","text":"Cancel","justify":"center","preferredSize":[0,35],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"ok","text":"OK","justify":"center","preferredSize":[80,35],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"userBtns","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["fill","center"],"alignment":null}},"item-6":{"id":6,"type":"EditText","parentId":8,"style":{"enabled":true,"varName":"input_width","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"num","justify":"left","preferredSize":[80,0],"alignment":null,"helpTip":null}},"item-7":{"id":7,"type":"StaticText","parentId":8,"style":{"enabled":true,"varName":"label_width_true","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Width:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-8":{"id":8,"type":"Group","parentId":31,"style":{"enabled":true,"varName":"grp_width_true","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":7,"alignChildren":["left","center"],"alignment":null}},"item-9":{"id":9,"type":"Group","parentId":31,"style":{"enabled":true,"varName":"grp_height_true","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":7,"alignChildren":["left","center"],"alignment":null}},"item-10":{"id":10,"type":"StaticText","parentId":9,"style":{"enabled":true,"varName":"label_height_true","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Height:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-11":{"id":11,"type":"EditText","parentId":9,"style":{"enabled":true,"varName":"input_height","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"num","justify":"left","preferredSize":[80,0],"alignment":null,"helpTip":null}},"item-12":{"id":12,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"dims_real","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":15,"alignChildren":["center","center"],"alignment":"top"}},"item-13":{"id":13,"type":"Checkbox","parentId":12,"style":{"enabled":true,"varName":"uniformScaling","text":"Uniform Scaling","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-14":{"id":14,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"dims_fake","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["right","center"],"alignment":"top"}},"item-15":{"id":15,"type":"StaticText","parentId":12,"style":{"enabled":true,"varName":"trueDims","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"True dimensions","justify":"left","preferredSize":[0,0],"alignment":"center","helpTip":null}},"item-17":{"id":17,"type":"StaticText","parentId":14,"style":{"enabled":true,"varName":"fakeDims","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Dimensions","justify":"left","preferredSize":[0,0],"alignment":"center","helpTip":null}},"item-18":{"id":18,"type":"Group","parentId":32,"style":{"enabled":true,"varName":"grp_width_fake","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-19":{"id":19,"type":"StaticText","parentId":18,"style":{"enabled":true,"varName":"label_width_fake","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Width:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-21":{"id":21,"type":"Group","parentId":32,"style":{"enabled":true,"varName":"grp_height_fake","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-22":{"id":22,"type":"StaticText","parentId":21,"style":{"enabled":true,"varName":"label_height_fake","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Height:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-25":{"id":25,"type":"StaticText","parentId":4,"style":{"enabled":true,"varName":"multObjsNote","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":true,"text":"Multiple objects selected:\nBasing dimensions on top-most object.","justify":"center","preferredSize":[161,0],"alignment":null,"helpTip":null}},"item-26":{"id":26,"type":"Divider","parentId":0,"style":{"enabled":true,"varName":null}},"item-27":{"id":27,"type":"StaticText","parentId":8,"style":{"enabled":true,"varName":"unit","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"unit","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-28":{"id":28,"type":"StaticText","parentId":9,"style":{"enabled":true,"varName":"unit","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"unit","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-29":{"id":29,"type":"StaticText","parentId":18,"style":{"enabled":true,"varName":"unit","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"unit","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-30":{"id":30,"type":"StaticText","parentId":21,"style":{"enabled":true,"varName":"unit","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"unit","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-31":{"id":31,"type":"Group","parentId":12,"style":{"enabled":true,"varName":"dims","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["right","center"],"alignment":null}},"item-32":{"id":32,"type":"Group","parentId":14,"style":{"enabled":true,"varName":"dims","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["right","center"],"alignment":null}},"item-33":{"id":33,"type":"StaticText","parentId":18,"style":{"enabled":true,"varName":"output_width","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"num","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-34":{"id":34,"type":"StaticText","parentId":21,"style":{"enabled":true,"varName":"output_height","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"num","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}}},"order":[0,12,15,31,8,7,6,27,9,10,11,28,13,26,14,17,32,18,19,33,29,21,22,34,30,4,25,2,3],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
  */ 
  
  // SETLIVETEXTDIMS
  // ===============
  var setLiveTextDims = new Window("dialog", undefined, undefined, {closeButton: false}); 
  setLiveTextDims.text = "Set true dimensions of live text"; 
  setLiveTextDims.orientation = "row"; 
  setLiveTextDims.alignChildren = ["center","center"]; 
  setLiveTextDims.spacing = 30; 
  setLiveTextDims.margins = [30,20,30,20]; 
  
  // DIMS_REAL
  // =========
  var dims_real = setLiveTextDims.add("group", undefined, {name: "dims_real"}); 
  dims_real.orientation = "column"; 
  dims_real.alignChildren = ["center","center"]; 
  dims_real.spacing = 15; 
  dims_real.margins = 0; 
  dims_real.alignment = ["center","top"]; 
  
  var trueDims = dims_real.add("statictext", undefined, undefined, {name: "trueDims"}); 
  trueDims.text = "True dimensions"; 
  trueDims.alignment = ["center","center"]; 
  
  // DIMS
  // ====
  var dims = dims_real.add("group", undefined, {name: "dims"}); 
  dims.orientation = "column"; 
  dims.alignChildren = ["right","center"]; 
  dims.spacing = 10; 
  dims.margins = 0; 
  
  // GRP_WIDTH_TRUE
  // ==============
  var grp_width_true = dims.add("group", undefined, {name: "grp_width_true"}); 
  grp_width_true.orientation = "row"; 
  grp_width_true.alignChildren = ["left","center"]; 
  grp_width_true.spacing = 7; 
  grp_width_true.margins = 0; 
  
  var label_width_true = grp_width_true.add("statictext", undefined, undefined, {name: "label_width_true"}); 
  label_width_true.text = "Width:"; 
  
  var input_width = grp_width_true.add('edittext {properties: {name: "input_width"}}'); 
  input_width.text = prec(textOutlines[0].width / docUnits.multiplier, 4);
  input_width.preferredSize.width = 80; 
  // input_width.active = true
  
  var unit = grp_width_true.add("statictext", undefined, undefined, {name: "unit"}); 
  unit.text = docUnits.unit_short; 
  
  // GRP_HEIGHT_TRUE
  // ===============
  var grp_height_true = dims.add("group", undefined, {name: "grp_height_true"}); 
  grp_height_true.orientation = "row"; 
  grp_height_true.alignChildren = ["left","center"]; 
  grp_height_true.spacing = 7; 
  grp_height_true.margins = 0; 
  
  var label_height_true = grp_height_true.add("statictext", undefined, undefined, {name: "label_height_true"}); 
  label_height_true.text = "Height:"; 
  
  var input_height = grp_height_true.add('edittext {properties: {name: "input_height"}}'); 
  input_height.text = prec(textOutlines[0].height / docUnits.multiplier, 4); 
  input_height.preferredSize.width = 80; 
  
  var unit1 = grp_height_true.add("statictext", undefined, undefined, {name: "unit1"}); 
  unit1.text = docUnits.unit_short; 
  
  // DIMS_REAL
  // =========
  var uniformScaling = dims_real.add("checkbox", undefined, undefined, {name: "uniformScaling"}); 
  uniformScaling.text = "Uniform Scaling"; 
  uniformScaling.value = true; 
  
  // SETLIVETEXTDIMS
  // ===============
  var divider1 = setLiveTextDims.add("panel", undefined, undefined, {name: "divider1"}); 
  divider1.alignment = "fill"; 
  
  // DIMS_FAKE
  // =========
  var dims_fake = setLiveTextDims.add("group", undefined, {name: "dims_fake"}); 
  dims_fake.orientation = "column"; 
  dims_fake.alignChildren = ["right","center"]; 
  dims_fake.spacing = 10; 
  dims_fake.margins = 0; 
  dims_fake.alignment = ["center","top"]; 
  
  var fakeDims = dims_fake.add("statictext", undefined, undefined, {name: "fakeDims"}); 
  fakeDims.text = "Dimensions"; 
  fakeDims.alignment = ["center","center"]; 
  
  // DIMS1
  // =====
  var dims1 = dims_fake.add("group", undefined, {name: "dims1"}); 
  dims1.orientation = "column"; 
  dims1.alignChildren = ["right","center"]; 
  dims1.spacing = 10; 
  dims1.margins = 0; 
  
  // GRP_WIDTH_FAKE
  // ==============
  var grp_width_fake = dims1.add("group", undefined, {name: "grp_width_fake"}); 
  grp_width_fake.orientation = "row"; 
  grp_width_fake.alignChildren = ["left","center"]; 
  grp_width_fake.spacing = 10; 
  grp_width_fake.margins = 0; 
  
  var label_width_fake = grp_width_fake.add("statictext", undefined, undefined, {name: "label_width_fake"}); 
  label_width_fake.text = "Width:"; 
  
  var output_width = grp_width_fake.add("statictext", undefined, undefined, {name: "output_width"}); 
  output_width.text = prec(artObjects[0].width / docUnits.multiplier, 4); 
  
  var unit2 = grp_width_fake.add("statictext", undefined, undefined, {name: "unit2"}); 
  unit2.text = docUnits.unit_short; 
  
  // GRP_HEIGHT_FAKE
  // ===============
  var grp_height_fake = dims1.add("group", undefined, {name: "grp_height_fake"}); 
  grp_height_fake.orientation = "row"; 
  grp_height_fake.alignChildren = ["left","center"]; 
  grp_height_fake.spacing = 10; 
  grp_height_fake.margins = 0; 
  
  var label_height_fake = grp_height_fake.add("statictext", undefined, undefined, {name: "label_height_fake"}); 
  label_height_fake.text = "Height:"; 
  
  var output_height = grp_height_fake.add("statictext", undefined, undefined, {name: "output_height"}); 
  output_height.text = prec(artObjects[0].height / docUnits.multiplier, 4); 
  
  var unit3 = grp_height_fake.add("statictext", undefined, undefined, {name: "unit3"}); 
  unit3.text = docUnits.unit_short; 
  
  // USERBTNS
  // ========
  var userBtns = setLiveTextDims.add("group", undefined, {name: "userBtns"}); 
  userBtns.orientation = "column"; 
  userBtns.alignChildren = ["fill","center"]; 
  userBtns.spacing = 10; 
  userBtns.margins = 0; 
  
  if(textOutlines.length > 1) {
    var multObjsNote = userBtns.add("group"); 
    multObjsNote.preferredSize.width = 161; 
    multObjsNote.orientation = "column"; 
    multObjsNote.alignChildren = ["center","center"]; 
    multObjsNote.spacing = 0; 
    
    multObjsNote.add("statictext", undefined, "Multiple objects selected:", {name: "multObjsNote"}); 
    multObjsNote.add("statictext", undefined, "Basing dimensions on top-most", {name: "multObjsNote"}); 
    multObjsNote.add("statictext", undefined, "object.", {name: "multObjsNote"}); 
    multObjsNote.preferredSize.width = 161; 
  }
  
  var cancel = userBtns.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Cancel"; 
  cancel.preferredSize.height = 35; 
  
  var ok = userBtns.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "OK"; 
  ok.preferredSize.width = 80; 
  ok.preferredSize.height = 35; 
  if(isNaN(Number(output_width.text)) || isNaN(Number(output_height.text))) {
    ok.enabled = false; 
  } else {
    ok.enabled = true; 
  }
  
  // -----------------------------------------------------------------------------------
  var input_width_initial = input_width.text
  var input_height_initial = input_height.text
  var output_width_initial = output_width.text
  var output_height_initial = output_height.text
  
  var output_width_bool = output_height_bool = false // user entered bad input
  
  input_width.onChanging = function() {
    var scaleGoal = input_width.text / prec(textOutlines[0].width / docUnits.multiplier, 4)
    output_width.text = prec(output_width_initial * scaleGoal, 4)
    if(uniformScaling.value) {
      input_height.text = prec(input_height_initial * scaleGoal, 4)
      output_height.text = prec(output_height_initial * scaleGoal, 4)
    }
    output_width_bool = isNaN(Number(output_width.text)) || Number(output_width.text) == Infinity || Number(output_width.text) == 0
    if(output_width_bool) {
      ok.enabled = false
    } else {
      ok.enabled = true
    }
  }
  
  input_height.onChanging = function() {
    var scaleGoal = input_height.text / prec(textOutlines[0].height / docUnits.multiplier, 4)
    output_height.text = prec(output_height_initial * scaleGoal, 4)
    if(uniformScaling.value) {
      input_width.text = prec(input_width_initial * scaleGoal, 4)
      output_width.text = prec(output_width_initial * scaleGoal, 4)
    }
    output_height_bool = isNaN(Number(output_height.text)) || Number(output_height.text) == Infinity || Number(output_height.text) == 0 
    if(output_height_bool) {
      ok.enabled = false
    } else {
      ok.enabled = true
    }
  }
  
  // reset one of the inputs
  uniformScaling.onClick = function() {
    var scaleGoal = input_width.text / prec(textOutlines[0].width / docUnits.multiplier, 4)
    input_height.text = prec(input_height_initial * scaleGoal, 4)
    output_height.text = prec(output_height_initial * scaleGoal, 4)
    if(output_width_bool || output_height_bool) {
      ok.enabled = false
    } else {
      ok.enabled = true
    }
  }
  
  // -----------------------------------------------------------------------------------
  
  var choice = setLiveTextDims.show();
  
  switch (choice) {
    case 1: // continue
    return [Number(input_width.text), Number(input_height.text)]
    
    case 2: // cancel
    return false
    
    default:
    break;
  }
}
