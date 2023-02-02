#include "jsx_modules.jsx"

// Copies the selection into the verticalPoleBanner.ait template and sets it up to be print-ready.
// This script asks for a 26 inch wide item to fit into the template which was made for that specific dimension.

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

// TODO:
// VARIABLE 26 INCH SIZE AND DOCUMENTATION ON HOW TO CHANGE THE TEMPLATE

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  sourceDoc = activeDocument
  
  if(selection.length < 1) {
    alert("Select an object to layout into a print file.")
    return
  } else if(selection.length > 1) {
    alert("Too many objects selected! Select only one object to layout into a print file.\n\nDid you mean to group the selection first?")
    return
  }
  
  xmlConfig = getXMLConfig()
  
  // sourceDoc not saved
  save = true
  if(sourceDoc.path.name.length == 0) {
    if(!dialog_saveTheSourceFile()) {
      return
    }
    save = false
  }
  
  // validate template file path, open new template
  sourceDocIsTemplate = false
  var fileFound = false
  
  // identify UID, active doc is a template
  var UID0 = "238957340_VERTICAL-POLE-BANNER_69721-086134-823509285108109"
  for(textFrame = sourceDoc.textFrames.length - 1; textFrame >= 0; textFrame--) {
    if(sourceDoc.textFrames[textFrame].contents == UID0) {
      sourceDocIsTemplate = true
      fileFound = true
      templateDoc = sourceDoc
      break
    }
  }
  
  // open new template
  while(!fileFound) {
    var filePath_verticalPoleBanner = xmlConfig.xml.filePaths.ait.verticalPoleBanner
    if(validateFilePath(filePath_verticalPoleBanner)) {
      copy(sourceDoc.selection)
      templateDoc = open(new File(filePath_verticalPoleBanner))
      fileFound = true
      paste()
    } else { // file not found
      var inputFilePath = dialog_missingTemplateFile("Vertical Pole Banner", xmlConfig.xml.filePaths.ait.verticalPoleBanner.toString())
      if(inputFilePath === false) return false
      if(inputFilePath.length > 0 && validateFilePath(inputFilePath)) { // check user input for new valid proof doc path and try to continue
        if(inputFilePath.slice(inputFilePath.length-4) != ".ait") { // file exits but not .ait
          if(dialog_confirmProofTemplate(inputFilePath)) { // continue with non .ait path
            xmlConfig.xml.filePaths.ait.verticalPoleBanner = inputFilePath
            writeXML(xmlConfig)
          }
        } else {
          xmlConfig.xml.filePaths.ait.verticalPoleBanner = inputFilePath
          writeXML(xmlConfig)
        }
      }
    }
  }
  
  var docUnits = getDocUnit()
  if(docUnits === false) return
  
  artObject = selection[0]
  var widthGoal = 26 * 72 // inches
  
  // ensure correct art object scale
  if(prec(artObject.width / docUnits.multiplier, 3) != prec(26 * 72 / docUnits.multiplier, 3)) {
    scaleFitMultiplier = widthGoal / artObject.width
    var result = scaleToStandardWidth(docUnits)
    if(result == 2) {
      artObject.resize(scaleFitMultiplier * 100, scaleFitMultiplier * 100, true, true, true, true, scaleFitMultiplier * 100, undefined)
    } else if (result == false) {
      return
    }
  }
  
  // position
  var pageItem
  pageItem = getPageItemByName("center", "Markers")
  if(pageItem != false) {
    artObject.position = pageItem.position
  } else {
    return
  }
  
  var artLayer = getLayerByName("Art")
  artObject.position = [artObject.position[0] - artObject.width / 2, artObject.position[1] + artObject.height / 2]
  var artObject_marginTop = artObject.duplicate()
  var artObject_marginBottom = artObject.duplicate()
  artObject_marginTop.rotate(180)
  artObject_marginBottom.rotate(180)
  
  pageItem = getPageItemByName("margin_top_fold", "Markers")
  if(pageItem != false) {
    artObject_marginTop.position = arrayOffset(pageItem.position, [0, artObject_marginTop.height], "add")
  } else {
    return
  }
  
  pageItem = getPageItemByName("margin_bottom_fold", "Markers")
  if(pageItem != false) {
    artObject_marginBottom.position = pageItem.position
  } else {
    return
  }
  
  // clipMask
  pageItem = getPageItemByName("clipMask_top", "clipMasks").duplicate(artLayer)
  if(pageItem != false) {
    var clipMask_top = pageItem
  } else {
    return
  }
  
  pageItem = getPageItemByName("clipMask_bottom", "clipMasks").duplicate(artLayer)
  if(pageItem != false) {
    var clipMask_bottom = pageItem
  } else {
    return
  }
  
  selection = [artObject_marginTop, clipMask_top]
  redraw()
  executeMenuCommand('makeMask')
  selection = [artObject_marginBottom, clipMask_bottom]
  redraw()
  executeMenuCommand('makeMask')
  
  if(save) saveForPrint()
}

