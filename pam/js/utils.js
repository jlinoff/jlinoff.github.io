// Utility functions.
import { xmk, xget, xgetn, enableFunctionChaining } from '/js/lib.js'
import { statusBlip } from '/js/status.js'
import { ALPHABET, getCrypticPassword, getMemorablePassword } from '/js/password.js'

// Mutable collection of record field types and names.
// It is updated each time a user adds a new record name.
export var recordFieldNames = { // type, name
    'account': 'text',
    'datetime': 'datetime-local',
    'email': 'email',
    'key': 'password',
    'login': 'text',
    'name': 'text',
    'note': 'textarea',
    'number': 'number',
    'phone': 'phone',
    'password': 'password',
    'secret': 'password',
    'text': 'text',
    'textarea': 'textarea',
    'url': 'url',
    'username': 'text',
}

export var recordFieldNamesDefaultActive = 'text'

// global id map
// each prefix has a number associated with it.
// mkid('foo') --> foo00000001
// mkid('bar') --> bar00000001
// mkid('bar') --> bar00000002
var mkidsMap = {}

/**
 * make unique id
 * @param the id prefix
 */
function mkid(prefix) {
    let idn = 1
    if (prefix in mkidsMap) {
        idn = mkidsMap[prefix] + 1
    } else {
        idn = 1
    }
    mkidsMap[prefix] = idn
    const id = prefix + '-' + idn.toString(16).padStart(8, '0')
    return id
}

/**
 * Reports whether the value is a URL.
 * <p>
 * It is used to generate links in record views.
 * @example
 * assert isURL('https://foo.bar.com') == true
 * assert isURL('not a url') == false
 * @param {string} value The string value to test.
 * @returns {bool} True if it is a URL or false otherwise.
 */
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

// icon - display an icon
export function icon(name, tooltip) {
    let e = xmk('i').xClass('bi', name)
    if (tooltip) {
        e.xAttrs({'title': tooltip})
    }
    return e
}

// Sort a collection by key
export const sortDictByKey = (obj) => Object.keys(obj).sort()
      .reduce((acc, c) => { acc[c] = obj[c]; return acc }, {})

// Create a popup modal dialogue.
export function mkPopupModalDlg(id, title, body, ...buttons) {
    let lid = id + 'Label'
    return xmk('div')
        .xId(id)
        .xClass('modal', 'fade')
        .xAttrs({
            'data-bs-backdrop': 'modal',
            'data-bs-keyboard': 'false',
            'tabindex': '-1',
            'aria-labelledby': lid,
            'aria-hidden': 'true',
        })
        .xAppend(
            xmk('div')
                .xClass('modal-dialog', 'modal-dialog-centered', 'modal-lg')
                .xAppend(
                    xmk('div')
                        .xClass('modal-content')
                        .xAppend(
                            xmk('div')
                                .xClass('modal-header')
                                .xAppend(
                                    xmk('h5')
                                        .xId(lid)
                                        .xClass('modal-title')
                                        .xInnerHTML(title)
                                ),
                            xmk('div')
                                .xClass('modal-body')
                                .xAppendChild(body),
                            xmk('div')
                                .xClass('modal-footer')
                                .xAppend(...buttons),
                        )
                )
        )
}

export function mkModalRecordButton(text, type, tooltip, callback) {
    let xcls = 'x-fld-record-' + text.toLowerCase()
    return xmk('button')
        .xClass('btn', type, 'btn-lg', xcls) // btn-secondary
        .xAttrs({
            'type': 'button',
            'title': tooltip,
        })
        .xAddEventListener('click', (event) => {
            // Manually hide modal element when button is clicked.
            // No id is needed.
            let modalContent = event.target.offsetParent
            let modalDialog = modalContent.offsetParent
            let modal = modalDialog.parentElement
            let bsModal = bootstrap.Modal.getInstance(modal)
            let modalContentBody = modalContent.xGet('.modal-body')
            if (callback(modalContentBody)){
                bsModal.hide()
            }
        })
        .xInnerHTML(text)
}

// find record by title.
// it does a case insensitive O(N) lookup so "Xyx" will be equal "xyz".
// This is an O(N) operation but that is okay because the number of records is small.
export function findRecord(title) {
    let recordsContainer = document.body.xGet('#records-accordion') // middle part of the document.
    let titleNormalized = title.trim().toLowerCase()
    let accordionItems = recordsContainer.xGetN('.accordion-item')
    for (let i=0; i<accordionItems.length; i++) {
        let accordionItem = accordionItems[i]
        let button = accordionItem.xGet('.accordion-button')
        let valueNormalized = button.innerHTML.trim().toLowerCase()
        if (valueNormalized === titleNormalized ) {
            return accordionItem
        }
    }
    return null
}

// find the record that would appear after this one
// for use in an insertBefore operation. If it would
// be the last record, return null.
// This is an O(N) operation but that is okay because the number of records is small.
export function findRecordAfter(title) {
    let recordsContainer = document.body.xGet('#records-accordion')
    let inserted = false
    let titleNormalized = title.trim().toLowerCase()
    let records = recordsContainer.xGetN('.accordion-item')
    for (let i=0; i<records.length; i++) {
        let record = records[i]
        let button = record.xGet('.accordion-button')
        let valueNormalized = button.innerHTML.trim().toLowerCase()
        if (valueNormalized > titleNormalized ) {
            return record // insertbefore
        }
    }
    return null // append
}

// delete record
export function deleteRecord(title) {
    let record = findRecord(title)
    if (record) {
        record.remove()
    }
}

// clear all records
export function clearRecords() {
    let recordsContainer = document.body.xGet('#records-accordion') // middle part of the document.
    let accordionItems = recordsContainer.xGetN('.accordion-item')
    let delList = []
    for (let i=0; i<accordionItems.length; i++) {
        let accordionItem = accordionItems[i]
        delList.push(accordionItem)
    }
    delList.forEach((n) => { n.remove() })
}

