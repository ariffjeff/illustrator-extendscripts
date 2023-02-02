#include "jsx_modules.jsx"

// Copies selected art (organized into seperate groups) into an
// OneLookSigns Illustrator Proof template. The art will be 
// aligned to best fill the designated guide line space and 
// then the scene is saved as a PDF and then a 1200px jpeg.

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

// TODO:
// delete guides in proof
// DOES NOT WORK ON GROUPED CLIP MASKS
// save source file dialog activates when in unsaved proof - only activate when active doc is .ai?
// grouped stroked text stroke not scaled properly

// APPEND NAME OF PARENT FOLDER OF AI FILE TO NAME ALREADY BEING ADDED IN PROOF

// KEEP CHECKING FOR MORE EXISTING PDF MAJOR ITERATIONS IF ONE TYPE IS MISSING FROM MIDDLE OF LIST i.e. 0_PROOF_0, 1_PROOF_0, 3_PROOF_0 - 3_PROOF_0 wouldn't be found for dialog 

// CLIPPING MASK POSITION FIX:
// LOOP THROUGH EVERY PAGE ITEM TO GET MAX BOUNDS, JUST LIKE BBOX, BUT IGNORE ANYTHING INSIDE CLIPPING MASKS. CREATE A NEW CLIP MASK FROM MAX BOUNDS, APPLY EVERYTHING INTO IT. PROOF CREATED CLIP MASK.

// Add color swatch information to proofs for scenes containing paint swatches

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  xmlConfig = getXMLConfig()
  
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  sourceDoc = initDoc()
  
  if(sourceDoc.doc.pageItems.length < 1) {
    alert("Add at least one item to the document.");
    return
  }
  
  var saveTheProof = true
  if(sourceDoc.doc.path.name.length == 0) { // source doc isn't a saved file
    if(!dialog_saveTheSourceFile()) return
    saveTheProof = false
  }
  
  if(selection.length == 0) executeMenuCommand('selectall')
  var artObjects = sourceDoc.doc.selection
  
  if(artObjects.length >= 50 && !dialog_manyItemsSelectedWarning()) return
  
  var sourceDocIsProof = documentIsProofTemplate(sourceDoc)
  if(!sourceDocIsProof) var proofDoc = newProof(xmlConfig.xml.filePaths.ait.proof, true)
  if(proofDoc === false) return
  
  var artLayer
  try {
    artLayer = proofDoc.layers.getByName("Artwork")
  } catch(err) {
    alert("The \"Artwork\" layer could not be found in the proof template.\
    \nPicking first layer to place artwork.")
    artLayer = firstAvailableLayer(proofDoc)
  }
  
  var artObjects_proof = []
  for(var i = 0; i < artObjects.length; i++) artObjects_proof.push(artObjects[i].duplicate(artLayer))
  
  // set proof name text to client name
  for(layer = 0; layer < proofDoc.layers.length; layer++) {
    if(proofDoc.layers[layer].name == "Text") {
      proofDoc.layers[layer].pageItems[0].contents = getClientName()
      proofDoc.layers[layer].locked = true
      break
    }
  }
  
  var guideBoxPath = proofDoc.layers.getByName("Guides").pageItems.getByName("GuideBox")
  var guideBox = {
    width:guideBoxPath.width,
    height:guideBoxPath.height,
    position:guideBoxPath.position,
    ratio:reduce(guideBoxPath.width, guideBoxPath.height)
  }
  guideBox.origin = [guideBox.position[0], guideBox.position[1]]
  guideBox.edge_L = guideBox.position[0]
  guideBox.edge_R = guideBox.position[0] + guideBox.width
  guideBox.edge_T = guideBox.position[1]
  guideBox.edge_B = guideBox.position[1] - guideBox.height

  // binPack(artObjects_proof, guideBox)
  
  executeMenuCommand('group')
  var scaleCorners = preferences.getIntegerPreference("policyForPreservingCorners")
  preferences.setIntegerPreference("policyForPreservingCorners", 1)
  alignToCenter(selection[0], guideBox)
  scaleToFit(selection[0], guideBox)
  preferences.setIntegerPreference("policyForPreservingCorners", scaleCorners)
  
  if(saveTheProof) {
    saveProof(proofDoc, sourceDocIsProof)
  }
}

function documentIsProofTemplate(doc) {
  // identify UUIDs
  const UUID0 = "238957340_PROOF_69721-086134-0680918294081246150"
  const UUID1 = "This drawing is property of One Look Sign Company" // for legacy proof templates with no UUID0
  for(textFrame = doc.doc.textFrames.length - 1; textFrame >= 0; textFrame--) {
    if(doc.doc.textFrames[textFrame].contents == UUID0 || doc.doc.textFrames[textFrame].contents.indexOf(UUID1) != -1) {
      return true
    }
  }
  return false
}

// get client name for proof text - based on specific directory structure
function getClientName() {
  var sourcePath = sourceDoc.doc.path.fullName.split("/")
  var clientName = "Name"
  for(var component = sourcePath.length - 1, counter = 0; component >= 0; component--, counter++) {
    if(sourcePath[component].length == 1 && counter == 0) {
      return clientName
    } else if (sourcePath[component].length == 1 && counter > 0) {
      return sourcePath[component + 1]
    }
  }
}

/**
* Open a new document from an .ait template file
* @param {XML|string} filePath .ait template file path
* @param {boolean} replaceXML Inner-function use only. Overwrite correspnding XML value if filePath needs to be fixed.
* @returns {Document} Template document
*/
function newProof(filePath, replaceXML) {
  if(filePath === undefined) throw EvalError("File path is undefined.")
  filePath = filePath.toString()
  if(!validateFilePath(filePath) || filePath.slice(filePath.length - 4) != ".ait") {
    filePath = dialog_invalidTemplateFilePath("Proof", filePath)
    if(filePath === false) return false
    return newProof(filePath, true)
  }
  if(replaceXML) {
    xmlConfig.xml.filePaths.ait.proof = filePath
    writeXML(xmlConfig)
  }
  return open(new File(filePath))
}

