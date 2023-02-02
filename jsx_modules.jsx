// General modules

function getDocUnit(targetDoc) {
  targetDoc = (targetDoc != undefined ? targetDoc : activeDocument)
  var multiplier
  switch (targetDoc.rulerUnits) {
    case RulerUnits.Unknown:
    multiplier = dialog_pickUnit()
    if(multiplier == false) {
      return false
    }
    break;
    
    case RulerUnits.Inches:
    multiplier = 72
    unit = "Inches"
    unit_short = "in"
    break;
    
    case RulerUnits.Picas:
    multiplier = 12
    unit = "Picas"
    unit_short = "picas"
    break;
    
    case RulerUnits.Millimeters:
    multiplier = 2.8346457
    unit = "Millimeters"
    unit_short = "mm"
    break;
    
    case RulerUnits.Centimeters:
    multiplier = 28.346457
    unit = "Centimeters"
    unit_short = "cm"
    break;
    
    case RulerUnits.Points:
    multiplier = 1
    unit = "Points"
    unit_short = "pts"
    break;
    
    case RulerUnits.Pixels:
    multiplier = 1
    unit = "Pixels"
    unit_short = "px"
    break;
    
    // feet: 864
    // yards: 2592
    // meters: 2834.6457
    
    default:
    multiplier = 1 // points, pixels
    unit = "Pixels"
    unit_short = "px"
    alert("Unknown document unit of measurement. Defaulting to scale conversion multiplier of 1 (pixels/points).")
  }
  
  return {
    multiplier: multiplier,
    unit: unit,
    unit_short: unit_short
  }
}

function dialog_pickUnit() {
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":6,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"unitType","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Choose document unit","preferredSize":[0,0],"margins":16,"orientation":"row","spacing":35,"alignChildren":["center","top"]}},"item-1":{"id":1,"type":"RadioButton","parentId":9,"style":{"enabled":true,"varName":"unit_feet","text":"Feet","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-2":{"id":2,"type":"RadioButton","parentId":9,"style":{"enabled":true,"varName":"unit_yards","text":"Yards","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-3":{"id":3,"type":"RadioButton","parentId":9,"style":{"enabled":true,"varName":"unit_meters","text":"Meters","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-4":{"id":4,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["fill","center"],"alignment":null}},"item-5":{"id":5,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"cancel","text":"Stop script","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-6":{"id":6,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"ok","text":"OK","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-7":{"id":7,"type":"StaticText","parentId":10,"style":{"enabled":true,"varName":"info1","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":true,"text":"The unit of measurement you are using in the source document is considered unknown by Illustrator.","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-8":{"id":8,"type":"StaticText","parentId":10,"style":{"enabled":true,"varName":"info2","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":true,"text":"Which unit are you using?","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-9":{"id":9,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-10":{"id":10,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[336,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["left","center"],"alignment":null}}},"order":[0,10,7,8,9,1,2,3,4,5,6],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
  */ 
  
  // UNITTYPE
  // ========
  var unitType = new Window("dialog"); 
  unitType.text = "Choose unit of measurement"; 
  unitType.orientation = "row"; 
  unitType.alignChildren = ["center","top"]; 
  unitType.spacing = 35; 
  unitType.margins = 16; 
  
  // GROUP1
  // ======
  var group1 = unitType.add("group", undefined, {name: "group1"}); 
  group1.preferredSize.width = 336; 
  group1.orientation = "column"; 
  group1.alignChildren = ["left","center"]; 
  group1.spacing = 10; 
  group1.margins = 0; 
  
  var info1 = group1.add("group"); 
  info1.orientation = "column"; 
  info1.alignChildren = ["left","center"]; 
  info1.spacing = 0; 
  
  info1.add("statictext", undefined, "The unit of measurement you are using in the source", {name: "info1"}); 
  info1.add("statictext", undefined, "document is, amazingly, considered unknown by Illustrator.", {name: "info1"}); 
  
  var info2 = group1.add("statictext", undefined, undefined, {name: "info2"}); 
  info2.text = "Which unit are you using?"; 
  
  // GROUP2
  // ======
  var group2 = unitType.add("group", undefined, {name: "group2"}); 
  group2.orientation = "column"; 
  group2.alignChildren = ["left","center"]; 
  group2.spacing = 10; 
  group2.margins = 0; 
  
  var unit_feet = group2.add("radiobutton", undefined, undefined, {name: "unit_feet"}); 
  unit_feet.text = "Feet"; 
  unit_feet.value = true;
  
  var unit_yards = group2.add("radiobutton", undefined, undefined, {name: "unit_yards"}); 
  unit_yards.text = "Yards"; 
  
  var unit_meters = group2.add("radiobutton", undefined, undefined, {name: "unit_meters"}); 
  unit_meters.text = "Meters"; 
  
  // GROUP3
  // ======
  var group3 = unitType.add("group", undefined, {name: "group3"}); 
  group3.orientation = "column"; 
  group3.alignChildren = ["fill","center"]; 
  group3.spacing = 10; 
  group3.margins = 0; 
  
  var cancel = group3.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Cancel"; 
  
  var ok = group3.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "OK"; 
  
  var choice = unitType.show();
  
  switch (choice) {
    case 1: // continue
    if(unit_feet.value) {
      unit = "Feet"
      unit_short = "ft"
      return 864
    } else if(unit_yards.value) {
      unit = "Yards"
      unit_short = "yd"
      return 2592
    } else if (unit_meters.value) {
      unit = "Meters"
      unit_short = "m"
      return 2834.6457
    }
    
    case 2: // cancel
    return false
    
    default:
    alert("Something went wrong: Couldn't get unit of measurement.\n\nStopping script.")
    return false
  }
}

