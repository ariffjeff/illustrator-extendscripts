// Highlight a letter that you want to change all text characters of that color from.
// Pick a new color that you want to change said text characters to.
// Only text on the same artboard will be changed.

// This script isn't well optimized but it works. It takes a while to complete when 
// changing the color of large amounts of text since it must loop through every 
// character on an artboard.

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

// TODO: 
// DOES NOT WORK WITH CMYK

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  
  docSource = activeDocument
  artboardSource_index = docSource.artboards.getActiveArtboardIndex()
  artboardSource = docSource.artboards[artboardSource_index]
  artObject = docSource.selection
  
  // color_original = {
  //     red:255,
  //     green:0,
  //     blue:0
  // }
  // color_final = {
  //     red:0,
  //     green:255,
  //     blue:0
  // }
  
  if(artObject.constructor.name != "TextRange") {
    alert("Highlight a letter that you want to change all text of that color for.")
    return
  }
  
  color_original = artObject.characterAttributes.fillColor
  
  var w = new Window ("dialog");
  var panel = w.add('panel', undefined, 'Colors');
  
  var colorbutton1 = panel.add('iconbutton', undefined, undefined, {name:'coloroption1', style: 'toolbutton'});
  colorbutton1.size = [200,40];
  colorbutton1.fillBrush = colorbutton1.graphics.newBrush( colorbutton1.graphics.BrushType.SOLID_COLOR, [color_original.red/255, color_original.green/255, color_original.blue/255, 1] );
  colorbutton1.text = "Original Color";
  colorbutton1.textPen = colorbutton1.graphics.newPen (colorbutton1.graphics.PenType.SOLID_COLOR,[1,1,1], 1);
  colorbutton1.onDraw = customDraw;
  
  var colorbutton2 = panel.add('iconbutton', undefined, undefined, {name:'coloroption1', style: 'toolbutton'});
  colorbutton2.size = [200,40];
  colorbutton2.fillBrush = colorbutton2.graphics.newBrush( colorbutton2.graphics.BrushType.SOLID_COLOR, [0.3, 0.3, .3, 1] );
  colorbutton2.text = "New Color";
  colorbutton2.textPen = colorbutton2.graphics.newPen (colorbutton2.graphics.PenType.SOLID_COLOR,[1,1,1], 1);
  colorbutton2.onDraw = customDraw;
  
  var button1 = w.add("button", undefined, undefined, {name: "button1"}); 
  button1.text = "Ok"; 
  
  // colorbutton1.onClick = onButtonClick;
  colorbutton2.onClick = onButtonClick;
  
  w.center();
  var choice = w.show();
  
  if(choice == 1) {
    color_final = {
      red: colorbutton2.fillBrush.color[0] * 255,
      green: colorbutton2.fillBrush.color[1] * 255,
      blue: colorbutton2.fillBrush.color[2] * 255,
    };
    
    // Change text color across active artboard
    for(textFrame = 0; textFrame < docSource.textFrames.length; textFrame++) { // Text frame
      // if(docSource.textFrames[textFrame].parent.parent.artboards.getActiveArtboardIndex() == artboardSource_index) { // is textFrame on original artboard
      if(isObjectWithinArtboard(docSource.textFrames[textFrame], artboardSource)) { // is textFrame on original artboard
        for(letter = 0; letter < docSource.textFrames[textFrame].characters.length; letter++) { // letter
          if(colorsAreEqual(color_original, docSource.textFrames[textFrame].characters[letter].characterAttributes.fillColor)) { 
            docSource.textFrames[textFrame].characters[letter].characterAttributes.fillColor.red = color_final.red
            docSource.textFrames[textFrame].characters[letter].characterAttributes.fillColor.blue = color_final.blue
            docSource.textFrames[textFrame].characters[letter].characterAttributes.fillColor.green = color_final.green
          }
        }
      }
    } 
  }
  
  // for(textFrame = 0; textFrame < docSource.textFrames.length; textFrame++) { // Text frame
  //     if(docSource.textFrames[textFrame].parent.parent.artboards.getActiveArtboardIndex() == artboardSource_index) {
  
  //     }
  // }
}

function isObjectWithinArtboard(obj, artboard_source) {
  // Get corners of artboard_source
  artboard_TL = [artboard_source.artboardRect[0], artboard_source.artboardRect[1]]
  artboard_BR = [artboard_source.artboardRect[2], artboard_source.artboardRect[3]]
  
  // Check if obj is within artboard_source bounds
  if(obj.position[0] >= Math.min(artboard_TL[0], artboard_BR[0]) && obj.position[0] <= Math.max(artboard_TL[0], artboard_BR[0])) { // x range
    if(obj.position[1] >= Math.min(artboard_TL[1], artboard_BR[1]) && obj.position[1] <= Math.max(artboard_TL[1], artboard_BR[1])) { // y range
      return true
    }
  }
  return false
}

function colorsAreEqual(color_original, color_selected) {
  for(var rgbChannel = 0; rgbChannel < color_original.length; rgbChannel++) {
    if(color_original[rgbChannel] != color_selected[rgbChannel]) {
      return false;
    }
  }
  return true;
}

function onButtonClick() {
  
  var newcolor1 = colorpicker ();
  if (newcolor1===null) return;	// dialog dismissed
  this.fillBrush = this.graphics.newBrush(this.graphics.BrushType.SOLID_COLOR, newcolor1);
  // no need to call w.update() 
  // no need to reassign onDraw for the button, it's done already
  // call onDraw for the button:
  this.notify("onDraw");
}

function colorpicker (result_color) {
  var hexToRGB = function(hex) {
    var r = hex >> 16;
    var g = hex >> 8 & 0xFF;
    var b = hex & 0xFF;
    return [r, g, b];
  };
  
  var color_decimal = $.colorPicker();
  if (color_decimal<0) return null;    // If dialog is dismissed
  var color_hexadecimal = color_decimal.toString(16);
  var color_rgb = hexToRGB(parseInt(color_hexadecimal, 16));
  var result_color = [color_rgb[0] / 255, color_rgb[1] / 255, color_rgb[2] / 255]; 
  return result_color;
}

function customDraw() { 
  with( this ) {
    graphics.drawOSControl();
    graphics.rectPath(0,0,size[0],size[1]);
    graphics.fillPath(fillBrush);
    if(text) graphics.drawString(text,textPen,(size[0] - graphics.measureString(text, graphics.font, size[0])[0])/2, 3, graphics.font);
  }
}