// Make record field with the name, type and value.
export function mkRecordField(name, type, value) {
    let rawValue = value
    let fieldValue = rawValue // is modified for display by password, textarea and url

    // copy to clipboard button for all fields.
    let fldButtons = []
    let copyToClipboardButton = mkRecordFieldCopyToClipboardButton(rawValue)

    switch (type) {
    case 'url':
        if (isURL(rawValue)) {
            fieldValue = `<a href="${rawValue}" target="_blank">${rawValue}</a>`
        }
        break
    case 'password':
        // show/hide button for password fields
        fieldValue = '*'.repeat(value.length)  // emulate the **** for password fields
        fldButtons.push( mkRecordFieldPasswordShowHideButton(rawValue, fieldValue) )
        break
    case 'textarea':
        fieldValue = `<pre>${rawValue}</pre>` // needed to keep line breaks in HTML
        break
    default:
        break
    }
    fldButtons.push(copyToClipboardButton) // copy to clipboard is the rightmost button

    // For each field in the entry add a an entry to the accordion body
    // with the field name and type. Also add a clipboard button.
    // For fields that contain URLs create a link.
    return mkRecordFldElement(name, type, fieldValue, rawValue, ...fldButtons)
}

// Make the DOM elements for a single record field.
function mkRecordFldElement(name, type, value, rawValue, ...buttons) {
    updateRecordFieldName(name, type) // update the recordFieldNames structure with custom fields.
    return xmk('div').xClass('row', 'p-0').xAppend(
        xmk('div')
            .xClass('col-12', 'col-sm-3', 'text-start')
            .xAppend(
                xmk('div')
                    //.xClass('border', 'fst-italic', 'x-fld-name')
                    .xClass('x-fld-name', 'overflow-auto', 'text-secondary')
                    .xInnerHTML(name),
            ),
        //xmk('div').xClass('col', 'text-center').xAppend(xmk('div').xInnerHTML(type)),
        xmk('div')
            .xClass('col-12', 'col-sm-7', 'text-start').xAppend(
                xmk('div')
                    .xClass('x-fld-value', 'border', 'font-monospace', 'overflow-auto')
                    .xAttrs({
                        'title': `type: ${type}`,
                        'data-fld-type': type,
                        'data-fld-raw-value': rawValue,
                    })
                    .xInnerHTML(value)
            ),
        xmk('div')
            .xClass('col-12', 'col-sm-2', 'text-end').xAppend(...buttons)
    )
}


// Make a button whose action is to copy to the clipboard
function mkRecordFieldCopyToClipboardButton(raw_value) {
    const value = raw_value
    return xmk('button')
        .xClass('btn', 'btn-lg', 'p-0', 'ms-2')
        .xAttrs({'type': 'button'})
        .xAppend(icon('bi-clipboard', 'copy to clipboard')) // also bi-files
        .xAddEventListener('click', (event) => {
            statusBlip(`copying ${value.length} bytes to clipboard`, 1500)
            console.log(status)
            if (navigator.clipboard) {
                navigator.clipboard
                    .writeText(value)
                    .then(
                        (text) => {
                            // succeeded
                            statusBlip(`copied ${value.length} bytes to clipboard`, 1500)
                        },
                        (error) => {
                            // failed
                            const msg = `internal error:\nnavigator.clipboard.writeText() error:\n${error}`
                            statusBlip(msg, 1500)
                            alert(msg)
                        }
                    )
                    .catch((error) => {
                        const msg = `internal error:\nnavigator.clipboard.writeText() exception:\n${error}`
                        statusBlip(msg, 1500)
                        alert(msg)
                    })
            } else {
                const msg = `internal error:\nnavigator.clipboard not found\ncould be a permissions problem`
                statusBlip(msg, 1500)
                alert(msg)
            }
         })
}

// Make a button whose action is to show or hide a password value
function mkRecordFieldPasswordShowHideButton(showValueIn, hideValueIn) {
    const showValue = showValueIn
    const hideValue = hideValueIn
    return xmk('button')
        .xClass('btn', 'btn-lg', 'p-0', 'ms-2')
        .xAppend(icon('bi-eye', 'show password'))
        .xAddEventListener('click', (event) => {
            let row = event.target.xGetParentWithClass('row')
            let button = event.target.xGetParentWithClass('btn')
            let valueElement = row.xGet('.x-fld-value')
            let icon = button.xGet('.bi-eye')
            if (icon) {
                icon.classList.remove('bi-eye')
                icon.classList.add('bi-eye-slash')
                valueElement.innerHTML = showValue
            } else {
                icon = button.xGet('.bi-eye-slash')
                icon.classList.remove('bi-eye-slash')
                icon.classList.add('bi-eye')
                valueElement.innerHTML = hideValue
            }
        })
}

// Update recordFieldNames for new names,
// do not update a names that already exist
// even if they have different types.
export function updateRecordFieldName(name, type) {
    if (name in recordFieldNames) {
        return
    }
    recordFieldNames[name] = type
    sortDictByKey(recordFieldNames)
    // todo: this does not yet update the pulldown menu because it was
    //       created statically.
    console.log('debug', recordFieldNames)
}


