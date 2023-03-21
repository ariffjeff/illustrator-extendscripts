#include "jsx_modules.jsx"

/*
Shrink selection by 1/8in in both x and y. This is mainly intended for 24in x 18in prints to make them easier to mount on materials since the edges won't need to be cut off after mounting.
*/

main()

function main() {

    if(documents.length < 1) {
        alert("Open a document and try again.");
        return
    }

    var docUnits = getDocUnit()
    if(docUnits === false) return

    shrink = 72 / 8 // 1/8in

    if(selection.length < 1) {
        if(docUnits.unit != 'Inches') {
            shrink = prec(shrink, 3)
            alert("Select object(s) to shrink by " + prec(shrink / docUnits.multiplier, 3) + docUnits.unit_short.toLowerCase() + " (" + prec(shrink / 72, 3) + " inches).")
            return
        }
        alert("Select object(s) to shrink by " + prec(shrink / docUnits.multiplier, 3) + " inches.")
        return
    }

    artObjects = selection

    for(var i = 0; i < artObjects.length; i++) {
        artObjects[i].width -= shrink
        artObjects[i].height -= shrink

        // center transform
        artObjects[i].position = [
            artObjects[i].position[0] += shrink / 2,
            artObjects[i].position[1] -= shrink / 2,
        ]
    }
}
