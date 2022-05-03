import { xmk } from '/js/lib.js'
import { statusBlip } from '/js/status.js'
import {
    clearRecords,
    icon,
    insertRecord,
    menuNewDlg,
    mkModalRecordButton,
    mkPopupModalDlg,
} from '/js/utils.js'

import { menuAboutDlg } from '/js/about.js'
import { menuPrefsDlg } from '/js/prefs.js'
import { menuSaveDlg } from '/js/save.js'
import { menuLoadDlg } from '/js/load.js'

function menuEntryDivider() {
    return xmk('li').xAppend(xmk('hr').xClass('dropdown-divider'))
}

function menuEntry(target, text, iconName, title) {
    let e = xmk('li')
        .xAppend(
            xmk('button')
                .xClass('dropdown-item')
                .xAttrs({
                    'data-bs-target': '#' + target,
                    'data-bs-toggle' : 'modal',
                    'type': 'button',
                    'title': title,
                })
                .xAppend(
                    icon(iconName),
                    xmk('span').xInnerHTML('&nbsp;' + text),
                )
                /*.xAddEventListener('click', (event) => {
                    // Capture the menu item before it is presented.
                    console.log(event.target.outerText)
                })*/
        )
    return e
}

function menuClearDlg() {
    let body = xmk('span')
        .xAppendChild(
            xmk('p').xInnerHTML('Really, really clear all existing records ?!???'),
            xmk('div').xClass('row')
                .xAppend(
                    xmk('div').xClass('col-auto')
                        .xAppend(
                            xmk('p').xInnerHTML('<span class="fs-3">YES</span>'),
                        ),
                    xmk('div').xClass('col', 'ml-3')
                        .xAppend(
                            xmk('span').xInnerHTML('Click&nbsp;'),
                            xmk('button').xClass('btn', 'btn-primary', 'btn-sm', 'disabled')
                                .xInnerHTML('Clear'),
                            xmk('span')
                                .xInnerHTML('&nbsp;to really do it. This is operation is NOT reversible!')
                        ),
                    xmk('div').xClass('w-100'),
                    xmk('div').xClass('col-auto')
                        .xAppend(
                            xmk('p').xInnerHTML('<span class="fs-3">NO</span>'),
                        ),
                    xmk('div').xClass('col', 'ml-3')
                        .xAppend(
                            xmk('span').xInnerHTML('Click&nbsp;'),
                            xmk('button').xClass('btn', 'btn-secondary', 'btn-sm', 'disabled')
                                .xInnerHTML('Close&nbsp;'),
                            xmk('span')
                                .xInnerHTML('&nbsp;to exit this dialogue with no changes.')
                        ),
                ),
        )
    let b1 = mkModalRecordButton('Close',
                                 'btn-secondary',
                                 'close the dialogue with no changes',
                                 (el) => {
                                    console.log(el)
                                    return true
                                })
    let b2 = mkModalRecordButton('Clear',
                                 'btn-primary',
                                 'clear all records and close the dialogue',
                                 (el) => {
                                     console.log(el)
                                     clearRecords()
                                     statusBlip('all records cleared', 1500)
                                     return true
                                })
    let e = mkPopupModalDlg('menuClearDlg', 'Clear All Records', body, b1, b2)
    return e
}

// menu
export function mkMenu() {
    // append trailing space to avoid scroll bar overlap
    let e = xmk('div')
        .xClass('dropdown')
        .xAppend(
            xmk('button')
                .xId('menu')
                .xClass('btn', 'btn-lg', 'dropdown-toggle', 'text-info')
                .xAttrs({
                    'aria-expanded': 'false',
                    'data-bs-toggle': 'dropdown',
                    'type': 'button',
                })
                .xAppend(icon('bi-list', 'menu')),
                /*.xAddEventListener('show.bs.dropdown', (event) => {
                    // pre-processing clean up.
                    console.log(event)
                }),*/
            xmk('ul')
                .xClass('dropdown-menu', 'dropdown-menu-dark', 'fs-4')
                .xAttrs({
                    'aria-labelledby': 'menu',
                })
                .xAppend(
                    menuEntry('menuAboutDlg',
                              'About',
                              'bi-info-circle',
                              'Information about this app.'),
                    menuEntry('menuPrefsDlg',
                              'Preferences',
                              'bi-gear',
                              'app preferences'),
                    menuEntryDivider(),
                    menuEntry('menuNewDlg',
                              'New Record',
                              'bi-plus-circle-fill',
                              'create a new record'),
                    menuEntry('menuClearDlg',
                              'Clear Records',
                              'bi-trash3-fill',
                              'clear all records'),
                    menuEntryDivider(),
                    menuEntry('menuLoadDlg',
                              'Load File',
                              'bi-file-arrow-up-fill',
                              'load records from a file'),
                    menuEntry('menuSaveDlg',
                              'Save File',
                              'bi-file-arrow-down-fill',
                              'save records to a file'),
                ),
        )

    // Dropdown menu dialogue boxes.
    document.body.xAppendChild(menuAboutDlg())
    document.body.xAppendChild(menuPrefsDlg())
    document.body.xAppendChild(menuNewDlg())
    document.body.xAppendChild(menuClearDlg())
    document.body.xAppendChild(menuLoadDlg())
    document.body.xAppendChild(menuSaveDlg())
    return e
}