// Create the DOM structure for the new record using the bootstrap
// accordion idiom.
export function mkRecord(title, ...recordFields) {
    // Create the accordion item with all of the record information.
    // Accordions in bootstrap only allow one to item to be expanded at a time.
    let rid1 = mkid('rid') // unique record id for accordion entry header
    let rid2 = mkid('rid') // unique record id for accordion entry collapsable body
    return xmk('div').xAppend(
        xmk('div').xClass('accordion-item').xAppend(
            xmk('div').xId(rid1).xClass('accordion-header').xAppend(
                xmk('button').xClass('accordion-button', 'fs-4', 'collapsed')
                    .xAttrs({
                        'type': 'button',
                        'data-bs-toggle': 'collapse',
                        'data-bs-target': '#' + rid2,
                        'aria-expanded': 'false',
                        'aria-controls': rid2
                    })
                    .xInnerHTML(title)
            ),
            xmk('div').xId(rid2)
                .xAttrs({
                    'aria-labelledby': rid1,
                    'data-bs-parent': '#records-accordion',
                })
                //.xClass('accordion-collapse', 'collapse', 'show')
                .xClass('accordion-collapse', 'collapse')
                .xAppend(
                    xmk('div')
                        .xClass('accordion-body', 'fs-5')
                        .xAppend(
                            // The record fields with clipboard copy buttons and other stuff.
                            xmk('div')
                                .xClass('container')
                                .xAppend(...recordFields),
                            // The record buttons.
                            xmk('div')
                                .xClass('container')
                                .xAppend(
                                    xmk('div')
                                        .xClass('row', 'align-items-center')
                                        .xAppend(
                                            // the record Delete button.
                                            xmk('div')
                                                .xClass('col-12', 'align-self-start')
                                                .xAppend(
                                                    xmk('button')
                                                        .xClass('btn', 'fs-5', 'm-1')
                                                        .xAttrs({'title': 'delete this record'})
                                                        .xAppend(
                                                            icon('bi-trash', 'delete this record'),
                                                            xmk('span').xInnerHTML('&nbsp;Delete'))
                                                        .xAddEventListener('click', (event) => {
                                                            let accordionItem = event.target.xGetParentWithClass('accordion-item')
                                                            accordionItem.remove()
                                                        }),
                                                    xmk('button')
                                                        .xClass('btn', 'fs-5', 'm-1')
                                                        .xAttrs({'title': 'duplicate this record'})
                                                        .xAppend(
                                                            icon('bi-files', 'duplicated this record'),
                                                            xmk('span').xInnerHTML('&nbsp;Dup'))
                                                        .xAddEventListener('click', (event) => {
                                                            // bring up the edit record modal dialogue
                                                            let dlg = document.body.xGet('#menuDupDlg')
                                                            if (dlg) {
                                                                // we replace it each time because the fields are
                                                                // different.
                                                                dlg.remove()
                                                            }
                                                            document.body.xAppendChild(menuDupDlg(title))
                                                            dlg = document.body.xGet('#menuDupDlg')
                                                            let myModal = new bootstrap.Modal(dlg)
                                                            myModal.show()
                                                        }),
                                                    xmk('button')
                                                        .xClass('btn', 'fs-5', 'm-1')
                                                        .xAttrs({'title': 'edit this record'})
                                                        .xAppend(
                                                            icon('bi-pencil-square', 'edit this record'),
                                                            xmk('span').xInnerHTML('&nbsp;Edit')
                                                        )
                                                        .xAddEventListener('click', (event) => {
                                                            // bring up the edit record modal dialogue
                                                            let dlg = document.body.xGet('#menuEditDlg')
                                                            if (dlg) {
                                                                // we replace it each time because the fields are
                                                                // different.
                                                                dlg.remove()
                                                            }
                                                            document.body.xAppendChild(menuEditDlg(title))
                                                            dlg = document.body.xGet('#menuEditDlg')
                                                            let myModal = new bootstrap.Modal(dlg)
                                                            myModal.show()
                                                        })
                                                ),
                                        ),
                                ),
                        ),
                ),
        )
    )
}

// insert record into the accordion display
export function insertRecord(newRecord, title) {
    // ordered insertion here.
    // this logic guarantees that the list always maintains order.
    // order is desirable because it makes it more human readable.
    // the complexity O(N) but the list is relatively small (human scale)
    // so it will be sufficiently fast.
    let afterRecord = findRecordAfter(title)
    if (afterRecord) {
        afterRecord.parentElement.insertBefore(newRecord, afterRecord)
    } else {
        let recordsContainer = document.body.xGet('#records-accordion')
        recordsContainer.appendChild(newRecord)
    }
}

// define dropdown-toggle list item.
function mkRecordFieldNameListEntry(name, type) {
    return xmk('a')
        .xClass('dropdown-item')
        .xAttrs({'href': '#',
                 'value': name,
                 'data-lia-name': name,
                 'data-lia-type': type,
                })
        .xInnerHTML(name)
        .xAddEventListener('click', (event) => {
            let pp = event.target.xGetParentWithClass('dropdown-menu')
            let ppa = pp.xGet('.active')
            ppa.classList.remove('active')
            event.target.classList.add('active')
            let row = event.target.xGetParentWithClass('row')

            // Create the draggable field.
            console.log(`selected ${name}`)
            let container = event.target.xGetParentWithClass('container')
            container.xAppend(mkRecordEditField(name, type, container))
        })
}

// make the toggle list items for the drop down menu
function mkRecordFieldNameListItems(nameTypeMap) {
    // Create the type select list entries from recordFieldNames.
    let sorted = sortDictByKey(nameTypeMap)
    let entries = []
    Object.entries(sorted).forEach(([k,v]) => {
        let e =  xmk('li').xAppend(mkRecordFieldNameListEntry(k, v))
        if (k === recordFieldNamesDefaultActive) {
            e.xClass('active')
        }
        entries.push(e)
    })
    //console.log(entries)
    return entries
}

