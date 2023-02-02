#include "jsx_modules.jsx"

// Create reference marks at the center of each side of the bounding box of each art object.
// Useful for rotationally aligning circles and ovals after printing.

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  var sourceDoc = activeDocument
  
  if(selection == 0) {
    return
  }
  var artObjects = selection
  
  var docUnits = getDocUnit()
  if(docUnits === false) return
  
  var markDims = dialog_getMarkDims([0.05 * 72, 0.1 * 72], docUnits)
  if(markDims === false) return false
  
  var marks = []
  var objContainers = []
  var mark, p
  for(var i = 0; i < artObjects.length; i++) {
    marks.push(sourceDoc.activeLayer.groupItems.add())
    marks[i].name = "bboxMarks"
    artObjects[i].bboxMidPoints = { // top, right, bottom, left
      0: [artObjects[i].position[0] + artObjects[i].width / 2, artObjects[i].position[1]],
      1: [artObjects[i].position[0] + artObjects[i].width, artObjects[i].position[1] - artObjects[i].height / 2],
      2: [artObjects[i].position[0] + artObjects[i].width / 2, artObjects[i].position[1] - artObjects[i].height],
      3: [artObjects[i].position[0], artObjects[i].position[1] - artObjects[i].height / 2]
    }
    
    artObjects[i].bboxMidPoints[0][1] += markDims.offset
    artObjects[i].bboxMidPoints[1][0] += markDims.offset
    artObjects[i].bboxMidPoints[2][1] -= markDims.offset
    artObjects[i].bboxMidPoints[3][0] -= markDims.offset
    
    for(var o = 0; o < 4; o++) {
      p = artObjects[i].bboxMidPoints[o]
      mark = marks[i].pathItems.add()
      mark.setEntirePath([
        [p[0], p[1] - markDims.length / 2],
        [p[0], p[1] + markDims.length / 2]
      ])
      mark.stroked = true
      mark.strokeWidth = markDims.width
      
      if(o == 1 || o == 3) {
        mark.rotate(90)
      }
    }
    
    if(markDims.groupToObj) {
      objContainers.push(sourceDoc.activeLayer.groupItems.add())
      objContainers[i].name = artObjects[i].name
      artObjects[i].moveToBeginning(objContainers[i])
      marks[i].moveToBeginning(objContainers[i])
    }
  }
  
  if(markDims.selectMarks) selection = marks
}