function binPack(artObjects, guideBox) {
  // POSSILE SOLUTION FOR POSITIONING CLIPPING MASKS AND MASKS:
  // save originalSelection
  // get top level group(s) UUID (for future modified selection)
  // Select all clipping masks
  // create proxies in place of clip groups
  // move all clip groups to new temp layer
  // selection = selection with clip groups replaced with proxies
  // bin pack
  // offset clip groups to respective proxies with logic from quickTest.jsx
  
  artObjects.sort(function(a, b) {
    return b.height - a.height
  })
  
  // debug rename
  // for(var key = 0; key < artObjects.length; key++) {
  //   artObjects[key].name = key
  // }
}

function saveProof(doc, sourceDocIsProof) {
  // prevent loss of unsaved .ai changes on pdf save
  if(sourceDocIsProof) {
    sourceDoc.doc.save()
  }
  
  var i_minor = i_major = 0
  
  // compile existing proofs
  var proofFiles = {}
  var filePath
  while(true) {
    fileName = sourceDoc.name + "_" + i_major + "_PROOF_" + i_minor + ".pdf"
    filePath = sourceDoc.doc.path + "/" + fileName
    if(validateFilePath(filePath)) {
      proofFiles[i_major] = {0:fileName}
      while(true) {
        fileName = sourceDoc.name + "_" + i_major + "_PROOF_" + i_minor + ".pdf"
        filePath = sourceDoc.doc.path + "/" + fileName
        if(validateFilePath(filePath)) {
          proofFiles[i_major][i_minor] = fileName
          i_minor++
        } else {
          i_minor = 0
          break
        }
      }
      i_major++
    } else {
      i_major = 0
      break
    }
  }
  
  var jpgRes = 400
  var delPrevImg = false
  // how to save proof
  while(true) {
    if(sourceDoc.ext == "pdf" && sourceDoc.doc.name.indexOf("_PROOF_") != -1) { // sourceDoc.doc is a proof
      filePath = new File(sourceDoc.filePath)
      break
    } else {
      filePath = dialog_chooseProofVersion(proofFiles)
      if(filePath == false) {
        return 
      } else {
        i_major = filePath[1]
        i_minor = filePath[2]
        jpgRes = filePath[3]
        delPrevImg = filePath[4]
        openCreatedProofJpg = filePath[5]
        var prevImg = new File(sourceDoc.doc.path + "/" + sourceDoc.name + "_" + i_major + "_PROOF_" + (i_minor - 1) + ".jpg")
        filePath = new File(filePath[0])
        break
      }
    }
  }
  
  presetOptions = getPDFSavePreset(xmlConfig.xml.presets.PDF.proofPDF)
  if(presetOptions == false) {
    return
  }
  
  // if(!filePath) {
  //   alert("No file path and/or file name found.")
  //   return
  // }
  
  // account for pdf saving error case
  try {
    doc.saveAs(filePath, presetOptions) // pdf
  } catch (error) {
    try {
      var nonExistentPreset = presetOptions.pDFPreset
      presetOptions = getPDFSavePreset("[Illustrator Default]")
      if(presetOptions == false) return
      doc.saveAs(filePath, presetOptions) // pdf
      alert("Illustrator failed to save the proof as a PDF with the " + nonExistentPreset + " preset.\n\nThis might have been caused by an internal color profile conversion error during PDF export.\n\nThe PDF has been saved with the " + presetOptions.pDFPreset + " preset instead.")
    } catch (error) {
      alert("Illustrator failed to save the proof as a PDF. These PDF presets were tried: " + nonExistentPreset + ", " + presetOptions.pDFPreset + ".\n\nThis might have been caused by an internal color profile conversion error during PDF export.\n\nSave the proof manually.")
    }
  }
  
  var jpgExportOptions = initJpgExportOptions(jpgRes)
  var proofJpgFileName = sourceDoc.name + "_" + i_major + "_PROOF_" + i_minor + ".jpg"
  var proofJpg = File(sourceDoc.doc.path + "/" + proofJpgFileName)
  doc.exportFile(proofJpg, jpgExportOptions.type, jpgExportOptions.options)
  proofJpg.copy(Folder(sourceDoc.path + "/.proofPreviews/" + proofJpgFileName))
  // sourceDoc.doc becomes proofDoc if sourceDoc.doc is a proof (contains UIDs)
  
  // revert ai replacing jpg filename whitespace with "-"
  proofJPG = sourceDoc.path + "/" + sourceDoc.name.split(" ").join("-") + "_" + i_major + "_PROOF_" + i_minor + ".jpg"
  proofJPG_target = sourceDoc.path + "/" + sourceDoc.name + "_" + i_major + "_PROOF_" + i_minor + ".jpg"
  if(sourceDoc.name.indexOf(" ") != -1) {
    if(validateFilePath(proofJPG)) {
      if(validateFilePath(proofJPG_target)) {
        File(proofJPG_target).remove() // old JPG of same version/filename
      }
      File(proofJPG).rename(proofJPG_target)
      proofJPG = proofJPG_target
    } else {
      alert('Failed to determine saved jpg file path in order to correctly rename jpg. This is a script bug.')
    }
  }
  
  if(openCreatedProofJpg) {
    open(File(proofJPG))
    
    // commented code works better but adds to the undo stack which is annoying when trying to close the file quickly b/c file gets unsaved changes
    // var scaleAmount = (documents[0].views[0].bounds[1] - documents[0].views[0].bounds[3]) / documents[0].rasterItems[0].height * 90
    // documents[0].rasterItems[0].resize(scaleAmount, scaleAmount)
    // documents[0].artboards[0].artboardRect = [-7900, -7800, -7600, -8100] // left, top, right, bottom
    documents[0].views[0].zoom = 1 / (jpgRes / 100) * .99 // does not account for base dimensions of jpeg (if template dimensions changes)
  }
  
  // delete previous minor jpg version
  if(delPrevImg) {
    if(!prevImg.remove()) {
      $.writeln("Unable to or there was no previous minor JPG version to delete.")
    }
  }
  
  doc.close(SaveOptions.DONOTSAVECHANGES)
}