Object.size = function(obj) {
  var size = 0, key
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++
  }
  return size
}

// directly select only target items in selection by name
function directGetItems(objects, target) {
  var targets = []
  for(var pageItem = 0; pageItem < objects.pageItems.length; pageItem++) {
    if(!objects.pageItems[pageItem].hidden && !objects.pageItems[pageItem].locked) {
      if(objects.pageItems[pageItem].typename == "GroupItem") {
        targets = targets.concat(directGetItems(objects.pageItems[pageItem], target))
      } else if(objects.pageItems[pageItem].typename == target) {
        targets.push(objects.pageItems[pageItem])
      }
    }
  }
  return targets
}

// prevent float comparison rounding errors
function prec(num, prec) {
  var prec = prec !== undefined ? prec : 8
  return parseFloat(num.toFixed(prec))
}

function compareArrays(a, b) {
  if(a.length != b.length) return false
  for(var i = 0; i < a.length; i++) {
    if(a[i] !== b[i]) return false
  }
  return true
}

function firstAvailableLayer(doc) {
  doc = doc === undefined ? activeDocument : doc
  for(var i = 0; i < doc.layers.length; i++) {
    if(!doc.layers[i].locked && doc.layers[i].visible) {
      return doc.layers[i]
    }
  }
  return false
}

Array.indexOf = function(arr, item) {
  for(var i = 0; i < arr.length; i++) {
    if(arr[i] === item)
    return i
  }
  return -1
}

// removes an element from an array
// does not work in loops. for removing multiple items: first change undesired elements to undefined then use filterArray 
function removeElement(arr, item, howmany) {
  var howmany = howmany !== undefined ? howmany : 1
  var i = Array.indexOf(arr, item)
  if(i === -1) return -1
  return arr.splice(i, howmany)
}

// return new array without any instances of item
function filterArray(arr, item) {
  var arr_filtered = []
  for(var i = 0; i < arr.length; i++) {
    if(arr[i] !== item) {
      arr_filtered.push(arr[i])
    }
  }
  return arr_filtered
}

/**
* Get XML data from scriptConfig.xml that supports the jsx scripts
* @returns {XML} XML data
*/
function getXMLConfig() {
  var fileName = "scriptConfig.xml"
  var filePath = app.path.fsName.replace(/\\/g, "/") + "/Presets/en_US/Scripts/config/" + fileName
  return readXML(filePath)
}

