#include "jsx_modules.jsx"

// Creates text of the dimensions per each selected object in the scene's measurement unit.

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

// TODO:
// DOES NOT ACCOUNT FOR STROKES BUT THIS IS A GOOD THING SOMETIMES - include as a user option?

// Make artObject = artObject without guides

// account for expanded blocks of text that are expensive to cycle through

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  
  if(selection == 0) {
    return
  }
  
  var xmlConfig = getXMLConfig()
  var docScaleID = xmlConfig.xml.docScale.textFrameIdentifier.toString()
  
  textBG_marginMultiplier = [1.1, 1.1]
  var textFrameFinalScaleMult = .5
  decimalPrecision = 2
  scriptName = $.fileName.split("\\") // Will not work in debug as slashes are flipped when script is run in debug
  scriptName = scriptName[scriptName.length-1]
  
  sourceDoc = activeDocument
  
  var docUnits = getDocUnit()
  if(docUnits === false) return
  
  // Get scene scale multiplier
  var sceneScaleMultiplier = 1
  textFrames = sourceDoc.textFrames
  var docScaleFound = false
  for(var textFrame = 0; textFrame < textFrames.length; textFrame++) {
    if(textFrames[textFrame].name == docScaleID) {
      sceneScaleMultiplier = 1 / parseFloat(textFrames[textFrame].contents.match(/[\d\.]+/)); // regex: get number/decimal from string
      docScaleFound = true
      break
    }
  }
  // backwards compatibility to check for scale text without standard name identifier
  if(!docScaleFound) {
    var s, numDec
    for(var textFrame = 0; textFrame < textFrames.length; textFrame++) {
      s = textFrames[textFrame].contents.toLowerCase()
      numDec = s.match(/[\d\.]+/)
      if(numDec != null) {
        numDec = numDec.toString()
        if(s.indexOf("scale") != -1 && /[\d\.]+/.test(s) && (numDec + " scale").length == s.length && numDec != ".") { // search string for scale && number/decimal && length
          sceneScaleMultiplier = 1 / parseFloat(numDec); // regex: get number/decimal from string
          textFrames[textFrame].name = docScaleID
          break
        }
      }
    }
  }
  
  if(sceneScaleMultiplier == Infinity) {
    alert("Cannot calculate document scale conversion multiplier. Scale text must be set to a non-zero value.", scriptName)
    return 
  }
  
  // record which items are locked/hidden, unlock/unhide, duplicate selection, expand, get dimensions, delete duplicate, restore original selection, relock/rehide
  var artObjects = selection
  var objectsToMeasure = []
  var originalHidden = []
  var originalLocked = []
  
  // record selected locked/hidden items, unlock/unhide them
  for(var i = 0; i < sourceDoc.pageItems.length; i++) {
    if(sourceDoc.pageItems[i].selected && sourceDoc.pageItems[i].hidden) {
      originalHidden.push(sourceDoc.pageItems[i])
      sourceDoc.pageItems[i].hidden = false
    }
  }
  for(var i = 0; i < sourceDoc.pageItems.length; i++) {
    if(sourceDoc.pageItems[i].selected && sourceDoc.pageItems[i].locked) {
      originalLocked.push(sourceDoc.pageItems[i])
      sourceDoc.pageItems[i].locked = false
    }
  }
  
  // duplication
  for(var i = 0; i < sourceDoc.selection.length; i++) {
    objectsToMeasure.push(sourceDoc.selection[i].duplicate())
    objectsToMeasure[i].name = "B (duplicate)"
  }
  selection = objectsToMeasure
  
  // completely expand duplicated objects
  // outline all live text but only keep track of top level as that is all that is needed (tracking sub-level text is tedious and don't get looped over for measurement anyway)
  selection[0].position = [selection[0].position[0], selection[0].position[1]] // redraw() alternative
  executeMenuCommand('expandStyle')
  var textToOutline = {
    text: [],
    indexMap: []
  }
  for(var i = 0; i < sourceDoc.textFrames.length; i++) {
    if(sourceDoc.textFrames[i].selected) {
      textToOutline.indexMap.push(Array.indexOf(objectsToMeasure, sourceDoc.textFrames[i]))
      textToOutline.text.push(sourceDoc.textFrames[i])
    }
  }
  
  // outline live text
  selection[0].position = [selection[0].position[0], selection[0].position[1]] // redraw() alternative
  var outlinedText
  for(var i = 0; i < textToOutline.text.length; i++) {
    outlinedText = textToOutline.text[i].createOutline()
    if(textToOutline.indexMap[i] != -1) { // only keep track of top level outlined text
      objectsToMeasure[textToOutline.indexMap[i]] = outlinedText
    }
  }
  
  // create dimension text/labels
  objectsToMeasure = selection // reset since objects with appearances become semi-invalid from expandStyle
  for(var i = 0; i < objectsToMeasure.length; i++) {
    objectsToMeasure[i].dims = getDimensions(objectsToMeasure[i], docUnits, sceneScaleMultiplier)
    createDimLabel(objectsToMeasure[i], textFrameFinalScaleMult, docUnits)
  }
  
  for(var i = 0; i < objectsToMeasure.length; i++) {
    objectsToMeasure[i].remove()
  }
  
  selection = artObjects
  // relock/rehide original objects
  for(var i = 0; i < originalHidden.length; i++) {
    originalHidden[i].hidden = true
  }
  for(var i = 0; i < originalHidden.length; i++) {
    originalHidden[i].locked = true
  }
}

