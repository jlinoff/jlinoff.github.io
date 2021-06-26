// Utilities
import { common } from '/myvault/js/common.js'
import { getColorFilter } from '/myvault/js/icons.js'
import { makeIcon, makeIconWithImg }  from '/myvault/js/icons.js'

// Allow chaining for common calls to group element creation suff.
// Here is an example:
// document.xmake('button').
//  .xAddClass('menu')
//  .xId('topmenu')
//  .xInnerHTML(`<img src="${ setup.menuImage }" alt="menu">`)
//  .xAddEventListener('click', e => clicked(e))
//  .xAppendToParent(document.body);
export function enableFunctionChaining() {
    HTMLDocument.prototype.xmake = function(tagName, options) {
        return this.createElement(tagName, options);
    }

    Element.prototype.xAddClass = function(className) {
        this.classList.add(className);
        return this;
    }

    Element.prototype.RmClass = function(className) {
        this.classList.remove(className);
        return this;
    }

    Element.prototype.xInnerHTML = function(text) {
        this.innerHTML = text;
        return this;
    }

    Element.prototype.xAddEventListener = function(eventName, eventAction) {
        this.addEventListener(eventName, eventAction);
        return this;
    }

    Element.prototype.xAppendToParent = function(parent) {
        parent.appendChild(this);
        return this;
    }

    Element.prototype.xAppendChild = function(...child) {
        for (let i=0; i<child.length; i++) {
            let e = child[i]
            this.appendChild(e)
        }
        return this;
    }

    Element.prototype.xId = function(id) {
        this.setAttribute('id', id);
        return this;
    }

    Element.prototype.xAttr = function(name, value) {
        this.setAttribute(name, value);
        return this;
    }

    Element.prototype.xAttrNS = function(ns, name, value) {
        this.setAttributeNS(ns, name, value);
        return this;
    }

    Element.prototype.xAttrIfTrue = function(name, value, flag) {
        if (flag) {
            this.setAttribute(name, value);
        }
        return this;
    }

    Element.prototype.xStyle = function(listOfStyles) {
        for (const property in listOfStyles) {
            this.style[property] = listOfStyles[property];
        }
        return this;
    }

    Element.prototype.xTooltip = function(tip) {
        this.setAttribute('title', tip);
        return this;
    }

    Element.prototype.xRemoveChildren = function() {
        let parent = this
        while (parent.firstChild) {
            parent.removeChild(parent.lastChild);
        }
    }
}

// Shortcut for element creation in the document.
export function xmake(tagName, options) {
  return document.createElement(tagName, options);
}


// Hide all pages
export function hideAll() {
    let elements = document.getElementsByClassName('x-spa-page')
    for(let i=0;i<elements.length; i++) {
        let element = elements[i]
        element.style.display = 'none'
    }
}

// make an icon button
// usage:
// makeIconButton('encrypt using master password', 'encrypt', common.icons.lock, (e) => alert('not enabled yet')
export function makeIconButton(tooltip, alt, icon, clicker) {
    return xmake('button')
        .xStyle({
            backgroundColor: common.themes._activeEntry().bgColor,
            color: common.themes._activeEntry().fgColor,
            margin: '2px',
        })
        .xAddClass('x-theme-element')
        .xTooltip(tooltip)
        .xAddEventListener('click', (e) => {
            clicker(e)
        })
        .xAppendChild(makeIcon(icon, alt))
}

// make a text button
export function makeTextButton(tooltip, text, clicker) {
    let pad = ((text.length % 2)) ? 4 : 5 // heuristic: makes the button text look better
    return xmake('button')
        .xStyle({
            backgroundColor: common.themes._activeEntry().bgColor,
            color: common.themes._activeEntry().fgColor,
            borderColor: common.themes._activeEntry().fgColor,
            width: (text.length + pad) +  'ch',
        })
        .xStyle(common.themes._activeProp().general.textButton)
        .xAddClass('x-theme-element')
        .xTooltip(tooltip)
        .xAddEventListener('click', (e) => {
            clicker(e)
        })
        .xInnerHTML(text)
}

// Get the field type from the name
// types are: password, textarea, url or string
export function getFieldType(name, div) {
    for(let i=0; i <common.ftype.length; i++) {
        let rec = common.ftype[i]
        let x = rec.rex
        let regexp = new RegExp(x, 'i')
        if (name.search(regexp) >= 0) {
            return rec.type
        }
    }
    return 'string'
}

// Is this string a URL
export function isURL(value) {
    if (value.includes('://')) {
        try {
            let url = new URL(value)
            return true
        } catch(e) {
            if (e instanceof TypeError) {
                return false
            }
        }
    }
    return false
}

// deep copy
// citation: https://javascript.plainenglish.io/how-to-deep-copy-objects-and-arrays-in-javascript-7c911359b089
export function deepCopyObject(inObject) {
    if (typeof inObject !== "object" || inObject === null) {
        return inObject // Return the value if inObject is not an object
    }
    let outObject = Array.isArray(inObject) ? [] : {}
    for (const key in inObject) {
        let value = inObject[key]
        // Recursively (deep) copy for nested objects, including arrays
        outObject[key] = deepCopyObject(value)
    }
    return outObject
}

// make input wrapper with embedded clear
export function makeInputXWrapper(input) {
    let div = xmake('div')
        .xStyle(common.themes._activeProp().general.iconxdiv)
        .xStyle({
            backgroundColor: common.themes._activeEntry().bgColor,
            color: common.themes._activeEntry().fgColor,
        })
        .xAddClass('x-theme-element')
        .xAppendChild(
            input,
            makeIconWithImg(
                common.themes._activeProp().general.iconx.width,
                xmake('img')
                    .xAddClass('x-theme-element')
                    .xAttr('src', common.icons.clear)
                    .xAttr('alt', 'x')
                    .xAttr('width', common.themes._activeProp().general.iconx.width)
                    .xAttr('height', common.themes._activeProp().general.iconx.height)
                    .xAddEventListener('click', (event) => {
                        let div = event.target.parentNode.parentNode // img --> svg --> div
                        let input = div.getElementsByTagName('input')[0]
                        input.value = ''
                        // clone and propagate the event as if it came from the input
                        let clonedEvent = new event.constructor(event.type, event)
                        input.dispatchEvent(clonedEvent)
                    })
                    .xAddClass('x-vertical-center')
                    .xStyle(common.themes._activeProp().general.iconx)
                    .xStyle({
                        backgroundColor: common.themes._activeEntry().fgColor,
                        color: common.themes._activeEntry().bgColor,
                    })
            )
        )
    return div
}

// display a status message for a short time and then hide
export function statusMsg(msg) {
    let div = xmake('div')
        .xStyle(common.themes._activeProp().general.status.css)
        .xStyle({
            border: '0',
            backgroundColor: common.themes._activeEntry().bgColor,
            color: common.themes._activeEntry().fgColor,
        })
        .xInnerHTML(msg)
    document.body.appendChild(div)
    setTimeout(()=> {div.remove()},
               common.themes._activeProp().general.status.duration)
}
