#include "jsx_modules.jsx"
#include "dialogWidgets.jsx"

// Creates bounding boxes around selections. Can create multiple or one large bbox.

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

// TODO:
// EXPAND EVERYTHING BEFORE BBOX

// live create/update bbox during dialog

// add user option to make bbox background to selection + fill option
// remember last used dialog options, dialog button to reset options to defaults

// add user option to group bboxes with per art objects

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  sourceDoc = activeDocument
  
  if(selection.length == 0) {
    alert("Select one or multiple objects first to create a bounding box.")
    return
  }
  
  var docUnits = getDocUnit()
  if(docUnits === false) return
  
  if(sourceDoc.pageItems.length > 6000 && !bboxNWarning(sourceDoc.pageItems.length)) return
  var bboxOptions = dialog_bboxOptions(docUnits)
  if(bboxOptions === false) return
  
  var targetObjs = [] // duplicate of the original user selection
  for(var i = 0; i < selection.length; i++) {
    targetObjs.push(selection[i].duplicate())
    targetObjs[i].name = "DUPLICATE"
  }
  /*
  IMPORTANT: An internal bug regarding selection which is caused by duplication...
  The original selected objects are only considered to be selected at this point by the script but
  both the original selection and the duplicates are selected in llustrator. The script or Illustrator
  are in a bugged state/out of sync which can cause unexpected behavior. This is prevented by
  simply setting the selection again.
  */
  
  // remove hidden objects so that bboxes are only created around visible (and locked) objects
  var expandedObjsToRemove = []
  for(var i = 0; i < sourceDoc.pageItems.length; i++) {
    if(sourceDoc.pageItems[i].selected && sourceDoc.pageItems[i].hidden) {
      expandedObjsToRemove.push(sourceDoc.pageItems[i])
    }
  }
  for(var i = 0; i < expandedObjsToRemove.length; i++) {
    expandedObjsToRemove[i].remove()
  }
  
  selection = targetObjs
  selection[0].position = [selection[0].position[0], selection[0].position[1]] // redraw() alternative
  executeMenuCommand("expandStyle")
  
  var p = []
  var bboxes = []
  
  // get bound positions
  for(var i = 0; i < selection.length; i++) {
    p.push(bboxProperties(selection[i]))
  }
  
  if(!bboxOptions.perItem) {
    p = [bboxPropertiesLarge(p)]
  }
  
  // custom dimensions
  if(bboxOptions.customDims.enabled) {
    for(var i = 0; i < p.length; i++) {
      p[i].top = p[i].center[1] + bboxOptions.customDims.height / 2
      p[i].right = p[i].center[0] + bboxOptions.customDims.width / 2
      p[i].bottom = p[i].center[1] - bboxOptions.customDims.height / 2
      p[i].left = p[i].center[0] - bboxOptions.customDims.width / 2
    }
  }

  // create group for bboxes
  var dest = sourceDoc.activeLayer
  if(bboxOptions.group) {
    var bboxGrp = sourceDoc.activeLayer.groupItems.add()
    bboxGrp.name = "bboxes"
    dest = bboxGrp
  }
  
  // create bboxes
  for(var i = 0; i < p.length; i++) {
    // offset
    p[i].top += bboxOptions.offset
    p[i].right += bboxOptions.offset
    p[i].bottom -= bboxOptions.offset
    p[i].left -= bboxOptions.offset
    
    bboxes.push(createRectangle(p[i], dest))
  }
  
  // name, stroke, colors
  for(var i = 0; i < bboxes.length; i++) {
    bboxes[i].name = "bbox"
    bboxes[i].fillColor = new NoColor()
    if(bboxOptions.stroke.enabled && bboxOptions.stroke.width > 0) {
      bboxes[i].stroked = true
      bboxes[i].strokeWidth = bboxOptions.stroke.width
      if(bboxes[i].strokeColor.typename == "RGBColor") {
        if(!bboxOptions.cutLineColor) {
          bboxes[i].strokeColor.red = 0
          bboxes[i].strokeColor.green = 0
          bboxes[i].strokeColor.blue = 0
        } else {
          bboxes[i].strokeColor.red = 236
          bboxes[i].strokeColor.green = 0
          bboxes[i].strokeColor.blue = 140
        }
      } else {
        bboxes[i].strokeColor = new CMYKColor()
        if(!bboxOptions.cutLineColor) {
          bboxes[i].strokeColor.cyan = 60
          bboxes[i].strokeColor.magenta = 50
          bboxes[i].strokeColor.yellow = 50
          bboxes[i].strokeColor.black = 100
        } else {
          bboxes[i].strokeColor.cyan = 0
          bboxes[i].strokeColor.magenta = 100
          bboxes[i].strokeColor.yellow = 0
          bboxes[i].strokeColor.black = 0
        }
      }
    } else {
      bboxes[i].stroked = false
    }
  }

  var duplicatesToDelete = selection
  for(var i = 0; i < duplicatesToDelete.length; i++) {
    duplicatesToDelete[i].remove()
  }
  
  if(bboxOptions.select) {
    selection = bboxes
  }
}

