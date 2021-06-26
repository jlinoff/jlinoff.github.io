// The header
import { xmake, hideAll } from '/js/utils.js'
import { makeIcon, changeIcon } from '/js/icons.js'
import { common } from '/js/common.js'
import { showPrefsPage } from '/js/prefs.js'
import { showLoadPage } from '/js/load.js'
import { showDataPage } from '/js/data.js'
import { showSavePage } from '/js/save.js'
import { showAboutPage } from '/js/about.js'

export function header() {
    let e = document.getElementById('x-topmenu-div')
    if (e) {
        e.remove()
    }
    // random text
    let dtype = 'flex';
    let topdiv = xmake('div')
            .xId('x-topmenu-div')
        .xAddClass('x-theme-element')
        .xStyle(common.themes._activeProp().header.bar)
            .xStyle({
                backgroundColor: common.themes._activeEntry().bgColor,
                color: common.themes._activeEntry().fgColor,
            })

    // Create the pull down menu.
    // This is a first approximation using buttons.
    topdiv.append(
        xmake('button')
            .xId('x-topmenu-button')
            .xAddClass('x-theme-element')
            .xStyle(common.themes._activeProp().header.menu.closed)
            .xStyle({
                backgroundColor: common.themes._activeEntry().bgColor,
                color: common.themes._activeEntry().fgColor,
            })
            .xAppendChild(makeIcon(common.icons.menu, 'menu'))
            .xAddEventListener('click', e => clickedMenu(e, dtype)),
        xmake('div')
            .xId('x-menu-wrapper')
            .xStyle(common.themes._activeProp().header.menu.opened)
            .xAppendChild(
                xmake('div')
                    .xId('x-menu-content')
                    .xStyle(
                        {
                            display: 'none',
                            flexDirection: 'column',
                            backgroundColor: common.themes._activeEntry().bgColor,
                            color: common.themes._activeEntry().fgColor,
                            zIndex: '30',
                        })
                    .xAppendChild(
                        // option #2: add separate handlers for each option? make it a loop?
                        makeMenuEntry('information about the tool',
                                      'About',
                                      common.icons.info,
                                      showAboutPage),
                        makeMenuEntry('modify preferences',
                                      'Preferences',
                                      common.icons.cog,
                                      showPrefsPage),
                        makeMenuEntry('load the password database records',
                                     'Load',
                                      common.icons.list,
                                      showLoadPage),
                        makeMenuEntry('view or modify the password data records',
                                      'Records',
                                      common.icons.db,
                                      showDataPage),
                        makeMenuEntry('save the records to the vault',
                                      'Save',
                                      common.icons.save,
                                      showSavePage),
                    )
            )
    )


    // Title
    topdiv.appendChild(
        xmake('div')
            .xId('x-title')
            .xAddClass('x-theme-element')
            .xStyle(common.themes._activeProp().header.title)
            .xStyle(
                {
                    backgroundColor: common.themes._activeEntry().bgColor,
                    color: common.themes._activeEntry().fgColor,
                })
            .xInnerHTML(common.meta.title))


    document.body.appendChild(topdiv)

    // Use the event class property to propagate the colors at startup.
    setTimeout( () => {
        let es = document.getElementsByClassName('x-theme-element')
        document.body.style.color = common.themes._activeEntry().fgColor
        document.body.style.backgroundColor = common.themes._activeEntry().bgColor
        for(let i=0;i<es.length; i++) {
            let e = es[i]
            e.style.color = common.themes._activeEntry().fgColor
            e.style.backgroundColor = common.themes._activeEntry().bgColor
        }}, 10)
}

// make a menu entry
function makeMenuEntry(tooltip, title, icon, handler) {
    //let fs = common.themes._activeProp().menuItemFontSize
    return xmake('button')
        .xStyle(common.themes._activeProp().menu)
        .xStyle({
            backgroundColor: common.themes._activeEntry().bgColor,
            color: common.themes._activeEntry().fgColor,
        })
        .xTooltip(tooltip)
        .xAddClass('x-hover')
        .xAddClass('x-theme-element')
        .xAddEventListener('click', (e) => handler(e))
        .xAppendChild(
            makeIcon(icon, title),
            xmake('span').xInnerHTML('&nbsp;' + title))
}

export function hideMenu() {
    let x = document.getElementById('x-menu-content')
    x.style.display = 'none'
}

function clickedMenu(e, dtype) {
    let x = document.getElementById('x-menu-content')
    if (x.style.display === 'none') {
        x.style.display = dtype
    }
    else {
        x.style.display = 'none'
    }
  //alert('clicked in topmenu!');
}