function createDimLabel(proxyObject, textFrameFinalScaleMult, docUnits) {
  var a = proxyObject
  var w = proxyObject.dims[0]
  var h = proxyObject.dims[1]
  var p = proxyObject.position
  var textFrameScale
  
  var textFrame = a.layer.textFrames.add()
  
  var w_unit = h_unit = docUnits.unit_short
  if(sourceDoc.rulerUnits == RulerUnits.Inches) { // special unit overwrite for inches or feet
    w_unit = h_unit = "\""
  } else if(docUnits.multiplier == 864) {
    w_unit = h_unit = "\'"
  }
  
  // set artObject dimensions to text contents
  if(a.width == 0) {
    textFrame.contents = h + h_unit
    textFrameScale = a.height / textFrame.height
  } else if(a.height == 0) {
    textFrame.contents = w + w_unit
    textFrameScale = a.width / textFrame.width
  } else {
    textFrame.contents = w + w_unit + " x " + h + h_unit
    textFrameScale = a.width / textFrame.width
  }
  
  textFrameScale *= textFrameFinalScaleMult * 100
  textFrame.resize(textFrameScale, textFrameScale)
  
  // create label
  if(a.width == 0) {
    setTextLabel("yDim", textFrame, a)
  } else if(a.height == 0) {
    setTextLabel("xDim", textFrame, a)
  } else {
    var targetPosition = [p[0], p[1] + textFrame.height]
    if(a.strokeWidth) { // STROKE WIDTH DOES NOT WORK FOR TEXT. USE DIFFERENT PROPERTY. position scale improperly for everything?
      targetPosition = [p[0], p[1] + a.strokeWidth + textFrame.height]
    }
    textFrame.position = targetPosition
  }
}

function getDimensions(artObject, docUnits, sceneScaleMultiplier) {
  // Set dimensions
  var w = artObject.width * sceneScaleMultiplier / docUnits.multiplier
  var h = artObject.height * sceneScaleMultiplier / docUnits.multiplier
  
  // Round then remove trailing zeros
  w = parseFloat(w.toFixed(decimalPrecision));
  h = parseFloat(h.toFixed(decimalPrecision));
  
  return [w,h]
}

function unitConvert() {
  // // Simplify inches to feet if necessary
  // unitConversion = inchesToFeet(w, w_unit)
  // if(unitConversion) {
  //     w = unitConversion[0];
  //     w_unit = unitConversion[1];
  // }
  // unitConversion = inchesToFeet(h, h_unit);
  // if(unitConversion) {
  //     h = unitConversion[0];
  //     h_unit = unitConversion[1];
  // }
}

function setTextLabel(objectType, textFrame, artObject) {
  const textHeightOffsetMultiplier = .0806451613 // myriad pro font
  // Horiontal line (0 height) / vertical line (0 width)
  textBG = artObject.layer.pathItems.polygon(0, 0, 1, 4) // arg 3 doesn't produce expected height, so overwite with textBG.height
  textBG.width = textFrame.width * textBG_marginMultiplier[0]
  textBG.height = textFrame.height * textBG_marginMultiplier[1]
  
  if(objectType == "yDim") {
    textFrame.position = [
      artObject.position[0] - textFrame.width / 2,
      (artObject.position[1] - artObject.height / 2) + textFrame.height / 2
    ]
    textBG.position = [
      artObject.position[0] - textBG.width / 2,
      artObject.position[1] - artObject.height / 2 + textBG.height / 2
    ]
  } else if(objectType == "xDim") {
    textFrame.position = [
      artObject.position[0] + artObject.width / 2 - textFrame.width / 2,
      artObject.position[1] + textFrame.height / 2 - (textFrame.height * textHeightOffsetMultiplier / 2) // minus implicit text vertical offset 
    ]
    textBG.position = [
      artObject.position[0] + artObject.width / 2 - textBG.width / 2, 
      artObject.position[1] + textBG.height / 2
    ]
  }
  
  textBG.stroked = false
  textBG.filled = true
  textBG.fillColor.cyan = 0
  textBG.fillColor.magenta = 0
  textBG.fillColor.yellow = 0
  textBG.fillColor.black = 0
  textBG.zOrder(ZOrderMethod.SENDBACKWARD)
  selectionInit = selection
  executeMenuCommand('deselectall')
  selection = [textBG, textFrame]
  selection[0].position = [selection[0].position[0], selection[0].position[1]] // allows for grouping to occur. better than redraw()
  executeMenuCommand('group')
  selection = selectionInit
}

function inchesToFeet(dim, dim_unit) {
  // if (Math.round(dim / 12) === dim / 12) {
  dim /= 12;
  dim_unit = "\'"; // feet
  return [dim, dim_unit];
  // }
}