// Make a record field.
// textarea - has a known  bug: label aligns at bottom
// password - generate not implemented.
// all - move fields up and down (change order)
function mkRecordEditField(name, type, container, value) {
    let drag = '<i class="bi bi-grip-vertical"></i>'

    // See if name was already used, if so, append a number to the name to make it unique.
    let names = container.xGetN('.x-fld-name')
    let dups = {} // make sure it is not renamed to something that already exists
    console.log('.x-fld-name', names)
    names.forEach( (n) => {
        //console.log('n.value', n.value)
        if (n.value.includes(name)) {
            //console.log('name', name)
            let pos = n.value.search(/\d/);
            //console.log('pos', pos)
            if (pos < 0) {
                name = name + '1'
            } else {
                let base = n.value.slice(0, pos)
                let num = parseInt(n.value.slice(pos)) + 1
                name = base + num  // make a unique name
                while (name in dups) { // make sure it is really unique
                    num++
                    name = base + num
                }
                dups[name]= num
            }
        }
    })

    // define the the value input element
    if (!value) {
        value = ''
    }
    let passwordLength = null
    let passwordShowHide = null
    let passwordGenerate = null
    let inputs = [] // There can be multiple input elements (see password)
    if ( type === 'textarea' ) {
        let e = xmk('textarea')
        if (value) {
            e.value = value
        }
        inputs.push(e)
    } else if ( type === 'password' ) {
        let e0 = xmk('input').xAttrs({'type': type, 'value': value})
            .xAddEventListener('change', (event1) => {
                let e1 = event1.target.parentElement.xGet('.x-fld-value-length')
                e1.innerHTML = event1.target.value.length
            })
            .xAddEventListener('input', (event1) => {
                let e1 = event1.target.parentElement.xGet('.x-fld-value-length')
                e1.innerHTML = event1.target.value.length
            })
        inputs.push(e0)
        // password length element
        passwordLength = xmk('span').xClass('x-fld-value-length', 'mx-2').xInnerHTML('0')
    } else {
        let e = xmk('input').xAttrs({'type': type, 'value': value})
        inputs.push(e)
    }
    // These are the same for all inputs.
    inputs[0]
        .xClass('x-fld-value', 'form-control', 'font-monospace')
        .xAttr('data-fld-type', type)
        .xAddEventListener('focus', (event) => {
            // Allow text to be selected in a draggable parent.
            // Disable dragging.
            let row = event.target.xGetParentWithClass('x-new-rec-fld')
            row.setAttribute('draggable', false)
        })
        .xAddEventListener('blur', (event) => {
            // Allow text to be selected in a draggable parent.
            // Re-enable dragging.
            let row = event.target.xGetParentWithClass('x-new-rec-fld')
            row.setAttribute('draggable', true)
        })

    // define delete button
    let recordDeleteButton = xmk('button')
        .xAttrs({'type': 'button', 'title': `delete field`})
        .xClass('btn', 'btn-lg', 'ms-2')
        .xAppend(icon('bi-trash3-fill', 'delete'),
                 xmk('span').xInnerHTML('&nbsp;Delete Field '))
        .xAddEventListener('click', (event) => {
            let row = event.target.xGetParentWithClass('x-new-rec-fld')
            row.remove()
        })

    let buttons = [recordDeleteButton] // buttons common to all types

    // define password buttons
    if ( type === 'password' ) {
        passwordShowHide = xmk('button')
            .xAttrs({'type': 'button',
                     'title': 'show or hide password'})
            .xClass('btn', 'btn-lg', 'px-0', 'ms-2')
            .xAppend(icon('bi-eye', 'show or hide password'))
            .xAddEventListener('click', (event) => {
                // TODO: DRY this! (in password.js)
                let button = event.target.parentElement
                //console.log(button)
                let row = button.xGetParentWithClass('row')
                let passwordInput = row.xGet('.x-fld-value')
                let icon = button.xGet('i')
                let show = icon.classList.contains('bi-eye')
                if (show) {
                    icon.classList.remove('bi-eye')
                    icon.classList.add('bi-eye-slash')
                    passwordInput.xAttr('type', 'text')
                } else {
                    icon.classList.remove('bi-eye-slash')
                    icon.classList.add('bi-eye')
                    passwordInput.xAttr('type', 'password')
                }
            })

        // generate button
        passwordGenerate = xmk('button')
            .xAttrs({'type': 'button'})
            .xClass('btn', 'btn-lg', 'px-0', 'ms-2')
            .xAppend(icon('bi-gear', 'generate a password'))
            .xAddEventListener('click', (event) => {
                mkGeneratePasswordDlg(event)
            })
    }

    let draggableRow = mkDraggableRow(type)
    draggableRow.xAppend(
        xmk('form').xClass('x-fld-form').xAppend(
            xmk('fieldset').xClass('border', 'border-dark', 'p-3').xAppend(
                xmk('legend')
                    .xClass('float-none', 'w-auto', 'fs-4', 'px-2')
                    .xStyle({cursor: 'grab'})
                    .xAttrs({'title': 'field name draggable'})
                    .xInnerHTML(`${drag} ${name}`),

                // Field name
                xmk('div').xClass('row').xAppend(
                    xmk('div').xClass('col', 'col-sm-3').xAppend(
                        xmk('label')
                            .xClass('col-form-label')
                            .xInnerHTML('Field Name')
                    ),
                    xmk('div').xClass('col-12', 'col-sm-8').xAppend(
                        xmk('div').xClass('input-group').xAppend(
                            xmk('input')
                                .xAttrs({'value': name,})
                                .xClass('x-fld-name', 'form-control')
                                .xAddEventListener('input', (event) => {
                                    let fieldset = event.target.xGetParentOfType('fieldset')
                                    let legend = fieldset.xGet('legend')
                                    legend.innerHTML = event.target.value
                                }),
                            xmk('span').xClass('input-group-append').xAppend(
                                xmk('button')
                                    .xClass('btn', 'btn-lg', 'px-0', 'ms-2')
                                    .xAttr('type', 'button')
                                    .xAddEventListener('click', (event) => {
                                        let row = event.target.xGetParentWithClass('row')
                                        row.xGet('input').value = ''
                                    })
                                    .xAppend(
                                        icon('bi-x-circle', 'clear field name')
                                    ),
                            ),
                        ),
                    ),
                ),

                // Field value
                xmk('div').xClass('row').xAppend(
                    xmk('div').xClass('col-12', 'col-sm-3').xAppend(
                        xmk('label')
                            .xClass('col-form-label')
                            .xInnerHTML('Field Value')
                    ),
                    xmk('div').xClass('col-12', 'col-sm-8', 'x-fld-value-div', 'overflow-auto').xAppend(
                        xmk('div').xClass('input-group').xAppend(
                            ...inputs,
                            xmk('span').xClass('input-group-append').xAppend(
                                passwordLength, // optional only for password
                                xmk('button')
                                    .xClass('btn', 'btn-lg', 'px-0', 'ms-2')
                                    .xAttr('type', 'button')
                                    .xAddEventListener('click', (event) => {
                                        let row = event.target.xGetParentWithClass('row')
                                        let field = row.xGet('.x-fld-value')
                                        //console.log(field)
                                        let ftype = field.getAttribute('data-fld-type')
                                        //console.log(ftype)
                                        if (ftype === 'textarea') {
                                            field.value = ''
                                        } else {
                                            field.value = ''
                                        }
                                        if (ftype === 'password') {
                                            let e1 = row.xGet('.x-fld-value-length')
                                            e1.innerHTML = '0' // length
                                        }
                                    })
                                    .xAppend(
                                        icon('bi-x-circle', `clear ${type} value`)
                                    ),
                                passwordShowHide, // optional, only for password
                                passwordGenerate, // optional only for password
                            ),
                        ),
                    ),
                    xmk('div').xClass('col-12', 'col-sm-auto').xAppend(...buttons),
                ),
            ),
        ),
    )
    return draggableRow
}