/**
* Get XML file contents from file path
* @param {File|string} filePath 
* XML file path
* @returns XML file contents
*/
function readXML(filePath) {
  filePath = filePath.toString()
  var fileName = filePath.replace(/^.*[\\\/]/, "")
  var file = new File(filePath)
  file.open("r")
  var content = file.read()
  file.close()
  return {
    file: file,
    xml: new XML(content),
    fileName: fileName,
    filePath: filePath.toString()
  }
}

/**
* Get meta data of target script
* @param {object|undefined} filePath $.fileName targets current script. undefined default targets jsx modules script.  
* @returns {object} Object of strings
*/
function getScriptConfig(filePath) {
  if(!filePath) {
    filePath = $.fileName
    $.writeln("No script config arg provided. Targeting modules script meta data instead: " + File($.fileName).fsName.replace(/\\/g, "/"))
  }
  var scriptConfig = {
    filePath: File(filePath).fsName.replace(/\\/g, "/"),
    path: File(filePath).parent.fsName.replace(/\\/g, "/"),
    fileName: File(filePath).name,
  }
  scriptConfig.ext = scriptConfig.fileName.split(".").slice(-1).join()
  scriptConfig.name = function() {
    var name = scriptConfig.fileName.split(".")
    return name.slice(0, name.length - 1).join(".")
  }()
  return scriptConfig
}

// Get meta data of active Illustrator document
function initDoc() {
  var sourceDoc = {
    doc: activeDocument,
    path: activeDocument.path.fsName.replace(/\\/g, "/"),
    name: activeDocument.name.split(".").slice(0, -1).join("."),
    filePath: File(activeDocument.path + "/" + activeDocument.name).fsName.replace(/\\/g, "/"),
    ext: activeDocument.name.split(".").slice(-1).join(),
    initProofPreviews: function() {
      var dir = "/.proofPreviews"
      var path = Folder(sourceDoc.path + dir)
      if(!path.exists) path.create()
      sourceDoc.proofPreviews = {
        path: path.toString()
      }
    }
  }
  sourceDoc.fileName = sourceDoc.name + "." + sourceDoc.ext
  return sourceDoc
}