function saveForPrint() {
  // prevent loss of unsaved .ai changes on template save
  if(sourceDocIsTemplate) {
    sourceDoc.save()
  }
  
  var sourceDoc_fileName = sourceDoc.name.split('.').slice(0, -1).join('.')
  
  if(sourceDocIsTemplate) {
    filePath = new File(sourceDoc.path + "/" + sourceDoc.name)
  } else {
    var i = 0
    while(true) {
      if(!(validateFilePath(sourceDoc.path + "/" + sourceDoc_fileName + "_PRINT_" + i + ".eps") || validateFilePath(sourceDoc.path + "/" + sourceDoc_fileName + "_PRINT_" + i + ".pdf"))) { // check for iteration
        filePath = new File(sourceDoc.path + "/" + sourceDoc_fileName + "_PRINT_" + i)
        break
      } else {
        i += 1
      }
    }
  }
  
  var options = new EPSSaveOptions();
  options.cmykPostScript = true
  options.embedAllFonts = true
  templateDoc.saveAs(filePath, options) // eps
  templateDoc.close(SaveOptions.DONOTSAVECHANGES)
}

function getLayerByName(layerName, doc) {
  var doc = doc !== undefined ? doc : activeDocument
  for(var layer = 0; layer < activeDocument.layers.length; layer++) {
    if(doc.layers[layer].name == layerName) {
      return doc.layers[layer]
    }
  }
  alert("Could not find required layer: \"" + layerName + "\"\n\nDid you rename/delete the layer?")
  return false
}

function getPageItemByName(pageItemName, layerName, doc) {
  var doc = doc !== undefined ? doc : activeDocument
  if(layerName == undefined) {
    for(var pageItem = 0; pageItem < doc.pageItems.length; pageItem++) {
      if(doc.pageItems[pageItem].name == pageItemName) {
        return doc.pageItems[pageItem]
      }
    }
    alert("Could not find pageItem: \"" + pageItemName + "\" in document: \"" + doc.name + "\"")
    return false
  } else {
    var layer = getLayerByName(layerName, doc)
    for(var pageItem = 0; pageItem < layer.pageItems.length; pageItem++) {
      if(layer.pageItems[pageItem].name == pageItemName) {
        return layer.pageItems[pageItem]
      }
    }
    alert("Could not find pageItem: \"" + pageItemName + "\" in layer: \"" + layerName + "\" in document: \"" + doc.name + "\"")
    return false
  }
}

function arrayOffset(arr0, arr1, op) {
  if(arr0.length == arr1.length) {
    var arrTemp = []
    for(var i = 0; i < arr0.length; i++) {
      switch(op) {
        case "add":
        arrTemp[i] = arr0[i] + arr1[i];
        break;
        case "sub":
        arrTemp[i] = arr0[i] - arr1[i];
        break;
        case "mult":
        arrTemp[i] = arr0[i] * arr1[i];
        break;
        case "div":
        arrTemp[i] = arr0[i] / arr1[i];
      }
    }
    return arrTemp
  } else {
    throw EvalError("Array lengths differ")
  }
}