// Make draggable row
function mkDraggableRow(type) {
    return xmk('row')
        .xClass('row', 'x-new-rec-fld')
        .xAttrs({
            'data-rec-type': type,
            'draggable': 'true',
        })
        .xAddEventListener('dragstart', (event) => {
            // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
            //event.preventDefault() -- this breaks everything
            event.dataTransfer.dropEffect = 'move'
            event.dataTransfer.setData('text/html', event.target.outerHTML)
        })
        .xAddEventListener('dragover', (event) => {
            event.preventDefault()
            event.dataTransfer.dropEffect = 'move' // this is required for the drop event
        })
        .xAddEventListener('drop', (event) => {
            event.preventDefault()
            // find dst row
            let dstrow = event.target.xGetParentOfType('row')
            let dstid = dstrow.xGet('legend').innerHTML
            // find src name
            const srcHTML = event.dataTransfer.getData('text/html')
            let srcdom = xmk('div').xInnerHTML(srcHTML) // convert to DOM to enable search
            let srcrow = srcdom.xGet('row')
            let srcid = srcrow.xGet('legend').innerHTML
            // We now have the src and dst.
            //
            // We need to move src to dst to do that we need to know
            // if the drag was up or down.
            //
            // I do this by proxy, find the index of each in the
            // parent children and compare them to determine the
            // direction.
            let container = dstrow.parentElement
            let rows = dstrow.parentElement.xGetN('row')
            let srcElement = null
            let dstElement = null
            let srcidx = -1
            let dstidx = -1
            for( let i=0; i<rows.length; i++) {
                let row = rows[i]
                let rowid = row.xGet('legend').innerHTML
                if (rowid === srcid) {
                    srcidx = i
                    srcElement = row
                }
                if (rowid === dstid) {
                    dstidx = i
                    dstElement = row
                }
            }
            if (srcidx > dstidx) {
                // dragged up
                container.insertBefore(srcElement, dstElement)
            } else if (srcidx < dstidx) {
                // dragged down
                if (dstidx === (rows.length - 1)) {
                    container.appendChild(srcElement) // will move
                } else  {
                    container.insertBefore(dstElement, srcElement)
                }
            }
        })
}

// Define the DOM elements used to edit the record.
function mkRecordEditDlg(title) {
    return xmk('div').xClass('container').xAppend(
        xmk('div').xClass('row').xAppend(
            // Title input
            xmk('div').xClass('col-12').xAppend(
                xmk('input')
                    .xClass('w-100', 'fs-4', 'm-2', 'x-record-title')
                    .xAttrs({
                        'value': title,
                        'placeholder': 'Record Title',
                    })
            ),
        ),
        xmk('div').xClass('row').xAppend(
            xmk('div').xClass('col').xAppend(
                xmk('div').xClass('dropdown').xAppend(
                    // This is the field types button that displays the field name pulldown.
                    xmk('button')
                        .xId('x-new-field-type') // why is this needed?
                        .xClass('btn', 'btn-secondary', 'dropdown-toggle')
                        .xAttrs({
                            'aria-expanded': 'false',
                            'data-bs-toggle': 'dropdown',
                            'title': 'create new field of the selected type',
                            'type': 'button',
                        })
                        .xInnerHTML('New Field'),
                    // This is the field name list pulldown.
                    xmk('ul')
                        .xAttrs({'aria-labelledby': 'x-new-field-type'})
                        .xClass('dropdown-menu')
                        .xAppend(...mkRecordFieldNameListItems(recordFieldNames)
                    ),
                ),
            ),
        ),
    )
}