/**
* Execute a script from a file's string contents using BridgeTalk
* @param {string} scriptStr 
* String contents of file to modify
* @param {string} filePath 
* File path of file to be executed
*/
function createBridgeTalkPackage(scriptStr, filePath) {
  var pathToScript = "var btScript_MyLocation = \"" + filePath + "\";"
  var script = "var scp ='" + bridgeTalkEncode("LOCATION\r" + scriptStr) + "'"
  script += ";\nvar scpDecoded = \rdecodeURI( scp ).replace('LOCATION', '" + pathToScript + "');\n"
  script += "eval(scpDecoded);"
  var bt = new BridgeTalk()
  bt.target = "illustrator-" + app.version.substr(0, 2)
  bt.body = script
  bt.onError = function(errObj) { 
    alert(errObj.body)
  }
  return bt
  
  function bridgeTalkEncode(txt) {
    txt = encodeURIComponent(txt)
    txt = txt.replace(/\r/, "%0d")
    txt = txt.replace(/\n/, "%0a")
    txt = txt.replace(/\\/, "%5c")
    txt = txt.replace(/'/g, "%27")
    return txt.replace(/"/g, "%22")
  }
}

/**
* Get the contents of a file as a string
* @param {File|string} filePath 
* Path to file
* @returns {string} File contents as a string
*/
function getFileContents(filePath) {
  if(!(filePath instanceof File)) {
    filePath = File(filePath)
  }
  if(!filePath.exists) {
    alert("File cannot be located at: '" + decodeURI(filePath.toString()) + "'");
    return
  }
  filePath.open("r")
  var scriptString = filePath.read()
  filePath.close();
  return scriptString
}

/**
* Get file paths from a diretory
* @param {string} path Directory path to desired files
* @param {string|RegExp} fileNameMatchQuery String or RegEx query to match file names. Leave blank to get all files in the directory.
* @returns {object} Array of file paths
*/
function getFilePathsFromDir(path, fileNameMatchQuery) {
  if(!(path instanceof Folder)) path = Folder(path)
  if(!path.exists) throw EvalError("The directory cannot be found: " + path)
  if(fileNameMatchQuery === undefined) fileNameMatchQuery = "*"
  if(fileNameMatchQuery[0] == ".") fileNameMatchQuery = fileNameMatchQuery.slice(1)
  var fileAndFolderPaths = path.getFiles(fileNameMatchQuery)
  var filePaths = []
  for(var i = 0; i < fileAndFolderPaths.length; i++) {
    if(fileAndFolderPaths[i] instanceof File) filePaths.push(fileAndFolderPaths[i])
  }
  return filePaths
}

/**
* In a file, replace include statements with strings of their respective file dependencies
* @param {string} fileStrContents 
* String contents of file to modify
* @param {string} dir 
* Path to directory where file being modified and its dependency file(s) reside
* @returns {string} String of file with its dependencies merged
*/
function mergeFileDependencies(fileStrContents, dir) {
  dir = dir.toString()
  var includeTarget = fileStrContents.match(/[@#]include\s["'].+["']/)
  if(includeTarget === null) return fileStrContents
  var split = fileStrContents.split(/[\r\n]+/g)
  var arrIdx = Array.indexOf(split, includeTarget[0])
  var targetFilePath = dir + "/" + split[arrIdx].split(split[arrIdx].match(/["']/)[0])[1]
  split[arrIdx] = getFileContents(targetFilePath)
  fileStrContents = split.join("\n")
  return mergeFileDependencies(fileStrContents, dir)
}

// replace filename extension in string
function replaceExtension(str, newExt) {
  return str.split(".").slice(0, -1).join(".") + "." + newExt
}

function writeXML(xml) {
  xml.file.open("w")
  xml.file.write(xml.xml)
  xml.file.close()
}

// check if file exists in path
function validateFilePath(path) {
  // not adding the new operator before File() allows the result to become an instance of Folder if the path is a directory.
  // File(path) will always resolve to a File instance unless the final component is recognized as a valid directory
  var file = File(path) // file instanciates Folder instead of File class if new operator is not specified before File()
  return file.exists && file instanceof File
}

function dialog_invalidTemplateFilePath(templateName, filePath) {
  // https://scriptui.joonas.me 
  
  // MISSINGFILE
  // ===========
  var missingFile = new Window("dialog"); 
  missingFile.text = "Invalid " + templateName + " Template File Path"; 
  missingFile.preferredSize.width = 500; 
  missingFile.orientation = "column"; 
  missingFile.alignChildren = ["center","top"]; 
  missingFile.spacing = 10; 
  missingFile.margins = 16; 
  
  var statictext1 = missingFile.add("group"); 
  statictext1.orientation = "column"; 
  statictext1.alignChildren = ["left","center"]; 
  statictext1.spacing = 0; 
  statictext1.alignment = ["left","top"];
  
  statictext1.add("statictext", undefined, "The provided " + templateName.toLowerCase() + " template file path doesn't exist or isn't an .ait file.", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "Enter the valid " + templateName.toLowerCase() + " template file path.", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "Example: ", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "C:/users/user/documents/template.ait", {name: "statictext1"}); 
  
  var divider1 = missingFile.add("panel", undefined, undefined, {name: "divider1"}); 
  divider1.alignment = "fill"; 
  
  var statictext2 = missingFile.add("statictext", undefined, undefined, {name: "statictext2"}); 
  statictext2.text = "File path:"; 
  statictext2.alignment = ["left","top"]; 
  
  var newTemplatePath = missingFile.add('edittext {properties: {name: "newProofPath"}}'); 
  newTemplatePath.helpTip = "path/to/template"; 
  newTemplatePath.alignment = ["fill","top"]; 
  newTemplatePath.text = filePath.replace(/\\/g, "/")
  
  // GROUP1
  // ======
  var group1 = missingFile.add("group", undefined, {name: "group1"}); 
  group1.orientation = "row"; 
  group1.alignChildren = ["left","center"]; 
  group1.spacing = 10; 
  group1.margins = 0; 
  
  var stopScript = group1.add("button", undefined, undefined, {name: "cancel"}); // name property must be a certain value for dialog button to work
  stopScript.text = "Stop Script"; 
  
  var retryScript = group1.add("button", undefined, undefined, {name: "ok"}); // name property must be a certain value for dialog button to work
  retryScript.text = "Retry"; 
  
  var choice = missingFile.show(); 
  
  switch (choice) {
    case 1: // retry
    return newTemplatePath.text
    
    case 2: // stop script
    return false
    
    default:
    break;
  }
}

// workaround to set the selection of items that have sub items that are hidden/locked
// accepts an array of groupItems and/or pageItems as an argument
function setSelection(target) {
  if(target.constructor !== Array) throw "Argument must be an array."
  
  var targetParentUUIDs = []
  for(var i = 0; i < target.length; i++) targetParentUUIDs.push(target[i].uuid)
  
  var locked = hidden = []
  for(var i = 0; i < activeDocument.pageItems.length; i++) {
    if(isParent(activeDocument.pageItems[2], targetParentUUIDs[0]) && activeDocument.pageItems[i].hidden) {
      hidden.push(activeDocument.pageItems[i])
      activeDocument.pageItems[i].hidden = false
    }
  }
  
  selection = target
  for(var i = 0; i < hidden.length; i++) {
    hidden[i].locked = true
  }
  for(var i = 0; i < locked.length; i++) {
    hidden[i].locked = true
  }
}

function isParent(item, parent) {
  var level = item.parent
  while(true) {
    if(level.uuid == parent.uuid) return true
    
    if(level.parent != undefined) {
      level = level.parent
    } else {
      return false
    }
  }
}

// return an object with the largest area from multiple objects 
function maxArea(objs, docUnits) {
  var maxBounds = {
    maxArea: 0,
    obj: undefined
  }
  var newMaxArea
  for(var i = 0; i < objs.length; i++) {
    newMaxArea = Math.max(maxBounds.maxArea, objs[i].width * objs[i].height)
    if(newMaxArea > maxBounds.maxArea) {
      maxBounds.maxArea = newMaxArea
      maxBounds.obj = objs[i]
    }
  }
  maxBounds.maxArea /= Math.pow(docUnits.multiplier, 2)
  return maxBounds
}

/**
* Get bbox properties for an Illustrator object
* @param {object} obj Illustrator object to be measured
* @returns Object of bbox properties
*/
function bboxProperties(obj) {
  var p = {
    top: obj.top,
    right: obj.left + obj.width,
    bottom: obj.top - obj.height,
    left: obj.left,
    center: [obj.left + obj.width / 2, obj.top - obj.height / 2],
  }
  return p
}

/**
* Get bbox properties for a single bbox that represents the collective bboxes of multiple Illustrator objects
* @param {object[]} bboxes Array of bboxes
* @returns {object} Object of bbox properties
*/
function bboxPropertiesLarge(bboxes) {
  var largeBbox = bboxes[0]
  for(var i = 1; i < Object.size(bboxes); i++) {
    largeBbox.top = Math.max(bboxes[i-1].top, bboxes[i].top)
    largeBbox.right = Math.max(bboxes[i-1].right, bboxes[i].right)
    largeBbox.bottom = Math.min(bboxes[i-1].bottom, bboxes[i].bottom)
    largeBbox.left = Math.min(bboxes[i-1].left, bboxes[i].left)
  }
  largeBbox.center = [
    (largeBbox.right + largeBbox.left) / 2,
    (largeBbox.top + largeBbox.bottom) / 2
  ]
  return largeBbox
}

function scaleToFit(obj, refObj) {
  var scaleMult = Math.min(refObj.width / obj.width, refObj.height / obj.height)
  obj.resize(scaleMult * 100, scaleMult * 100, true, true, true, true, scaleMult * 100, undefined)
}

function alignToCenter(obj, refObj) {
  var refObjCenter = getCenter(refObj)
  obj.position = [
    refObjCenter[0] - obj.width / 2,
    refObjCenter[1] + obj.height / 2
  ]
}

function getCenter(obj) {
  return [
    obj.position[0] + obj.width / 2,
    obj.position[1] - obj.height / 2,
  ]
}
