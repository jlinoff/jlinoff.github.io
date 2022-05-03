// Save file.
import { xmk, xget, xgetn, enableFunctionChaining } from '/js/lib.js'
import { statusBlip } from '/js/status.js'
import { VERSION } from '/js/about.js'
import {
    findRecord,
    icon,
    mkLoadSavePassword,
    mkGeneratePasswordDlg,
    mkModalRecordButton,
    mkPopupModalDlg,
} from '/js/utils.js'
import { encrypt } from '/js/crypt.js'

// Called from the top level menu.
export function menuSaveDlg() {
    let body = xmk('span')
        .xAppendChild(
            xmk('p').xInnerHTML('Allow the use of a password to encrypt the file contents.'),
            xmk('form').xClass('container').xAppend(
                // save file name
                xmk('div').xClass('row').xAppend(
                    xmk('div').xClass('col-12', 'col-sm-3', 'overflow-auto').xAppend(
                        xmk('label').xClass('col-form-label').xInnerHTML('Filename')
                    ),
                    xmk('div').xClass('col-12', 'col-sm-9', 'overflow-auto').xAppend(
                        xmk('div').xClass('input-group').xAppend(
                            xmk('input').xClass('form-control', 'ps-1').xId('x-save-filename')
                                .xAttrs({'type': 'text', 'value': window.prefs.fileName}),
                            xmk('span').xClass('input-group-append').xAppend(
                                xmk('button')
                                    .xClass('btn', 'btn-lg', 'px-0', 'ms-2')
                                    .xAttr('type', 'button')
                                    .xAddEventListener('click', (event) => {
                                        let row = event.target.xGetParentWithClass('row')
                                        row.xGet('input').value = ''
                                    })
                                    .xAppend(
                                        icon('bi-x-circle', 'delete filename')
                                    ),
                            ),
                        ),
                    ),
                ),
                // save file password
                xmk('div').xClass('row').xAppend(
                    xmk('div').xClass('col-12', 'col-sm-3', 'overflow-auto').xAppend(
                        xmk('label').xClass('col-form-label').xInnerHTML('Password')
                    ),
                    xmk('div').xClass('col-12', 'col-sm-9', 'x-fld-value-div', 'overflow-auto').xAppend(
                        mkLoadSavePassword('x-save-password')
                    ),
                ),
            )
        )
    // Get the place to create the generate dialogue.
    // Load does not need the generate functionality.
    let input_group = body.xGet('#x-save-password').parentElement
    let input_group_append = input_group.xGet('.input-group-append')
    input_group_append.xAppend(
            xmk('button')
                .xClass('btn', 'btn-lg', 'px-0', 'ms-2')
                .xAttr('type', 'button')
            .xAddEventListener('click', (event) => {
                mkGeneratePasswordDlg(event)
            })
            .xAppend(
                icon('bi-gear', 'generate a password')
            ),
    )

    // Create the buttons.
    let b1 = mkModalRecordButton('Close',
                                 'btn-secondary',
                                 'close the dialogue with no changes',
                                 (el) => {
                                    console.log(el)
                                    return true
                                })
    let b2 = mkModalRecordButton('Save',
                                 'btn-primary',
                                 'save using the password',
                                 (el) => {
                                     console.log(el)
                                     let fn = el.xGet('#x-save-filename').value.trim()
                                     let fp = el.xGet('#x-save-password').value.trim()
                                     document.body.xGet('#x-save-password').value = fp
                                     window.prefs.fileName = fn
                                     window.prefs.filePass = fp
                                     statusBlip(`saving to ${fn}...`, 1500)
                                     saveFile(fn, fp)
                                     return true
                                })
    let e = mkPopupModalDlg('menuSaveDlg', 'Save Records To File', body, b1, b2)
    return e
}

// Save the file.
function saveFile(filename, password) {
    // TODO: convert JSON record data to text and encrypt it
    let now = new Date().toISOString()
    let contents = {
        'meta': {
            'date-saved': now,
            'format-version': VERSION,
        },
        'prefs': {
            'logStatusToConsole': window.prefs.logStatusToConsole,
            'passwordRangeLengthDefault': window.prefs.passwordRangeLengthDefault,
            'passwordRangeMinLength': window.prefs.passwordRangeMinLength,
            'passwordRangeMaxLength': window.prefs.passwordRangeMaxLength,
            'memorablePasswordWordSeparator': window.prefs.memorablePasswordWordSeparator,
            'memorablePasswordMinWordLength': window.prefs.memorablePasswordMinWordLength,
            'memorablePasswordMinWords': window.prefs.memorablePasswordMinWords,
            'memorablePasswordMaxWords': window.prefs.memorablePasswordMaxWords,
            'memorablePasswordMaxTries': window.prefs.memorablePasswordMaxTries,
            'clearBeforeLoad': window.prefs.clearBeforeLoad,
            'loadDupStrategy': window.prefs.loadDupStrategy,
        },
        'records': [],
    }
    // Load all of the record data.
    let recordsContainer = document.body.xGet('#records-accordion') // middle part of the document.
    let accordionItems = recordsContainer.xGetN('.accordion-item')
    for (let i=0; i<accordionItems.length; i++) {
        let accordionItem = accordionItems[i]
        let button = accordionItem.xGet('.accordion-button')
        let title = button.innerHTML
        let rec = {
            'title': title,
            'fields': []
        }
        let rows = accordionItem.xGetN('.row')
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
            let fld = {
                'name': name,
                'type': type,
                'value': value,
            }
            rec.fields.push(fld)
        }
        contents.records.push(rec)
    }
    let text = JSON.stringify(contents, null, 0)

    // TODO: encrypt using subtle encryption
    encrypt(password, text, filename, saveCallback)
}

function saveCallback(text, filename) {
    if (!text || text.length === 0 ) {
        return
    }
    // Create anchor element, add the data and click it.
    let data = 'data:text/plain; charset=utf-8,' + encodeURIComponent(text)
    let a = xmk('a')
        .xStyle({
            'display': 'none'
            })
        .xAttrs({
            'href': data,
            'download': filename
        })
    document.body.appendChild(a)
    a.click()
    a.remove()
}