// Copy the fields from the source record to the edit dlg.
// title is the identifies the source record.
function CopyRecordFieldsToEditDlg(title, body) {
    let srcRecord = findRecord(title)
    let rows = srcRecord.xGetN('.row')
    for (let i=0; i<rows.length; i++) {
        let row = rows[i]
        let nameDiv = row.xGet('.x-fld-name')
        if (!nameDiv) {
            continue // button row
        }
        let name = nameDiv.innerHTML
        let valueDiv = row.xGet('.x-fld-value')
        let value = valueDiv.innerHTML
        let type = valueDiv.getAttribute('data-fld-type')
        if (type === 'password' || type === 'url' || type === 'textarea') {
            value = valueDiv.getAttribute('data-fld-raw-value')
        }
        let fld = mkRecordEditField(name, type, body, value)
        body.xAppend(fld)
    }
}

// edit an existing record.
// this is ephemeral, it is created when the record Edit button is clicked.
function menuEditDlg(title) {
    // Create the dynamic grid for the popup modal dialogue that is
    // used to define the new record.
    // Each record is defined by a title and fields.
    // The user updates the title and fields interactively.
    // Once they are done, they click the "Save" button
    // to save the record to the top level records accordion or
    // they click the "Close" button to abort.
    let body = mkRecordEditDlg(title)
    CopyRecordFieldsToEditDlg(title, body)
    let closeButton = mkModalRecordButton('Close',
                                          'btn-secondary',
                                          'close the dialogue with no changes',
                                          (event) => {
                                              //console.log(event)
                                              cleanRecordEditDlg(event)
                                              return true
                                          })
    let saveButton = mkModalRecordButton('Save',
                                         'btn-primary',
                                         'save the changes and close the dialogue',
                                         (event) => {
                                             //console.log(event)
                                             checkRecordEditDlg(event, true)
                                             let container = event.xGet('.container')
                                             if (container.getAttribute('data-check-failed')) {
                                                 let msg = container.getAttribute('data-check-failed')
                                                 alert(`ERROR! ${msg}\nCANNOT SAVE RECORD`)
                                                 container.removeAttribute('data-check-failed')
                                                 return false
                                             } else {
                                                 let newTitle = container.xGet('.x-record-title').value.trim()
                                                 // Delete the old one before adding the new one.
                                                 let old = findRecord(title)
                                                 old.remove()
                                                 saveRecordEditDlg(event)
                                                 cleanRecordEditDlg(event)
                                                 return true
                                     }
    })
    let e = mkPopupModalDlg('menuEditDlg', 'Edit Record', body, closeButton, saveButton)
    return e
}

// Duplicate an existing record
function menuDupDlg(title) {
    let body = mkRecordEditDlg(title + ' Dup')
    CopyRecordFieldsToEditDlg(title, body)
    let closeButton = mkModalRecordButton('Close',
                                          'btn-secondary',
                                          'close the dialogue with no changes',
                                          (event) => {
                                              console.log(event)
                                              cleanRecordEditDlg(event)
                                              return true
                                          })
    let saveButton = mkModalRecordButton('Save',
                                         'btn-primary',
                                         'save the changes and close the dialogue',
                                         (event) => {
                                             console.log(event)
                                             checkRecordEditDlg(event, false) // do not allow duplicate titles
                                             let container = event.xGet('.container')
                                             if (container.getAttribute('data-check-failed')) {
                                                 let msg = container.getAttribute('data-check-failed')
                                                 alert(`ERROR! ${msg}\nCANNOT SAVE RECORD`)
                                                 container.removeAttribute('data-check-failed')
                                                 return false
                                             } else {
                                                 let newTitle = container.xGet('.x-record-title').value.trim()
                                                 // do not delete the old record!
                                                 saveRecordEditDlg(event)
                                                 cleanRecordEditDlg(event)
                                                 return true
                                     }
    })
    let e = mkPopupModalDlg('menuDupDlg', 'Duplicate Record', body, closeButton, saveButton)
    return e
}

// create a new record
export function menuNewDlg() {
    // Create the dynamic grid for the popup modal dialogue that is
    // used to define the new record.
    // Each record is defined by a title and fields.
    // The user updates the title and fields interactively.
    // Once they are done, they click the "Save" button
    // to save the record to the top level records accordion or
    // they click the "Close" button to abort.
    let body = mkRecordEditDlg('')
    let closeButton = mkModalRecordButton('Close',
                                          'btn-secondary',
                                          'close the dialogue with no changes',
                                          (event) => {
                                              //console.log(event)
                                              cleanRecordEditDlg(event)
                                              return true
                                          })
    let saveButton = mkModalRecordButton('Save',
                                         'btn-primary',
                                         'save the changes and close the dialogue',
                                         (event) => {
                                             //console.log(event)
                                             checkRecordEditDlg(event, false)
                                             let container = event.xGet('.container')
                                             if (container.getAttribute('data-check-failed')) {
                                                 let msg = container.getAttribute('data-check-failed')
                                                 alert(`ERROR! ${msg}\nCANNOT SAVE RECORD`)
                                                 container.removeAttribute('data-check-failed')
                                                 return false
                                             } else {
                                                 saveRecordEditDlg(event)
                                                 cleanRecordEditDlg(event)
                                                 return true
                                     }
    })
    let e = mkPopupModalDlg('menuNewDlg', 'New Record', body, closeButton, saveButton)
    return e
}

// Clean up the drop down.
// Reset the active to the default.
// event - event listener event
function cleanRecordEditDlg(event) {
    // define the active selection.
    let button = event.offsetParent.xGet('.dropdown-toggle')
    button.parentElement.xGetN('.dropdown-item').forEach( (n) => {
        n.classList.remove('active') // remove from all entries
        if (n.innerHTML === recordFieldNamesDefaultActive) {
            n.classList.add('active') // activate the text entry
        }
    })

    // reset dropdown state when creating a new record.
    button.innerHTML = `Type (${recordFieldNamesDefaultActive})` // this is the default
    let container = button.xGetParentWithClass('container')

    // clear the title
    container.xGet('.x-record-title').value = ''

    // remove artifacts
    xgetn('.x-new-rec-fld').forEach((n) => {n.remove()})
}