function createBbox(artObjects, bboxOptions) {
  var bboxes = []
  var bbox
  var dims = initBbox(artObjects[0])
  
  // positions
  for(var i = 0; i < artObjects.length; i++) {
    dims.top = Math.max(dims.top, artObjects[i].top)
    dims.bottom = Math.min(dims.bottom, artObjects[i].top - artObjects[i].height)
    dims.left = Math.min(dims.left, artObjects[i].left)
    dims.right = Math.max(dims.right, artObjects[i].left + artObjects[i].width)
  }
  bbox = artObjects[0].layer.pathItems.rectangle(dims.top + bboxOptions.offset, dims.left - bboxOptions.offset, dims.right - dims.left + (bboxOptions.offset * 2), dims.top - dims.bottom + (bboxOptions.offset * 2))
  bboxes.push(bbox)
  return bboxes
}

function createRectangle(p, layer) {
  layer = layer !== undefined ? layer : sourceDoc.activeLayer
  return layer.pathItems.rectangle(p.top, p.left, p.right - p.left, p.top - p.bottom)
}

function initBbox(artObject) {
  var dims = {
    top: artObject.top,
    bottom: artObject.top - artObject.height,
    left: artObject.left,
    right: artObject.left + artObject.width
  }
  return dims
}

function dialog_bboxOptions(docUnits) {
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":9,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"bbox","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":false,"borderless":false,"resizeable":false},"text":"Create Bounding Box","preferredSize":[0,0],"margins":20,"orientation":"row","spacing":35,"alignChildren":["center","top"]}},"item-1":{"id":1,"type":"Checkbox","parentId":8,"style":{"enabled":true,"varName":"multiBbox","text":"Per item","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-2":{"id":2,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"ok","text":"OK","justify":"center","preferredSize":[0,30],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"cancel","text":"Cancel","justify":"center","preferredSize":[0,30],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"userBtns","preferredSize":[80,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["fill","top"],"alignment":null}},"item-5":{"id":5,"type":"EditText","parentId":7,"style":{"enabled":true,"varName":"bboxOffset","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"0","justify":"left","preferredSize":[60,0],"alignment":null,"helpTip":""}},"item-6":{"id":6,"type":"StaticText","parentId":7,"style":{"enabled":true,"varName":"","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Offset:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-7":{"id":7,"type":"Group","parentId":8,"style":{"enabled":true,"varName":"offsetGrp","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-8":{"id":8,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"options","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-9":{"id":9,"type":"Checkbox","parentId":8,"style":{"enabled":false,"varName":"cutLineColor","text":"Cut line color","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-11":{"id":11,"type":"StaticText","parentId":7,"style":{"enabled":true,"varName":"unit","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"unit","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-12":{"id":12,"type":"Checkbox","parentId":8,"style":{"enabled":true,"varName":"groupBboxes","text":"Group","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-13":{"id":13,"type":"Checkbox","parentId":8,"style":{"enabled":true,"varName":"selectBboxes","text":"Select","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-14":{"id":14,"type":"Divider","parentId":8,"style":{"enabled":true,"varName":null}},"item-16":{"id":16,"type":"Checkbox","parentId":8,"style":{"enabled":true,"varName":"customDims","text":"Custom dimensions","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-17":{"id":17,"type":"Divider","parentId":8,"style":{"enabled":true,"varName":null}},"item-18":{"id":18,"type":"Group","parentId":8,"style":{"enabled":false,"varName":"dims","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["right","center"],"alignment":null}},"item-19":{"id":19,"type":"StaticText","parentId":22,"style":{"enabled":true,"varName":"label","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Width:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-20":{"id":20,"type":"EditText","parentId":22,"style":{"enabled":true,"varName":"w","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"0","justify":"left","preferredSize":[60,0],"alignment":null,"helpTip":null}},"item-21":{"id":21,"type":"StaticText","parentId":22,"style":{"enabled":true,"varName":"unitW","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"unit","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-22":{"id":22,"type":"Group","parentId":18,"style":{"enabled":true,"varName":"wGrp","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-23":{"id":23,"type":"Group","parentId":18,"style":{"enabled":true,"varName":"hGrp","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-24":{"id":24,"type":"StaticText","parentId":23,"style":{"enabled":true,"varName":"label","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Height:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-25":{"id":25,"type":"EditText","parentId":23,"style":{"enabled":true,"varName":"h","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"0","justify":"left","preferredSize":[60,0],"alignment":null,"helpTip":null}},"item-26":{"id":26,"type":"StaticText","parentId":23,"style":{"enabled":true,"varName":"unitH","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"unit","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-27":{"id":27,"type":"Divider","parentId":8,"style":{"enabled":true,"varName":null}},"item-28":{"id":28,"type":"StaticText","parentId":8,"style":{"enabled":false,"varName":"input","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"WIDGET_INPUT","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-30":{"id":30,"type":"Checkbox","parentId":8,"style":{"enabled":true,"varName":"strokeToggle","text":"Stroke","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}}},"order":[0,8,16,18,22,19,20,21,23,24,25,26,17,7,6,5,11,14,1,12,13,27,30,28,9,4,3,2],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
  */ 
  
  // BBOX
  // ====
  var bbox = new Window("dialog", undefined, undefined, {closeButton: false}); 
  bbox.text = "Create Bounding Box"; 
  bbox.orientation = "row"; 
  bbox.alignChildren = ["center","top"]; 
  bbox.spacing = 35; 
  bbox.margins = 20; 
  
  // OPTIONS
  // =======
  var options = bbox.add("group", undefined, {name: "options"}); 
  options.orientation = "column"; 
  options.alignChildren = ["left","center"]; 
  options.spacing = 10; 
  options.margins = 0; 
  
  var customDims = options.add("checkbox", undefined, undefined, {name: "customDims"}); 
  customDims.text = "Custom dimensions"; 
  
  // DIMS
  // ====
  var dims = options.add("group", undefined, {name: "dims"}); 
  dims.enabled = false; 
  dims.orientation = "column"; 
  dims.alignChildren = ["right","center"]; 
  dims.spacing = 10; 
  dims.margins = 0; 
  
  // WGRP
  // ====
  var wGrp = dims.add("group", undefined, {name: "wGrp"}); 
  wGrp.orientation = "row"; 
  wGrp.alignChildren = ["left","center"]; 
  wGrp.spacing = 10; 
  wGrp.margins = 0; 
  
  var label = wGrp.add("statictext", undefined, undefined, {name: "label"}); 
  label.text = "Width:"; 
  
  var w = wGrp.add('edittext {properties: {name: "w"}}'); 
  w.text = "0"; 
  w.preferredSize.width = 60; 
  
  var unitW = wGrp.add("statictext", undefined, undefined, {name: "unitW"}); 
  unitW.text = docUnits.unit_short; 
  
  // HGRP
  // ====
  var hGrp = dims.add("group", undefined, {name: "hGrp"}); 
  hGrp.orientation = "row"; 
  hGrp.alignChildren = ["left","center"]; 
  hGrp.spacing = 10; 
  hGrp.margins = 0; 
  
  var label1 = hGrp.add("statictext", undefined, undefined, {name: "label1"}); 
  label1.text = "Height:"; 
  
  var h = hGrp.add('edittext {properties: {name: "h"}}'); 
  h.text = "0"; 
  h.preferredSize.width = 60; 
  
  var unitH = hGrp.add("statictext", undefined, undefined, {name: "unitH"}); 
  unitH.text = docUnits.unit_short; 
  
  // OPTIONS
  // =======
  var divider1 = options.add("panel", undefined, undefined, {name: "divider1"}); 
  divider1.alignment = "fill"; 
  
  // OFFSETGRP
  // =========
  var offsetGrp = options.add("group", undefined, {name: "offsetGrp"}); 
  offsetGrp.orientation = "row"; 
  offsetGrp.alignChildren = ["left","center"]; 
  offsetGrp.spacing = 10; 
  offsetGrp.margins = 0; 
  
  var statictext1 = offsetGrp.add("statictext", undefined, undefined, {name: "statictext1"}); 
  statictext1.text = "Offset:"; 
  
  var bboxOffset = offsetGrp.add('edittext {properties: {name: "bboxOffset"}}'); 
  bboxOffset.text = "0"; 
  bboxOffset.preferredSize.width = 60; 
  // bboxOffset.active = true
  
  var unit = offsetGrp.add("statictext", undefined, undefined, {name: "unit"}); 
  unit.text = docUnits.unit_short; 
  
  // OPTIONS
  // =======
  var divider2 = options.add("panel", undefined, undefined, {name: "divider2"}); 
  divider2.alignment = "fill"; 
  
  var multiBbox = options.add("checkbox", undefined, undefined, {name: "multiBbox"}); 
  multiBbox.text = "Per item"; 
  multiBbox.value = true; 
  
  var groupBboxes = options.add("checkbox", undefined, undefined, {name: "groupBboxes"}); 
  groupBboxes.text = "Group"; 
  groupBboxes.value = false; 
  
  if(selection.length == 1) {
    multiBbox.enabled = false
    multiBbox.value = false
    groupBboxes.enabled = false
    groupBboxes.value = false
  }
  
  var selectBboxes = options.add("checkbox", undefined, undefined, {name: "selectBboxes"}); 
  selectBboxes.text = "Select"; 
  selectBboxes.value = true; 
  
  var divider3 = options.add("panel", undefined, undefined, {name: "divider3"}); 
  divider3.alignment = "fill"; 
  
  var strokeToggle = options.add("checkbox", undefined, undefined, {name: "strokeToggle"}); 
  strokeToggle.text = "Stroke"; 
  strokeToggle.value = true
    
  var stroke = widget_input(docUnits, options, "Stroke", 0.0125 * 72, strokeToggle.value)
  
  var cutLineColor = options.add("checkbox", undefined, undefined, {name: "cutLineColor"}); 
  cutLineColor.text = "Cut line color"; 
  cutLineColor.enabled = strokeToggle.value; 
  
  // USERBTNS
  // ========
  var userBtns = bbox.add("group", undefined, {name: "userBtns"}); 
  userBtns.preferredSize.width = 80; 
  userBtns.orientation = "column"; 
  userBtns.alignChildren = ["fill","top"]; 
  userBtns.spacing = 10; 
  userBtns.margins = 0; 
  
  var cancel = userBtns.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Cancel"; 
  cancel.preferredSize.height = 30; 
  
  var ok = userBtns.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "OK"; 
  ok.preferredSize.height = 30; 
  
  // -----------------------------------------------------------------------------------
  
  strokeToggle.onClick = function() {
    if(strokeToggle.value) {
      stroke.widget.enabled = true
      cutLineColor.enabled = true
    } else {
      stroke.widget.enabled = false
      cutLineColor.enabled = false
    }
  }
  
  customDims.onClick = function() {
    if(customDims.value) {
      dims.enabled = true
    } else {
      dims.enabled = false
    }
  }
  
  bboxOffset.onChanging = function() {
    if(isNaN(Number(bboxOffset.text)) || Number(bboxOffset.text) == Infinity) {
      ok.enabled = false
    } else {
      ok.enabled = true
    }
  }
  
  var groupBboxes_origState = groupBboxes.value
  multiBbox.onClick = function() {
    if(multiBbox.value) {
      groupBboxes.enabled = true
      groupBboxes.value = groupBboxes_origState
    } else {
      groupBboxes.enabled = false
      groupBboxes.value = false
    }
  }
  
  // remember state
  groupBboxes.onClick = function() {
    groupBboxes_origState = groupBboxes.value
  }
  
  // -----------------------------------------------------------------------------------
  
  var choice = bbox.show();
  if(choice == 2) return false
  
  return {
    offset: Number(bboxOffset.text) * docUnits.multiplier,
    perItem: multiBbox.value,
    group: groupBboxes.value,
    select: selectBboxes.value,
    cutLineColor: cutLineColor.value,
    customDims: {
      enabled: customDims.value,
      width: Number(w.text) * docUnits.multiplier,
      height: Number(h.text) * docUnits.multiplier
    },
    stroke: {
      width: Number(stroke.input()) * docUnits.multiplier,
      enabled: strokeToggle.value
    }
  }
}

function bboxNWarning(n) {
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":5,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"warningMsg","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":false,"borderless":false,"resizeable":false},"text":"Warning","preferredSize":[0,0],"margins":20,"orientation":"column","spacing":15,"alignChildren":["center","top"]}},"item-2":{"id":2,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"ok","text":"OK","justify":"center","preferredSize":[70,30],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"cancel","text":"Cancel","justify":"center","preferredSize":[70,30],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"userBtns","preferredSize":[80,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-5":{"id":5,"type":"StaticText","parentId":0,"style":{"enabled":true,"varName":"warning","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"This might take a very long time to finish\nsince it needs to loop over n page items.\n\nSave before you continue. ","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}}},"order":[0,5,4,3,2],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
  */ 
  
  // WARNINGMSG
  // ==========
  var warningMsg = new Window("dialog", undefined, undefined, {closeButton: false}); 
  warningMsg.text = "Warning"; 
  warningMsg.orientation = "column"; 
  warningMsg.alignChildren = ["center","top"]; 
  warningMsg.spacing = 15; 
  warningMsg.margins = 20; 
  
  var warning = warningMsg.add("group"); 
  warning.orientation = "column"; 
  warning.alignChildren = ["left","center"]; 
  warning.spacing = 0; 
  
  warning.add("statictext", undefined, "This might take a very long time to finish", {name: "warning"}); 
  warning.add("statictext", undefined, "since it needs to loop over " + n + " page items. ", {name: "warning"}); 
  warning.add("statictext", undefined, "", {name: "warning"}); 
  warning.add("statictext", undefined, "Save before you continue. ", {name: "warning"}); 
  
  // USERBTNS
  // ========
  var userBtns = warningMsg.add("group", undefined, {name: "userBtns"}); 
  userBtns.preferredSize.width = 80; 
  userBtns.orientation = "row"; 
  userBtns.alignChildren = ["left","top"]; 
  userBtns.spacing = 10; 
  userBtns.margins = 0; 
  
  var cancel = userBtns.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Cancel"; 
  cancel.preferredSize.width = 70; 
  cancel.preferredSize.height = 30; 
  
  var ok = userBtns.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "OK"; 
  ok.preferredSize.width = 70; 
  ok.preferredSize.height = 30; 
  
  var choice = warningMsg.show();
  if(choice == 2) return false
  return true
}
