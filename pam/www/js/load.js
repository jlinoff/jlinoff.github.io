// Load file.
import { xmk, xget, xgetn, enableFunctionChaining } from '/js/lib.js'
import { statusBlip } from '/js/status.js'
import {
    clearRecords,
    deleteRecord,
    findRecord,
    icon,
    insertRecord,
    mkLoadSavePassword,
    mkPopupModalDlg,
    mkModalRecordButton,
    mkRecordField,
    mkRecord,
} from '/js/utils.js'
import { menuPrefsDlg } from '/js/prefs.js'
import { decrypt } from '/js/crypt.js'


// load a file
export function menuLoadDlg() {
    let body = xmk('span')
        .xAppendChild(
            xmk('p').xInnerHTML('Enter a password if the file was encrypted.'),
            xmk('form').xClass('container').xAppend(
                xmk('div').xClass('row').xAppend(
                    xmk('div').xClass('col-12', 'col-sm-3', 'overflow-auto').xAppend(
                        xmk('label').xClass('col-form-label').xInnerHTML('Password')
                    ),
                    xmk('div').xClass('col-12', 'col-sm-9', 'overflow-auto').xAppend(
                        mkLoadSavePassword('x-load-password')
                    ),
                )
            )
        )
    let b1 = mkModalRecordButton('Close',
                                 'btn-secondary',
                                 'close the dialogue with no changes',
                                 (el) => {
                                    console.log(el)
                                    return true
                                })
    let b2 = mkModalRecordButton('Load',
                                 'btn-primary',
                                 'load using the password',
                                 (el) => {
                                     //console.log(el)
                                     let password = el.xGet('#x-load-password').value.trim()
                                     window.prefs.filePass = password
                                     loadFile(password)
                                     return true
                                })
    let e = mkPopupModalDlg('menuLoadDlg', 'Load Records From File', body, b1, b2)
    return e
}

function loadFile(password) {
    // Create a hidden file input element element
    let input = xmk('input')
        .xAttr('type', 'file')
        .xAttr('value', 'unused.txt')
        .xAttr('accept', '.js,.txt,.text')
        .xStyle({display: 'none'})

    // Respond to the system dialogue changes.
    input.xAddEventListener('change', (event1)=> {
        const fileList = event1.target.files
        if (fileList.length === 1) {
            var file = fileList[0]
            const reader = new FileReader()
            reader.addEventListener('load', (event2) => {
                const text = event2.target.result
                let type = file.type ? file.type : '???'
                statusBlip(`loaded ${text.length} bytes from: "${file.name}" "<code>${type}</code>".`, 1500)
            })
            reader.readAsText(file)
            reader.onload = (event3) => {
                let content = event3.target.result
                //console.log('debug', content.slice(0,10))
                const filename = file.name
                loadFileContent(filename, password, content)
            }
        }
    })

    // TODO: figure out how to handle input type="file" cancel events.
    // was not able to see "focus" events or the cancel click event.
    // for now, use a timeout hack
    input.click()
    setTimeout( () => {
        //console.log('timeout: clean up')
        input.remove()
    }, 2000)
}

// Load the file content
function loadFileContent(filename, password, content) {
    window.prefs.fileName = filename
    document.body.xGet('#x-save-filename').value = filename
    document.body.xGet('#x-save-password').value = password
    let size = content.length
    if (content[0] === '{') {
        // This file is plain json, it is not encrypted
        statusBlip(`not encrypted ${filename} (${size}B)`, 1500)
        loadCallback(content)
    } else {
        statusBlip(`encrypted ${filename} (${size}B)`, 1500)
        decrypt(password, content, loadCallback)
    }
}

// Load the data.
function loadCallback(text) {
    if (!text || text.length === 0 ) {
        return
    }
    // at this point text will be a javascript string.
    let json = null
    try {
        json = JSON.parse(text)
    } catch(exc) {
        alert(`invalid record format!\n${exc}`)
        return
    }
    if (window.prefs.clearBeforeLoad) {
        clearRecords()
    }
    if ( 'prefs' in json) {
        if (json.prefs.logStatusToConsole) {
            window.prefs.logStatusToConsole = json.prefs.logStatusToConsole
        }
        window.prefs.passwordRangeLengthDefault = json.prefs.passwordRangeLengthDefault
        window.prefs.passwordRangeMinLength = json.prefs.passwordRangeMinLength
        window.prefs.passwordRangeMaxLength = json.prefs.passwordRangeMaxLength
        window.prefs.memorablePasswordWordSeparator = json.prefs.memorablePasswordWordSeparator
        window.prefs.memorablePasswordMinWordLength = json.prefs.memorablePasswordMinWordLength
        window.prefs.memorablePasswordMinWords = json.prefs.memorablePasswordMinWords
        window.prefs.memorablePasswordMaxWords = json.prefs.memorablePasswordMaxWords
        window.prefs.memorablePasswordMaxTries = json.prefs.memorablePasswordMaxTries
        window.prefs.clearBeforeLoad = json.prefs.clearBeforeLoad
        window.prefs.loadDupStrategy = json.prefs.loadDupStrategy
        let oldMenuPrefsDlg = document.body.xGet('#menuPrefsDlg')
        let newMenuPrefsDlg = menuPrefsDlg() // make the new menuPrefsDlg
        oldMenuPrefsDlg.replaceWith(newMenuPrefsDlg)
    }
    let warned = 0
    for (let i=0; i<json.records.length; i++) {
        let row = json.records[i]
        let title = row.title
        if (findRecord(title)) {
            switch (window.prefs.loadDupStrategy) {
            case 'ignore':
                // ignore the duplicate.
                continue
                break
            case 'replace':
                // replace the duplicate record with one just loaded.
                deleteRecord(title)
                break
            case 'allow':
                // allow duplicates to co-exist
                // generate a unique suffix for to the title.
                let provisional = title + ' Dup'
                let idx = 0
                while (findRecord(provisional)) {
                    idx++
                    provisional = `${title} Dup${idx}`
                }
                title = provisional
                break
            default:
                // clearBeforeLoad makes this unnecesary but it is optional.
                if (!warned) {
                    // only warn once
                    alert('WARNING! internal state error ' +
                          `invalid loadDupStrategy "${window.prefs.loadDupStrategy}"\n` +
                          'Duplicates will be ignored')
                }
                warned++
                continue
            }
        }
        //console.log(`row[${i}]: "${title}"`)
        let recordFields = []
        for (let j=0; j<row.fields.length; j++ ) {
            let field = row.fields[j]
            /*console.log(`  field[${j}]`)
            console.log(`    name: "${field.name}"`)
            console.log(`    type: "${field.type}"`)
            console.log(`    value: "${field.value}"`)*/
            recordFields.push( mkRecordField(field.name, field.type, field.value) )
        }
        let newRecord = mkRecord(title, ...recordFields)
        insertRecord(newRecord, title)
    }
}
