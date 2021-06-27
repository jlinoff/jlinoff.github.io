// Support for accordions.
// Accordions are scoped under a top element which allows them to be localized to a page.

import { common } from '/myvault/js/common.js'
import { xmake }  from '/myvault/js/utils.js'
import { makeIcon, changeIcon } from '/myvault/js/icons.js'

export var accordionPanelClass = 'x-accordion-panel'
export var accordionPanelImgClass = 'x-accordion-panel-img'
export var accordionPanelButtonClass = 'x-accordion-panel-button'

export function expandAccordion(top) {
    let panels = top.getElementsByClassName(accordionPanelClass)
    for(let i=0; i< panels.length; i++) {
        panels[i].style.display = 'block'
    }
    let images = top.getElementsByClassName(accordionPanelImgClass)
    for(let i=0; i< images.length; i++) {
        changeIcon(images[i], common.icons.arrowDown)
    }
}

export function collapseAccordion(top) {
    let panels = top.getElementsByClassName(accordionPanelClass)
    for(let i=0; i< panels.length; i++) {
        panels[i].style.display = 'none'
    }
    let images = top.getElementsByClassName(accordionPanelImgClass)
    for(let i=0; i< images.length; i++) {
        changeIcon(images[i], common.icons.arrowRight)
    }
}

// Accordion button style
export function getAccordionButtonStyle() {
    let style = common.themes._activeProp().accordion.button
    style.borderColor = common.themes._activeColors().fgColor
    style.backgroundColor = common.themes._activeColors().bgColor
    style.color = common.themes._activeColors().fgColor
    return style
}

// accordion panel style
export function getAccordionPanelStyle() {
    return {
        display: 'none',
    }
}

// An accordion entry is a button and a panel.
// The sub elements have class designations.
// Create an accordion entry
// Allow optional actiond when it expands or collapses
export function makeAccordionEntry(title, panel, expandAction, collapseAction) {
    return xmake('div')
        .xAppendChild(
            xmake('button') // button
                .xStyle(getAccordionButtonStyle())
                .xAddClass('x-theme-element')
                .xAddClass('x-hover')
                .xAppendChild(
                    makeIcon(common.icons.circleRight,'closed').xAddClass(accordionPanelImgClass),
                    xmake('span')
                        .xStyle(common.themes._activeProp().accordion.title)
                        .xInnerHTML('&nbsp;&nbsp;' + title))
                .xAddEventListener('click', e => clickedAccordionButton(e, expandAction, collapseAction)),
            xmake('div') //panel
                .xStyle(getAccordionPanelStyle())
                .xAddClass('x-theme-element')
                .xAddClass(accordionPanelClass)
                .xAppendChild(panel))
}

// Toggle accordion panel
export function clickedAccordionButton(event, expandAction, collapseAction) {
    // toggle expand/collapse
    let e = event.srcElement
    if ( e.nodeName !== 'BUTTON' ) {
        // Use the button if the user clicked on the image or text directly.
        e = e.parentNode
    }
    // Change the image.
    let icon = e.getElementsByClassName('x-icon-element')[0]

    // Toggle the panel display.
    e.classList.toggle("active");
    var panel = e.nextElementSibling;
    if (panel.style.display === "block") {
        panel.style.display = "none";
        changeIcon(icon, common.icons.circleRight).xAttr('alt', 'closed')
        if (collapseAction){
            collapseAction()
        }
    } else {
        panel.style.display = "block";
        changeIcon(icon, common.icons.circleDown).xAttr('alt', 'open')
        if (expandAction) {
            expandAction()
        }
    }
}