// check the record edit dialogue before saving.
// event - event listener event
function checkRecordEditDlg(event, allowDupTitle) {
    // Check the record to make sure that is copacetic.
    // error info is reported by the data-check-failed attribute.
    // todo: check for blank title
    console.log('checking', event)
    let container = event.xGet('.container')
    let title = container.xGet('.x-record-title').value.trim()
    console.log('title', title)
    // allowDupTitle is true when we know that the old record will be
    // removed so duplicates are okay
    if (!title && !allowDupTitle) {
        // note: could use an attribute here to store error messages
        console.log('warning!', 'undefined record title')
        container.xAttr('data-check-failed', 'undefined record title')
        return
    }
    // todo: check for dup titles in the global list of records
    let recordsContainer = document.body.xGet('#records-accordion') // middle part of the document.
    let titleNormalized = title.trim().toLowerCase()
    let accordionItems = recordsContainer.xGetN('.accordion-item')
    // allowDupTitle is true when we know that the old record will be
    // removed so duplicates are okay
    if (!allowDupTitle && findRecord(title)) {
        container.xAttr('data-check-failed', `title already exists: "${title}"`)
        return
    }
    // use the dom record structure (defined in "save") to look for dups.
    // todo: add empty fields warning
    let flds = container.xGetN('.x-new-rec-fld')
    if (flds.length === 0) {
        // no fields were added.
        container.xAttr('data-check-failed', 'no fields found')
        return
    } else {
        for (let i=0; i<flds.length; i++) {
            //console.log(`fld[${i}]`, flds[i])
            let nameElem = flds[i].xGet('.x-fld-name')
            if (nameElem) {
                let name = nameElem.value.trim()
                if (!name) {
                    let msg = `undefined field name in record: ${title}`
                    console.log('warning!', msg)
                    container.xAttr('data-check-failed', msg)
                    return
                }
            }
            let valueElem = flds[i].xGet('.x-fld-value')
            if (valueElem) {
                let value = valueElem.value.trim()
                if (!value) {
                    let msg = `undefined field value in ${name} in record: ${title}`
                    //console.log('warning!', msg)
                    container.xAttr('data-check-failed', msg)
                    return
                }

                let type = valueElem.getAttribute('data-fld-type')
                if (type === 'url') {
                    if (!isURL(value)) {
                        let msg = `"${name}" is not a valid URL "${value}" in record: ${title}`
                        //console.log('warning!', msg)
                        container.xAttr('data-check-failed', msg)
                        return
                    }
                }
                // todo: for passwords check against min/max length
            }
        }
    }
}

// Make the record fields from the DOM structure of the
// of the popup dialogue described by the container argument.
function mkRecordFields(container) {
    let recordFields = []
    let flds = container.xGetN('.x-new-rec-fld')
    for (let i=0; i<flds.length; i++) {
        //console.log(`save.row[${i}]`, flds[i])
        let nameElem = flds[i].xGet('.x-fld-name')
        let valueElem = flds[i].xGet('.x-fld-value')
        if (!nameElem || !valueElem) {
            // This field was deleted but there was a '.x-new-rec-fld'
            // artifact.
            continue
        }
        let name = nameElem.value
        let type = valueElem.getAttribute('data-fld-type')
        let value = valueElem.value
        recordFields.push( mkRecordField(name, type, value) )
    }
    return recordFields
}

// save the record
function saveRecordEditDlg(event) {
    let container = event.xGet('.container')
    //console.log('save', container)
    let rows = container.xGetN('.row')
    //console.log('save.rows', rows)
    let title = container.xGet('.x-record-title').value
    //console.log('save.title', title)
    // Create the accordion item with all of the record information.
    // Accordions in bootstrap only allow one to item to be expanded at a time.
    let recordFields = mkRecordFields(container)
    let newRecord = mkRecord(title, ...recordFields)
    insertRecord(newRecord, title)
}