function initJpgExportOptions(jpgRes) {
  var type = ExportType.JPEG
  var options = new ExportOptionsJPEG()
  options.antiAliasing = true
  options.artBoardClipping = true
  options.optimization = true
  options.qualitySetting = 100 // Set Quality Setting
  options.horizontalScale = options.verticalScale = jpgRes
  return {
    type: type,
    options: options
  }
}

function dialog_chooseProofVersion(proofFiles) {
  Image.prototype.onDraw = function() {
    // control image size and position before it is rendered, then render the image. 
    // "this" is the container; "this.image" is the graphic
    
    if(!this.image) return
    var wh_container = this.size
    var wh_image = this.image.size
    var scaleMult = Math.min(wh_container[0] / wh_image[0], wh_container[1] / wh_image[1])
    if(scaleMult == Infinity) return // caused by image object being set to empty object
    
    wh_image = [scaleMult * wh_image[0], scaleMult * wh_image[1]]
    var xy = [
      0, 
      (wh_container[1] / 2) - (wh_image[1] / 2)
    ]
    
    this.graphics.drawImage(this.image, xy[0], xy[1], wh_image[0], wh_image[1])
    wh_container = wh_image = xy = null
  }
  
  // create flat hierarchy proof version list
  var proofList = []
  var newVerIndicator = "<NEW>"
  for(var i = 0; i < Object.size(proofFiles); i++) {
    for(var o = 0; o < Object.size(proofFiles[i]); o++) {
      proofList.push(proofFiles[i][o]) // previous version
    }
    proofList.push(proofFiles[i][o-1].replace("PROOF_" + (o - 1), "PROOF_" + o) + " " + newVerIndicator) // new minor version
    if(i < Object.size(proofFiles) - 1) {
      proofList.push(undefined) // gap
    }
  }
  if(proofList.length > 0) {
    proofList = proofList.concat([undefined, proofFiles[i-1][0].replace((i - 1) + "_PROOF", i + "_PROOF") + " " + newVerIndicator]) // final new major version
  } else {
    proofList[0] = fileName + " " + newVerIndicator
  }
  
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":0,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"proofVer","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":false,"borderless":false,"resizeable":false},"text":"Choose Proof Version","preferredSize":[0,0],"margins":[20,30,20,30],"orientation":"column","spacing":25,"alignChildren":["center","center"]}},"item-2":{"id":2,"type":"Button","parentId":26,"style":{"enabled":true,"varName":"cancel","text":"Stop Script","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"Button","parentId":26,"style":{"enabled":true,"varName":"ok","text":"Save","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"Group","parentId":23,"style":{"enabled":true,"varName":"userInfo","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":15,"alignChildren":["fill","center"],"alignment":null}},"item-12":{"id":12,"type":"Group","parentId":23,"style":{"enabled":true,"varName":"grp_proofData","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":15,"alignChildren":["left","top"],"alignment":null}},"item-20":{"id":20,"type":"ListBox","parentId":12,"style":{"enabled":true,"varName":null,"creationProps":{"multiselect":false,"numberOfColumns":"1","columnWidths":"[]","columnTitles":"[]","showHeaders":false},"listItems":"ProofTest cells helper_0_PROOF_0, ProofTest cells helper_0_PROOF_1,\n,ProofTest cells helper_1_PROOF_0ProofTest cells helper_0_PROOF_0, ProofTest cells helper_0_PROOF_1,\n,ProofTest cells helper_1_PROOF_0ProofTest cells helper_0_PROOF_0, ProofTest cells helper_0_PROOF_1,\n,ProofTest cells helper_1_PROOF_0ProofTest cells helper_0_PROOF_0, ProofTest cells helper_0_PROOF_1,\n,ProofTest cells helper_1_PROOF_0ProofTest cells helper_0_PROOF_0, ProofTest cells helper_0_PROOF_1,\n,ProofTest cells helper_1_PROOF_0ProofTest cells helper_0_PROOF_0, ProofTest cells helper_0_PROOF_1,\n,ProofTest cells helper_1_PROOF_0ProofTest cells helper_0_PROOF_0, ProofTest cells helper_0_PROOF_1,\n,ProofTest cells helper_1_PROOF_0","preferredSize":[0,0],"alignment":"right","helpTip":null,"selection":[0]}},"item-23":{"id":23,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"userOptions","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":25,"alignChildren":["center","top"],"alignment":null}},"item-24":{"id":24,"type":"StaticText","parentId":4,"style":{"enabled":true,"varName":"versionInfo","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Versioning reference:\nx_PROOF_y\nx = major iteration\ny = minor iteration","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-25":{"id":25,"type":"Checkbox","parentId":4,"style":{"enabled":true,"varName":"delPrevImg","text":"Delete previous minor version JPG if available","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-26":{"id":26,"type":"Group","parentId":4,"style":{"enabled":true,"varName":"userBtns","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["fill","center"],"alignment":null}},"item-27":{"id":27,"type":"StaticText","parentId":35,"style":{"enabled":true,"varName":"filePath","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Path:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-28":{"id":28,"type":"EditText","parentId":29,"style":{"enabled":true,"varName":"res","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"300","justify":"center","preferredSize":[42,28],"alignment":null,"helpTip":null}},"item-29":{"id":29,"type":"Group","parentId":4,"style":{"enabled":true,"varName":"grp_res","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-30":{"id":30,"type":"StaticText","parentId":29,"style":{"enabled":true,"varName":"label_res","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"JPG Resolution %","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-31":{"id":31,"type":"Checkbox","parentId":4,"style":{"enabled":true,"varName":"openCreatedProofJpg","text":"Open created proof","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-32":{"id":32,"type":"Group","parentId":23,"style":{"enabled":true,"varName":"grp_proofPreview","preferredSize":[200,200],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","top"],"alignment":"center"}},"item-33":{"id":33,"type":"Image","parentId":32,"style":{"enabled":true,"varName":"proofPreview","image":[""],"alignment":null,"helpTip":null}},"item-34":{"id":34,"type":"EditText","parentId":35,"style":{"enabled":true,"varName":"filePath_text","creationProps":{"noecho":false,"readonly":true,"multiline":false,"scrollable":false,"borderless":true,"enterKeySignalsOnChange":false},"softWrap":false,"text":"x","justify":"left","preferredSize":[400,0],"alignment":"fill","helpTip":null}},"item-35":{"id":35,"type":"Group","parentId":12,"style":{"enabled":true,"varName":"grp_filePath","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":5,"alignChildren":["left","center"],"alignment":null}},"item-36":{"id":36,"type":"Button","parentId":46,"style":{"enabled":true,"varName":"res_100","text":"100","justify":"center","preferredSize":[50,25],"alignment":null,"helpTip":null}},"item-37":{"id":37,"type":"Group","parentId":4,"style":{"enabled":true,"varName":"grp_resBtns","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["center","center"],"alignment":"left"}},"item-38":{"id":38,"type":"Button","parentId":46,"style":{"enabled":true,"varName":"res_200","text":"200","justify":"center","preferredSize":[50,25],"alignment":null,"helpTip":null}},"item-39":{"id":39,"type":"Button","parentId":46,"style":{"enabled":true,"varName":"res_300","text":"300","justify":"center","preferredSize":[50,25],"alignment":null,"helpTip":null}},"item-40":{"id":40,"type":"Button","parentId":46,"style":{"enabled":true,"varName":"res_400","text":"400","justify":"center","preferredSize":[50,25],"alignment":null,"helpTip":null}},"item-41":{"id":41,"type":"Button","parentId":47,"style":{"enabled":true,"varName":"res_500","text":"500","justify":"center","preferredSize":[50,25],"alignment":null,"helpTip":null}},"item-42":{"id":42,"type":"Button","parentId":47,"style":{"enabled":true,"varName":"res_600","text":"600","justify":"center","preferredSize":[50,25],"alignment":null,"helpTip":null}},"item-43":{"id":43,"type":"Button","parentId":47,"style":{"enabled":true,"varName":"res_700","text":"700","justify":"center","preferredSize":[50,25],"alignment":null,"helpTip":null}},"item-46":{"id":46,"type":"Group","parentId":37,"style":{"enabled":true,"varName":"row0","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-47":{"id":47,"type":"Group","parentId":37,"style":{"enabled":true,"varName":"row1","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-48":{"id":48,"type":"Button","parentId":47,"style":{"enabled":true,"varName":"res_max","text":"Max","justify":"center","preferredSize":[53,25],"alignment":null,"helpTip":null}}},"order":[0,23,32,33,12,35,27,34,20,4,29,28,30,37,46,36,38,39,40,47,41,42,43,48,25,31,26,2,3,24],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
  */ 
  
  // PROOFVER
  // ========
  var proofVer = new Window("dialog", undefined, undefined, {closeButton: false}); 
  proofVer.text = "Choose Proof Version"; 
  proofVer.orientation = "column"; 
  proofVer.alignChildren = ["center","center"]; 
  proofVer.spacing = 25; 
  proofVer.margins = [30,20,30,20]; 
  
  var label = proofVer.add("statictext", undefined, undefined, {name: "label"}); 
  label.text = "Choose a new PDF/JPG version to save this new proof as, or overwrite an old version..."; 
  label.alignment = ["center","center"]; 
  
  // USEROPTIONS
  // ===========
  var userOptions = proofVer.add("group", undefined, {name: "userOptions"}); 
  userOptions.orientation = "row"; 
  userOptions.alignChildren = ["center","top"]; 
  userOptions.spacing = 25; 
  userOptions.margins = 0; 
  
  // initialize first proof to preview in dialog if there is one
  if(Object.size(proofFiles) > 0) {
    sourceDoc.initProofPreviews()
    proofPreviewJpgExport(proofFiles[0][0], 300)
    
    var grp_proofPreview = dialog_addImgGroup(userOptions)
    var proofPreview = grp_proofPreview.add("image", undefined, File(sourceDoc.proofPreviews.path + "/" + replaceExtension(proofFiles[0][0], "jpg")), {name: "proofPreview"});
    proofPreview.size = [500, 375]
  }
  
  // GRP_PROOFDATA
  // =============
  var grp_proofData = userOptions.add("group", undefined, {name: "grp_proofData"}); 
  grp_proofData.orientation = "column"; 
  grp_proofData.alignChildren = ["fill","top"]; 
  grp_proofData.spacing = 15; 
  grp_proofData.margins = 0; 
  
  // GRP_FILEPATH
  // ============
  var grp_filePath = grp_proofData.add("group", undefined, {name: "grp_filePath"}); 
  grp_filePath.orientation = "column"; 
  grp_filePath.alignChildren = ["left","center"]; 
  grp_filePath.spacing = 5; 
  grp_filePath.margins = 0; 
  
  var filePath = grp_filePath.add("statictext", undefined, undefined, {name: "filePath"}); 
  filePath.text = "Path:"; 
  
  var filePath_text = grp_filePath.add('edittext {properties: {name: "filePath_text", readonly: true, borderless: true}}'); 
  filePath_text.text = function() {
    var path = decodeURI(sourceDoc.doc.path)
    if(path[0] == "/") path = path.substring(1)
    return path[0].toUpperCase() + ":" + path.substring(1)
  }()
  filePath_text.preferredSize.width = 400; 
  filePath_text.alignment = ["fill","center"]; 
  
  var listbox1 = grp_proofData.add("listbox", undefined, undefined, {name: "listbox1", items: proofList}); 
  listbox1.selection = 0
  
  // USERINFO
  // ========
  var userInfo = userOptions.add("group", undefined, {name: "userInfo"}); 
  userInfo.orientation = "column"; 
  userInfo.alignChildren = ["fill","center"]; 
  userInfo.spacing = 15; 
  userInfo.margins = 0; 
  
  // GRP_RES
  // =======
  var grp_res = userInfo.add("group", undefined, {name: "grp_res"}); 
  grp_res.orientation = "row"; 
  grp_res.alignChildren = ["left","center"]; 
  grp_res.spacing = 10; 
  grp_res.margins = 0; 
  
  var res = grp_res.add('edittext {justify: "center", properties: {name: "res"}}'); 
  res.text = "300"; 
  res.preferredSize.width = 42; 
  res.preferredSize.height = 28; 
  // res.active = true // causes Illustrator to flicker on dialog close for some reason
  
  var label_res = grp_res.add("statictext", undefined, undefined, {name: "label_res"}); 
  label_res.text = "JPG Resolution %"; 
  
  // GRP_RESBTNS
  // ===========
  var grp_resBtns = userInfo.add("group", undefined, {name: "grp_resBtns"}); 
  grp_resBtns.orientation = "column"; 
  grp_resBtns.alignChildren = ["center","center"]; 
  grp_resBtns.spacing = 10; 
  grp_resBtns.margins = 0; 
  grp_resBtns.alignment = ["left","center"]; 
  
  // ROW0
  // ====
  var row0 = grp_resBtns.add("group", undefined, {name: "row0"}); 
  row0.orientation = "row"; 
  row0.alignChildren = ["left","center"]; 
  row0.spacing = 10; 
  row0.margins = 0; 
  
  var res_100 = row0.add("button", undefined, undefined, {name: "res_100"}); 
  res_100.text = "100"; 
  res_100.preferredSize.width = 50; 
  res_100.preferredSize.height = 25; 
  
  var res_200 = row0.add("button", undefined, undefined, {name: "res_200"}); 
  res_200.text = "200"; 
  res_200.preferredSize.width = 50; 
  res_200.preferredSize.height = 25; 
  
  var res_300 = row0.add("button", undefined, undefined, {name: "res_300"}); 
  res_300.text = "300"; 
  res_300.preferredSize.width = 50; 
  res_300.preferredSize.height = 25; 
  
  var res_400 = row0.add("button", undefined, undefined, {name: "res_400"}); 
  res_400.text = "400"; 
  res_400.preferredSize.width = 50; 
  res_400.preferredSize.height = 25; 
  
  // ROW1
  // ====
  var row1 = grp_resBtns.add("group", undefined, {name: "row1"}); 
  row1.orientation = "row"; 
  row1.alignChildren = ["left","center"]; 
  row1.spacing = 10; 
  row1.margins = 0; 
  
  var res_500 = row1.add("button", undefined, undefined, {name: "res_500"}); 
  res_500.text = "500"; 
  res_500.preferredSize.width = 50; 
  res_500.preferredSize.height = 25; 
  
  var res_600 = row1.add("button", undefined, undefined, {name: "res_600"}); 
  res_600.text = "600"; 
  res_600.preferredSize.width = 50; 
  res_600.preferredSize.height = 25; 
  
  var res_700 = row1.add("button", undefined, undefined, {name: "res_700"}); 
  res_700.text = "700"; 
  res_700.preferredSize.width = 50; 
  res_700.preferredSize.height = 25; 
  
  var res_max = row1.add("button", undefined, undefined, {name: "res_max"}); 
  res_max.text = "Max"; 
  res_max.preferredSize.width = 53; 
  res_max.preferredSize.height = 25; 
  
  // USERINFO
  // ========
  var delPrevImg = userInfo.add("checkbox", undefined, undefined, {name: "delPrevImg"}); 
  delPrevImg.text = "Delete previous minor version JPG if available"; 
  delPrevImg.value = true; 
  
  var openCreatedProofJpg = userInfo.add("checkbox", undefined, undefined, {name: "openCreatedProofJpg"}); 
  openCreatedProofJpg.text = "Open created proof"; 
  openCreatedProofJpg.value = false; 
  
  // USERBTNS
  // ========
  var userBtns = userInfo.add("group", undefined, {name: "userBtns"}); 
  userBtns.orientation = "column"; 
  userBtns.alignChildren = ["fill","center"]; 
  userBtns.spacing = 10; 
  userBtns.margins = 0; 
  
  var cancel = userBtns.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Stop Script"; 
  
  var ok = userBtns.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "Save"; 
  
  // USERINFO
  // ========
  var versionInfo = userInfo.add("group"); 
  versionInfo.orientation = "column"; 
  versionInfo.alignChildren = ["center","center"]; 
  versionInfo.spacing = 0; 
  
  versionInfo.add("statictext", undefined, "Versioning reference:", {name: "versionInfo"}); 
  versionInfo.add("statictext", undefined, "x_PROOF_y", {name: "versionInfo"}); 
  versionInfo.add("statictext", undefined, "x = major iteration", {name: "versionInfo"}); 
  versionInfo.add("statictext", undefined, "y = minor iteration", {name: "versionInfo"}); 
  
  const MAX_RES = 776 // Illustrator's max jpg export resolution for some reason
  res.onChanging = function() {
    if(isNaN(Number(res.text)) || Number(res.text) == Infinity) {
      ok.enabled = false
    } else {
      ok.enabled = true
    }
    
    // switch active focus to arbitrary selectable object then back to textbox to allow value to be set to min or max
    if(Number(res.text) < 1) {
      listbox1.active = true
      redraw()
      res.text = "1"
      res.active = true
    } else if(Number(res.text) > 776) {
      listbox1.active = true
      redraw()
      res.text = MAX_RES.toString()
      res.active = true
    }
  }
  
  var resBtns = [
    res_100, res_200, res_300, res_400, res_500, res_600, res_700
  ]
  for(var i in resBtns) {
    resBtns[i].onClick = function() {
      res.text = this.text
      ok.enabled = true
      buttonUnActive(this)
    }
  }
  res_max.onClick = function() {
    res.text = MAX_RES.toString()
    ok.enabled = true
    buttonUnActive(this)
  }
  function buttonUnActive(btn) {
    btn.active = true // prevent weird double click button highlight behavior
    btn.active = false
  }
  
  // update proof preview
  listbox1.onChange = function() {
    if(listbox1.selection != null && listbox1.selection.text.length > 0 && listbox1.selection.text.indexOf(newVerIndicator) == -1) {
      proofPreviewJpgExport(listbox1.selection.text, 300)
      proofPreview.image = sourceDoc.proofPreviews.path + "/" + replaceExtension(listbox1.selection.text, "jpg")
    } else {
      proofPreview.image = {}
    }
  }
  
  selection = undefined // removes selection outlines, making proof easier to see for user
  redraw() // ensure that proof shows on screen behind dialog
  var choice = proofVer.show();
  if(choice == 2) return false
  
  if(listbox1.selection == null || listbox1.selection.text == 0) {
    alert("Choose a valid option to save the proof.")
    return dialog_chooseProofVersion(proofFiles)
  }
  
  if(listbox1.selection.text.indexOf(newVerIndicator) == -1 && !dialog_overwriteFile(listbox1.selection.text)) {
    return dialog_chooseProofVersion(proofFiles)
  }
  
  var proofMarker = "_PROOF_"
  var major_n = listbox1.selection.text.indexOf(proofMarker) - 1
  var major = listbox1.selection.text.substring(major_n, major_n + 1)
  var minor_n = listbox1.selection.text.indexOf(proofMarker) + proofMarker.length
  var minor = listbox1.selection.text.substring(minor_n, minor_n + 1)
  
  return [(sourceDoc.doc.path + "/" + listbox1.selection.text).replace(newVerIndicator, ""), major, minor, res.text, delPrevImg.value, openCreatedProofJpg.value]
  
  // export proof pdf to jpg in .proofPreviews directory if jpg doesn't exist
  // IN DEBUG MODE: THIS CODE WILL CLOSE THE USER DIALOG
  function proofPreviewJpgExport(pdfFileName, res) {
    res = !res ? 100 : res
    var proofJpg = replaceExtension(pdfFileName, "jpg")
    if(!File(sourceDoc.proofPreviews.path + "/" + proofJpg).exists) {
      if(File(sourceDoc.path + "/" + proofJpg).exists) {
        File(sourceDoc.path + "/" + proofJpg).copy(sourceDoc.proofPreviews.path + "/" + proofJpg)
      } else {
        var jpgExportOptions = initJpgExportOptions(res)
        var targetPDF = open(new File(sourceDoc.path + "/" + pdfFileName))
        targetPDF.exportFile(File(sourceDoc.proofPreviews.path + "/" + proofJpg), jpgExportOptions.type, jpgExportOptions.options)
        targetPDF.close(SaveOptions.DONOTSAVECHANGES)
      }
    }
  }
  
  function dialog_addImgGroup(parent) {
    var grp = parent.add("group", undefined, {name: "grp_proofPreview"});  
    grp.orientation = "row"; 
    grp.alignChildren = ["left","top"]; 
    grp.spacing = 10; 
    grp.margins = 0; 
    grp.alignment = ["center","center"]; 
    return grp
  }
}

function dialog_overwriteFile(filepath) {
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":0,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"overwrite","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Overwrite file?","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["left","top"]}},"item-1":{"id":1,"type":"StaticText","parentId":0,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Are you sure you want to overwrite the following file?","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-2":{"id":2,"type":"StaticText","parentId":0,"style":{"enabled":true,"varName":"fileOverwrite","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"_","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"userGrp","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":"center"}},"item-4":{"id":4,"type":"Button","parentId":3,"style":{"enabled":true,"varName":"ok","text":"OK","justify":"center","preferredSize":[70,28],"alignment":null,"helpTip":null}},"item-5":{"id":5,"type":"Button","parentId":3,"style":{"enabled":true,"varName":"cancel","text":"Cancel","justify":"center","preferredSize":[70,28],"alignment":null,"helpTip":null}}},"order":[0,1,2,3,4,5],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
  */ 
  
  // OVERWRITE
  // =========
  var overwrite = new Window("dialog"); 
  overwrite.text = "Overwrite file?"; 
  overwrite.orientation = "column"; 
  overwrite.alignChildren = ["left","top"]; 
  overwrite.spacing = 10; 
  overwrite.margins = 16; 
  
  var statictext1 = overwrite.add("statictext", undefined, undefined, {name: "statictext1"}); 
  statictext1.text = "Are you sure you want to overwrite the following file?"; 
  
  var fileOverwrite = overwrite.add("statictext", undefined, undefined, {name: "fileOverwrite"}); 
  fileOverwrite.text = filepath; 
  
  // USERGRP
  // =======
  var userGrp = overwrite.add("group", undefined, {name: "userGrp"}); 
  userGrp.orientation = "row"; 
  userGrp.alignChildren = ["left","center"]; 
  userGrp.spacing = 10; 
  userGrp.margins = 0; 
  userGrp.alignment = ["center","top"]; 
  
  var ok = userGrp.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "OK"; 
  ok.preferredSize.width = 70; 
  ok.preferredSize.height = 28; 
  
  var cancel = userGrp.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Cancel"; 
  cancel.preferredSize.width = 70; 
  cancel.preferredSize.height = 28; 
  
  var choice = overwrite.show();
  
  switch (choice) {
    case 1: // continue
    return true
    
    case 2: // cancel
    return false
    
    default:
    break;
  }
}

function getPDFSavePreset(presetName) {
  var savePresets = PDFPresetsList
  var n = savePresets.length
  var savePresetFound = false
  
  while(n--) {
    if(savePresets[n] == presetName) {
      savePresetFound = true
      break
    }
  }
  if(!savePresetFound) {
    presetName = dialog_setPDFSavePreset(presetName)
    if(presetName == false) return false
    xmlConfig.xml.presets.PDF.proofPDF = presetName
    writeXML(xmlConfig)
    getPDFSavePreset(presetName)
  }
  
  var presetOptions = new PDFSaveOptions()
  presetOptions.pDFPreset = presetName
  return presetOptions
}

function dialog_setPDFSavePreset(presetName) {
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":3,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"setProofPDFSavePreset","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":false,"borderless":false,"resizeable":false},"text":"Set default proof PDF save preset","preferredSize":[0,0],"margins":[20,30,20,30],"orientation":"column","spacing":40,"alignChildren":["center","center"]}},"item-2":{"id":2,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"cancel","text":"Stop Script","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"ok","text":"Retry PDF Save","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"Group","parentId":12,"style":{"enabled":true,"varName":"userBtns","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["fill","center"],"alignment":null}},"item-12":{"id":12,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"pdfSavePresets","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":15,"alignChildren":["center","center"],"alignment":null}},"item-15":{"id":15,"type":"StaticText","parentId":0,"style":{"enabled":true,"varName":"label","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Could not save the PDF as the PDF save preset \"\" could not be found.\nThe jpeg should still save after this dialog.\n\nOptions:\n- Choose a new preset.\n- Save the PDF manually. \n- Stop this script, create a new preset, then rerun this script.","justify":"left","preferredSize":[0,0],"alignment":"center","helpTip":null}},"item-16":{"id":16,"type":"ListBox","parentId":12,"style":{"enabled":true,"varName":"presets","creationProps":{"multiselect":false,"numberOfColumns":"1","columnWidths":"[]","columnTitles":"[]","showHeaders":false},"listItems":"p1, p2, p3, p4, p6, p7, p8---------------","preferredSize":[0,0],"alignment":null,"helpTip":null,"selection":[]}}},"order":[0,15,12,16,4,2,3],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
  */ 
  
  // SETPROOFPDFSAVEPRESET
  // =====================
  var setProofPDFSavePreset = new Window("dialog", undefined, undefined, {closeButton: false}); 
  setProofPDFSavePreset.text = "Set default proof PDF save preset"; 
  setProofPDFSavePreset.orientation = "column"; 
  setProofPDFSavePreset.alignChildren = ["center","center"]; 
  setProofPDFSavePreset.spacing = 40; 
  setProofPDFSavePreset.margins = [30,20,30,20]; 
  
  var label = setProofPDFSavePreset.add("group"); 
  label.orientation = "column"; 
  label.alignChildren = ["left","center"]; 
  label.spacing = 0; 
  label.alignment = ["center","center"]; 
  
  label.add("statictext", undefined, "Could not save the PDF since the PDF save preset \"" + presetName + "\" could not be found in \"" + xmlConfig.fileName + "\".", {name: "label"}); 
  label.add("statictext", undefined, "The jpeg should still save after this dialog.", {name: "label"}); 
  label.add("statictext", undefined, "", {name: "label"}); 
  label.add("statictext", undefined, "Options:", {name: "label"}); 
  label.add("statictext", undefined, "- Choose a new proof default from the existing PDF preset list.", {name: "label"}); 
  label.add("statictext", undefined, "- Save the PDF manually.", {name: "label"}); 
  label.add("statictext", undefined, "- Stop this script, create a new preset, then rerun this script.", {name: "label"}); 
  
  // PDFSAVEPRESETS
  // ==============
  var pdfSavePresets = setProofPDFSavePreset.add("group", undefined, {name: "pdfSavePresets"}); 
  pdfSavePresets.orientation = "row"; 
  pdfSavePresets.alignChildren = ["center","center"]; 
  pdfSavePresets.spacing = 15; 
  pdfSavePresets.margins = 0; 
  
  var presets = pdfSavePresets.add("listbox", undefined, undefined, {name: "presets", items: PDFPresetsList}); 
  
  // USERBTNS
  // ========
  var userBtns = pdfSavePresets.add("group", undefined, {name: "userBtns"}); 
  userBtns.orientation = "column"; 
  userBtns.alignChildren = ["fill","center"]; 
  userBtns.spacing = 10; 
  userBtns.margins = 0; 
  
  var cancel = userBtns.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Stop Script"; 
  
  var ok = userBtns.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "Retry PDF Save"; 
  ok.enabled = false
  
  presets.onChange = function() {
    if(presets.selection == undefined) {
      ok.enabled = false
    } else {
      ok.enabled = true
    }
  }
  
  var choice = setProofPDFSavePreset.show();
  
  switch (choice) {
    case 1: // continue
    return presets.selection.text
    
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
  saveTheSourceFile.text = "Save The Source File First!"; 
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
  
  statictext1.add("statictext", undefined, "Save the source file first! ", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "Any proof files can't be saved automatically", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "because there is no directory reference. ", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "The proof's name text also won't be auto set.", {name: "statictext1"}); 
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
  ok.text = "Proof Anyway"; 
  
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

function dialog_confirmProofTemplate(pathChoice) {
  //https://scriptui.joonas.me
  
  // CONFIRMPROOFTEMPLATE
  // ====================
  var confirmProofTemplate = new Window("dialog"); 
  confirmProofTemplate.text = "Confirm Proof Template"; 
  confirmProofTemplate.preferredSize.width = 554; 
  confirmProofTemplate.orientation = "column"; 
  confirmProofTemplate.alignChildren = ["center","top"]; 
  confirmProofTemplate.spacing = 11; 
  confirmProofTemplate.margins = 16; 
  
  var statictext1 = confirmProofTemplate.add("group"); 
  statictext1.orientation = "column"; 
  statictext1.alignChildren = ["left","center"]; 
  statictext1.spacing = 0; 
  statictext1.alignment = ["left","top"]; 
  
  statictext1.add("statictext", undefined, "The file path you entered exists but is not an Illustrator template file (.ait). ", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "Path entered: ", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, pathChoice, {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "If you continue now but change your mind later, you can manually change the file path in: ", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, xmlConfig.file, {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "", {name: "statictext1"}); 
  statictext1.add("statictext", undefined, "Are you sure you want to continue?", {name: "statictext1"}); 
  
  var divider1 = confirmProofTemplate.add("panel", undefined, undefined, {name: "divider1"}); 
  divider1.alignment = "fill"; 
  
  // GROUP1
  // ======
  var group1 = confirmProofTemplate.add("group", undefined, {name: "group1"}); 
  group1.orientation = "row"; 
  group1.alignChildren = ["left","center"]; 
  group1.spacing = 10; 
  group1.margins = 0; 
  
  var cancel = group1.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Cancel"; 
  
  var ok = group1.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "Continue"; 
  
  var choice = confirmProofTemplate.show();
  
  switch (choice) {
    case 1: // continue
    return true
    
    case 2: // cancel
    return false
    
    default:
    break;
  }
}

function dialog_manyItemsSelectedWarning() {
  // https://scriptui.joonas.me
  
  // DIALOG
  // ======
  var dialog = new Window("dialog"); 
  dialog.text = "Proof Art"; 
  dialog.orientation = "column"; 
  dialog.alignChildren = ["center","top"]; 
  dialog.spacing = 10; 
  dialog.margins = 16; 
  
  // GROUP1
  // ======
  var group1 = dialog.add("group", undefined, {name: "group1"}); 
  group1.orientation = "column"; 
  group1.alignChildren = ["left","center"]; 
  group1.spacing = 10; 
  group1.margins = 0; 
  
  var statictext1 = group1.add("statictext", undefined, undefined, {name: "statictext1"}); 
  statictext1.text = "Are you sure you want to proof " + activeDocument.selection.length + " objects?"; 
  
  var statictext3 = group1.add("statictext", undefined, undefined, {name: "statictext3"}); 
  statictext3.text = "You should save before continuing."; 
  
  var statictext2 = group1.add("group"); 
  statictext2.orientation = "column"; 
  statictext2.alignChildren = ["left","center"]; 
  statictext2.spacing = 0; 
  
  statictext2.add("statictext", undefined, "Script efficiency ≈ O(n)", {name: "statictext2"}); 
  eta = .865 * activeDocument.selection.length + -70 // slope intercept
  eta = Math.round(eta)
  if(eta < 0) { // cutoff impossible data from linear regression
    eta = 1 // arbitrary value
  }
  statictext2.add("statictext", undefined, "ETA: " + eta + " seconds", {name: "statictext2"}); 
  
  // GROUP2
  // ======
  var group2 = dialog.add("group", undefined, {name: "group2"}); 
  group2.orientation = "row"; 
  group2.alignChildren = ["center","center"]; 
  group2.spacing = 10; 
  group2.margins = 0; 
  
  var button1 = group2.add("button", undefined, undefined, {name: "ok"}); // name property must be a certain value for dialog button to work
  button1.text = "OK"; 
  button1.preferredSize.width = 69; 
  
  var button2 = group2.add("button", undefined, undefined, {name: "cancel"}); // name property must be a certain value for dialog button to work
  button2.text = "Cancel"; 
  
  var choice = dialog.show();
  
  switch (choice) {
    case 1:
    return true
    
    case 2:
    return false
    
    default:
    break;
  }
}

// Reduce a fraction by finding the Greatest Common Divisor and dividing by it. (Get simplified ratio)
// Usually if an arg contains many digits after the decimal then the resulting ratio will be ginormous. This func only returns the simplest ratio.
function reduce(numerator,denominator){
  var gcd = function gcd(a,b){
    return b ? gcd(b, a%b) : a
  }
  gcd = gcd(numerator,denominator)
  if(numerator/gcd > numerator || denominator/gcd > denominator) {
    return [numerator, denominator]
  } else {
    return [numerator/gcd, denominator/gcd]
  }
}