// default mark dimensions: [width, length]
function dialog_getMarkDims(defaultDims, docUnits) {
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":0,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"bboxMarkers","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"bbox Markers","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":15,"alignChildren":["center","top"]}},"item-1":{"id":1,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"options","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["right","center"],"alignment":null}},"item-2":{"id":2,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"userBtns","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-3":{"id":3,"type":"EditText","parentId":7,"style":{"enabled":true,"varName":"width","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":".2","justify":"left","preferredSize":[50,0],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"StaticText","parentId":7,"style":{"enabled":true,"varName":"label","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Width:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-5":{"id":5,"type":"Button","parentId":2,"style":{"enabled":true,"varName":"ok","text":"OK","justify":"center","preferredSize":[75,30],"alignment":null,"helpTip":null}},"item-6":{"id":6,"type":"Button","parentId":2,"style":{"enabled":true,"varName":"cancel","text":"Cancel","justify":"center","preferredSize":[75,30],"alignment":null,"helpTip":null}},"item-7":{"id":7,"type":"Group","parentId":13,"style":{"enabled":true,"varName":"widthGrp","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-8":{"id":8,"type":"Group","parentId":13,"style":{"enabled":true,"varName":"lengthGrp","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-10":{"id":10,"type":"StaticText","parentId":8,"style":{"enabled":true,"varName":"label","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Length:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-11":{"id":11,"type":"EditText","parentId":8,"style":{"enabled":true,"varName":"length","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":".4","justify":"left","preferredSize":[50,0],"alignment":null,"helpTip":null}},"item-13":{"id":13,"type":"Group","parentId":15,"style":{"enabled":true,"varName":"alignContainer","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["right","center"],"alignment":null}},"item-14":{"id":14,"type":"StaticText","parentId":1,"style":{"enabled":true,"varName":"label","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Marker dimensions","justify":"left","preferredSize":[0,0],"alignment":"center","helpTip":null}},"item-15":{"id":15,"type":"Group","parentId":1,"style":{"enabled":true,"varName":"dimGrp","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["center","center"],"alignment":null}},"item-16":{"id":16,"type":"StaticText","parentId":7,"style":{"enabled":true,"varName":"unitW","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"u","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-17":{"id":17,"type":"StaticText","parentId":8,"style":{"enabled":true,"varName":"unitL","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"u","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-18":{"id":18,"type":"Group","parentId":1,"style":{"enabled":true,"varName":"offsetGrp","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-19":{"id":19,"type":"StaticText","parentId":18,"style":{"enabled":true,"varName":"label","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Offset:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-20":{"id":20,"type":"EditText","parentId":18,"style":{"enabled":true,"varName":"offset","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"0","justify":"left","preferredSize":[50,0],"alignment":null,"helpTip":null}},"item-21":{"id":21,"type":"StaticText","parentId":18,"style":{"enabled":true,"varName":"unit","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"u","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-22":{"id":22,"type":"Divider","parentId":1,"style":{"enabled":true,"varName":null}},"item-23":{"id":23,"type":"Divider","parentId":1,"style":{"enabled":true,"varName":null}},"item-26":{"id":26,"type":"Checkbox","parentId":28,"style":{"enabled":true,"varName":"groupToObj","text":"Group with object(s)","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-27":{"id":27,"type":"Checkbox","parentId":28,"style":{"enabled":true,"varName":"selectMarks","text":"Select marks","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-28":{"id":28,"type":"Group","parentId":1,"style":{"enabled":true,"varName":"toggleGrp","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["left","center"],"alignment":null}}},"order":[0,1,14,15,13,7,4,3,16,8,10,11,17,22,18,19,20,21,23,28,26,27,2,5,6],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
  */ 
  
  // BBOXMARKS
  // ===========
  var bboxMarks = new Window("dialog"); 
  bboxMarks.text = "bbox Marks"; 
  bboxMarks.orientation = "column"; 
  bboxMarks.alignChildren = ["center","top"]; 
  bboxMarks.spacing = 13; 
  bboxMarks.margins = 16; 
  
  // OPTIONS
  // =======
  var options = bboxMarks.add("group", undefined, {name: "options"}); 
  options.orientation = "column"; 
  options.alignChildren = ["right","center"]; 
  options.spacing = 10; 
  options.margins = 0; 
  
  var label = options.add("statictext", undefined, undefined, {name: "label"}); 
  label.text = "Marker dimensions"; 
  label.alignment = ["center","center"]; 
  
  // DIMGRP
  // ======
  var dimGrp = options.add("group", undefined, {name: "dimGrp"}); 
  dimGrp.orientation = "column"; 
  dimGrp.alignChildren = ["center","center"]; 
  dimGrp.spacing = 10; 
  dimGrp.margins = 0; 
  
  // ALIGNCONTAINER
  // ==============
  var alignContainer = dimGrp.add("group", undefined, {name: "alignContainer"}); 
  alignContainer.orientation = "column"; 
  alignContainer.alignChildren = ["right","center"]; 
  alignContainer.spacing = 10; 
  alignContainer.margins = 0; 
  
  // WIDTHGRP
  // ========
  var widthGrp = alignContainer.add("group", undefined, {name: "widthGrp"}); 
  widthGrp.orientation = "row"; 
  widthGrp.alignChildren = ["left","center"]; 
  widthGrp.spacing = 10; 
  widthGrp.margins = 0; 
  
  var label1 = widthGrp.add("statictext", undefined, undefined, {name: "label1"}); 
  label1.text = "Width:"; 
  
  var width = widthGrp.add('edittext {properties: {name: "width"}}'); 
  width.text = defaultDims[0] / docUnits.multiplier; 
  width.preferredSize.width = 50; 
  // width.active = true
  
  var unitW = widthGrp.add("statictext", undefined, undefined, {name: "unitW"}); 
  unitW.text = docUnits.unit_short; 
  
  // LENGTHGRP
  // =========
  var lengthGrp = alignContainer.add("group", undefined, {name: "lengthGrp"}); 
  lengthGrp.orientation = "row"; 
  lengthGrp.alignChildren = ["left","center"]; 
  lengthGrp.spacing = 10; 
  lengthGrp.margins = 0; 
  
  var label2 = lengthGrp.add("statictext", undefined, undefined, {name: "label2"}); 
  label2.text = "Length:"; 
  
  var length = lengthGrp.add('edittext {properties: {name: "length"}}'); 
  length.text = defaultDims[1] / docUnits.multiplier; 
  length.preferredSize.width = 50; 
  
  var unitL = lengthGrp.add("statictext", undefined, undefined, {name: "unitL"}); 
  unitL.text = docUnits.unit_short; 
  
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
  
  var label3 = offsetGrp.add("statictext", undefined, undefined, {name: "label3"}); 
  label3.text = "Offset:"; 
  
  var offset = offsetGrp.add('edittext {properties: {name: "offset"}}'); 
  offset.text = "0"; 
  offset.preferredSize.width = 50; 
  
  var unit = offsetGrp.add("statictext", undefined, undefined, {name: "unit"}); 
  unit.text = docUnits.unit_short; 
  
  // OPTIONS
  // =======
  var divider2 = options.add("panel", undefined, undefined, {name: "divider2"}); 
  divider2.alignment = "fill"; 
  
  // TOGGLEGRP
  // =========
  var toggleGrp = options.add("group", undefined, {name: "toggleGrp"}); 
  toggleGrp.orientation = "column"; 
  toggleGrp.alignChildren = ["left","center"]; 
  toggleGrp.spacing = 10; 
  toggleGrp.margins = 0; 
  
  var groupToObj = toggleGrp.add("checkbox", undefined, undefined, {name: "groupToObj"}); 
  groupToObj.text = "Group with object(s)"; 
  
  var selectMarks = toggleGrp.add("checkbox", undefined, undefined, {name: "selectMarks"}); 
  selectMarks.text = "Select marks"; 
  
  // USERBTNS
  // ========
  var userBtns = bboxMarks.add("group", undefined, {name: "userBtns"}); 
  userBtns.orientation = "row"; 
  userBtns.alignChildren = ["left","center"]; 
  userBtns.spacing = 10; 
  userBtns.margins = 0; 
  
  var ok = userBtns.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "OK"; 
  ok.preferredSize.width = 75; 
  ok.preferredSize.height = 30; 
  
  var cancel = userBtns.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Cancel"; 
  cancel.preferredSize.width = 75; 
  cancel.preferredSize.height = 30; 
  
  var choice = bboxMarks.show();
  if(choice == 2) return false
  
  return {
    width: Number(width.text) * docUnits.multiplier,
    length: Number(length.text) * docUnits.multiplier,
    offset: Number(offset.text) * docUnits.multiplier,
    groupToObj: groupToObj.value,
    selectMarks: selectMarks.value
  }
}