// make the generate password dialogue for record fields and save
// reuse it if it already exists
export function mkGeneratePasswordDlg(event) {
    let button = event.target.parentElement
    let row = button.xGetParentWithClass('row')
    let passwordInput = row.xGet('.x-fld-value')
    // has it already been created?
    let genSection = row.xGet('.x-fld-pw-gen')
    if (!genSection) {
        // Create the generation section and add it.
        //let topdiv = row.xGet('fieldset')
        let topdiv = row.xGet('.x-fld-value-div')
        let len = 20
        let cp0 = getCrypticPassword(len, ALPHABET)
        let num = 5 // number of memorable passwords
        let mbs = []
        // Create the memorable password buttons.
        for (let i=0; i<num; i++) {
            const pwd = getMemorablePassword(len)
            const rowElement = row
            let button = xmk('button')
                .xClass('btn', 'btn-secondary', 'x-fld-pw-mp', 'm-2', 'font-monospace')
                .xAttrs({'title': 'click to save this memorable password'})
                .xInnerHTML(pwd)
                .xAddEventListener('click', (event) => {
                    rowElement.xGet('.x-fld-value').value = event.target.innerHTML
                })
            mbs.push(button)
        }
        topdiv.xAppend(
            // Close button.
            xmk('div').xClass('col-12', 'x-fld-pw-gen', 'mt-1').xAppend(
                //xmk('hr'),
                xmk('button')
                    .xClass('btn', 'btn-small', 'w-100')
                    .xAppend(
                        icon('bi-x-circle', 'close the section'),
                        xmk('span').xInnerHTML('&nbsp;Close Password Generator'))
                    .xAddEventListener('click', (event) => {
                        let row = button.xGetParentWithClass('row')
                        console.log(row)
                        row.xGetN('.x-fld-pw-gen').forEach( (col) => {
                            col.classList.add('d-none')
                        })
                    }),
            ),
            // Cryptic and memorable password buttons.
            xmk('div').xClass('col-auto', 'x-fld-pw-gen').xAppend(
                //xmk('hr'),
                xmk('p').xClass('m-1', 'fs-3').xInnerHTML('Password Generator'),
                xmk('p').xClass('m-1', 'fs-6').xInnerHTML('Click on the generated password to select it. ' +
                                                          'Click the Generate button or use the length slider ' +
                                                          'to generate new passwords.'),
                xmk('p').xClass('m-1', 'fs-5').xInnerHTML('Cryptic Password'),
                xmk('button')
                    .xClass('btn', 'btn-secondary', 'x-fld-pw-cp0', 'm-2', 'font-monospace')
                    .xAttrs({'title': 'click to save cryptic password'})
                    .xInnerHTML(cp0)
                    .xAddEventListener('click', (event) => {
                        row.xGet('.x-fld-value').value = event.target.innerHTML
                    }),
                xmk('p').xClass('fs-5').xInnerHTML('Memorable Passwords'),
                ...mbs,
            ),
            // Password length using range value.
            xmk('div').xClass('col-auto', 'x-fld-pw-gen').xAppend(
                xmk('span').xClass('fs-5').xInnerHTML('Length&nbsp;'),
                xmk('input')
                    .xClass('form-range', 'w-50')
                    .xAttrs({'type': 'range',
                             'value': len,
                             'title': 'password length',
                             'min': window.prefs.passwordRangeMinLength,
                             'max': window.prefs.passwordRangeMaxLength,
                            })
                    .xAddEventListener('focus', (event) => {
                        // Allow text to be selected in a draggable parent.
                        // Disable dragging.
                        let row = event.target.xGetParentWithClass('x-new-rec-fld')
                        row.setAttribute('draggable', false)
                    })
                    .xAddEventListener('blur', (event) => {
                        // Allow text to be selected in a draggable parent.
                        // Re-enable dragging.
                        let row = event.target.xGetParentWithClass('x-new-rec-fld')
                        row.setAttribute('draggable', true)
                    })
                    .xAddEventListener('input', (event) => {
                        console.log(event.target.value)
                        let rlen = event.target.parentElement.xGet('.x-fld-pw-range-len')
                        let len = parseInt(event.target.value)
                        let row = button.xGetParentWithClass('row')
                        rlen.xInnerHTML(len)
                        row.xGet('.x-fld-pw-cp0').innerHTML = getCrypticPassword(len, ALPHABET)
                        row.xGetN('.x-fld-pw-mp').forEach( (e) => {
                            console.log(e)
                            console.log(len)
                            let pwd = getMemorablePassword(len)
                            console.log(pwd)
                            e.innerHTML = pwd
                        })
                    }),
                xmk('span').xClass('fs-5').xInnerHTML('&nbsp;'),
                xmk('span').xClass('x-fld-pw-range-len', 'fs-5')
                    .xInnerHTML(window.prefs.passwordRangeLengthDefault)
            ),
            //xmk('hr'),
        )
    } else {
        // password dialogue already exists
        let row = button.xGetParentWithClass('row')
        console.log(row)
        let range = row.xGet('.x-fld-pw-range-len')
        let len = parseInt(range.innerHTML)
        let cp0Value = getCrypticPassword(len, ALPHABET)
        let cp0Button = row.xGet('.x-fld-pw-cp0')
        cp0Button.innerHTML = cp0Value
        row.xGetN('.x-fld-pw-mp').forEach( (e) => {
            e.innerHTML = getMemorablePassword(len)
        })

        // toggle visibility
        let cols = row.xGetN('.x-fld-pw-gen')
        if (cols[0].classList.contains('d-none')) {
            cols.forEach((col) => {
                col.classList.remove('d-none')
                console.log(col)
            })
        }
    }
}

// Make load/save password with clear and show/hide.
export function mkLoadSavePassword(xid) {
    return xmk('div').xClass('input-group').xAppend(
        xmk('input')
            .xId(xid)
            .xClass('form-control', 'x-fld-value', 'ps-1')
            .xAttrs({
                'type': 'password',
                'autocomplete': 'new-password',
                'value': window.prefs.filePass,
            }),
        xmk('span').xClass('input-group-append').xAppend(
            xmk('button')
                .xClass('btn', 'btn-lg', 'px-0', 'ms-2')
                .xAttr('type', 'button')
                .xAddEventListener('click', (event) => {
                    let row = event.target.xGetParentWithClass('row')
                    row.xGet('input').value = ''
                })
                .xAppend(
                    icon('bi-x-circle', 'delete password')
                ),
            xmk('button')
                .xClass('btn', 'btn-lg', 'px-0', 'ms-2')
                .xAttr('type', 'button')
                .xAddEventListener('click', (event) => {
                    let button = event.target.parentElement
                    let row = event.target.xGetParentWithClass('row')
                    let input = row.xGet('input')
                    let icon = button.xGet('i')
                    let show = icon.classList.contains('bi-eye')
                    if (show) {
                        icon.classList.remove('bi-eye')
                        icon.classList.add('bi-eye-slash')
                        input.xAttr('type', 'text')
                    } else {
                        icon.classList.remove('bi-eye-slash')
                        icon.classList.add('bi-eye')
                        input.xAttr('type', 'password')
                    }
                })
                .xAppend(
                    icon('bi-eye', 'show/hide password name')
                ),
        ),
    )
}