function scaleToStandardWidth(docUnits) {
  // https://scriptui.joonas.me
  
  // WARNING_ARTOBJWIDTH
  // ===================
  var warning_artObjWidth = new Window("dialog"); 
  warning_artObjWidth.text = "Vertical Pole Banner - Warning: Art object width"; 
  warning_artObjWidth.orientation = "column"; 
  warning_artObjWidth.alignChildren = ["center","top"]; 
  warning_artObjWidth.spacing = 10; 
  warning_artObjWidth.margins = 16; 
  
  // TEXTINFO
  // ========
  var textInfo = warning_artObjWidth.add("group", undefined, {name: "textInfo"}); 
  textInfo.orientation = "column"; 
  textInfo.alignChildren = ["left","center"]; 
  textInfo.spacing = 10; 
  textInfo.margins = 0; 
  
  var warning = textInfo.add("statictext", undefined, undefined, {name: "warning"}); 
  warning.text = "The width of the selected art object isn't the standard 26 inches for this print file template."; 
  
  var question = textInfo.add("statictext", undefined, undefined, {name: "question"}); 
  question.text = "Do you want the script to uniformly scale the art object to a width of 26 inches? "; 
  
  // DIMS
  // ====
  var dims = warning_artObjWidth.add("group", undefined, {name: "dims"}); 
  dims.orientation = "row"; 
  dims.alignChildren = ["left","center"]; 
  dims.spacing = 10; 
  dims.margins = 0; 
  
  // CURRENT
  // =======
  var current = dims.add("panel", undefined, undefined, {name: "current"}); 
  current.text = "Current dimensions"; 
  current.orientation = "column"; 
  current.alignChildren = ["left","top"]; 
  current.spacing = 10; 
  current.margins = 10; 
  
  var artObjWidth1 = current.add("statictext", undefined, undefined, {name: "artObjWidth1"}); 
  artObjWidth1.text = "Width: " + prec(artObject.width / docUnits.multiplier, 4) + " " + docUnits.unit_short; 
  
  var artObjHeight1 = current.add("statictext", undefined, undefined, {name: "artObjHeight1"}); 
  artObjHeight1.text = "Height: " + prec(artObject.height / docUnits.multiplier, 4) + " " + docUnits.unit_short; 
  
  // PROJECTED
  // =========
  var projected = dims.add("panel", undefined, undefined, {name: "projected"}); 
  projected.text = "Scaled Dimensions"; 
  projected.orientation = "column"; 
  projected.alignChildren = ["left","top"]; 
  projected.spacing = 10; 
  projected.margins = 10; 
  
  var artObjWidth2 = projected.add("statictext", undefined, undefined, {name: "artObjWidth2"}); 
  artObjWidth2.text = "Width: " + prec(artObject.width * scaleFitMultiplier / docUnits.multiplier, 4) + " " + docUnits.unit_short; 
  
  var artObjHeight2 = projected.add("statictext", undefined, undefined, {name: "artObjHeight2"}); 
  artObjHeight2.text = "Height: " + prec(artObject.height * scaleFitMultiplier / docUnits.multiplier, 4) + " " + docUnits.unit_short; 
  
  // SCALECHOICE
  // =========
  var scaleChoice = dims.add("group", undefined, undefined, {name: "scaleChoice"}); 
  scaleChoice.orientation = "column"; 
  scaleChoice.alignChildren = ["left","top"]; 
  
  
  var radiobutton_scale = scaleChoice.add("radiobutton", undefined, undefined, {name: "radiobutton_scale"}); 
  radiobutton_scale.text = "Scale"; 
  radiobutton_scale.value = true; 
  
  var radiobutton_noScale = scaleChoice.add("radiobutton", undefined, undefined, {name: "radiobutton_noScale"}); 
  radiobutton_noScale.text = "Don't scale";  
  
  // USERBTNS
  // ========
  var userBtns = warning_artObjWidth.add("group", undefined, {name: "userBtns"}); 
  userBtns.orientation = "row"; 
  userBtns.alignChildren = ["left","center"]; 
  userBtns.spacing = 10; 
  userBtns.margins = 0; 
  
  var cancel = userBtns.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Stop script"; 
  
  var ok = userBtns.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "Continue"; 
  
  var choice = warning_artObjWidth.show();
  
  switch (choice) {
    case 1: // continue
    if(radiobutton_scale.value) {
      return 2
    } else {
      return
    }
    
    case 2: // cancel
    return false
    
    default:
    break;
  }
}

function dialog_saveTheSourceFile() {
  // https://scriptui.joonas.me 
  
  // SAVETHESOURCEFILE
  // =================
  var saveTheSourceFile = new Window("dialog", undefined, undefined, {closeButton: false}); 
  saveTheSourceFile.text = "Save the Source File?"; 
  saveTheSourceFile.orientation = "column"; 
  saveTheSourceFile.alignChildren = ["center","top"]; 
  saveTheSourceFile.spacing = 11; 
  saveTheSourceFile.margins = 16; 
  
  var statictext1 = saveTheSourceFile.add("group"); 
  statictext1.preferredSize.width = 335; 
  statictext1.orientation = "column"; 
  statictext1.alignChildren = ["left","center"]; 
  statictext1.spacing = 0; 
  statictext1.alignment = ["left","top"]; 
  
  statictext1.add("statictext", undefined, "You should probably save the source file first in case", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "something causes Illustrator to crash.", {name: "statictext1"}); 
  statictext1.preferredSize.width = 335; 
  
  // GROUP1
  // ======
  var group1 = saveTheSourceFile.add("group", undefined, {name: "group1"}); 
  group1.orientation = "row"; 
  group1.alignChildren = ["left","center"]; 
  group1.spacing = 10; 
  group1.margins = 0; 
  
  var cancel = group1.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Stop Script"; 
  
  var ok = group1.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "Continue without saving"; 
  
  var choice = saveTheSourceFile.show();
  
  switch (choice) {
    case 1: // continue
    return true
    
    case 2: // cancel
    return false
    
    default:
    break;
  }
}
