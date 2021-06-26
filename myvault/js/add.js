import { common } from '/js/common.js'
import { hideAll } from '/js/utils.js'
import { hideMenu  } from '/js/header.js'
import { makePasswordEntryWithId } from '/js/password.js'
import { xmake,
         makeInputXWrapper,
         makeTextButton,
         makeIconButton,
         getFieldType,
         isURL
       } from '/js/utils.js'
// do we really need both?
import { showDataPage, showDataPageInternal } from '/js/data.js' // TODO: hate this circular dependency

var gridLabelStyle = {}
var gridValueStyle = {}

// Define and create a new record.
export function addRecord(event, title) {
    hideAll()
    hideMenu()
    let top = document.getElementById('page-data')
    top.style.display = 'block'
    gridLabelStyle = common.themes._activeProp().records.gridLabelStyle
    gridValueStyle = common.themes._activeProp().records.gridValueStyle

    top.xRemoveChildren()
    let accordion = xmake('center')
        .xId('x-data-add-content-id')
            .xAppendChild(
                xmake(common.themes._activeProp().header.subtitle.element).xInnerHTML(title),
                xmake('div')
                    .xStyle({
                        height: '20px',
                        margin: '2px',
                    }),
                xmake('div')
                    .xStyle(common.themes._activeProp().records.gridContainer)
                    .xAppendChild(
                        xmake('label')
                            .xStyle(gridLabelStyle)
                            .xInnerHTML('&nbsp;'),
                        makeInputXWrapper(
                            xmake('input') // record id
                                .xStyle(gridValueStyle)
                                .xStyle(common.themes._activeProp().general.input)
                                .xStyle({
                                    backgroundColor: common.themes._activeEntry().bgColor,
                                    color: common.themes._activeEntry().fgColor,
                                    overflow: 'scroll',
                                    width: '90%',
                                })
                                .xAttr('placeholder', 'record id (required)')
                                .xId('x-data-add-rid')
                                .xAddClass('x-theme-element'))
                            .xStyle(gridValueStyle),
                    ),
            )

    // first get the maximum number of entries in the templates.
    let minFields = 0
    Object.keys(common.data.rfts.entries).forEach((key) => {
        let x = common.data.rfts.entries[key]
        minFields = Math.max(minFields, x.length)
    })

    // Add the initial fields. Provide enough entries for all templates.
    let fields = xmake('div').xId('x-data-field-container')
    for(let fid=1; fid<=minFields; fid++) {
        fields.xAppendChild(createField(fid))
    }

    accordion.xAppendChild(
        fields,
        xmake('div')
            .xStyle({marginTop: '10px'}),
        makeTextButton('Add another field to the record',
                       'Add Field',
                       (e) =>{
                           let fid = getLastFieldNumber() + 1
                           if (fid < common.data.maxFields) {
                               let c = document.getElementById('x-data-field-container')
                               c.xAppendChild(createField(fid))
                           } else {
                               alert('No more fields can be added.')
                           }
                       }),
        makeTextButton('create the record','Create',  (e) => {createRecord()}),
        makeTextButton('discard - do not add this record', 'Discard',
                       (e) => {showDataPage()}),
        createTemplateSelectBox(),
                xmake('p')
                    .xStyle(common.themes._activeProp().general.text)
                    .xInnerHTML(`
Create a record and add it to the existing records.
The templates are available to pre-define fields for common types of records.
Fields with no name entries are ignored.
If a field name contains the keywords: "password", "passphrase" or
"secret", the value is assumed to be password.  If a field name
contains the keywords: "note", "notes", "text' or "description", the
value is assumed to be multi-line text (a textarea).
A field is ignored if the name or the value is empty.
`),
    )
    top.xAppendChild(accordion)

    // Update based on the key/value getters.
    for(let fid=1; fid<=common.data.maxFields; fid++) {
        let kid =  'x-data-field-key-' + fid
        let e = document.getElementById(kid)
        if (e) {
            let rec = common.data.rfts.entries[common.data.rfts.current]
            let j = fid - 1
            if (j < rec.length) {
                e.value = rec[j]
            }
            fieldNameHandler(e.value, fid)
        }
    }
}

// Create a field (key and value)
function createField(fid) {
    let kid = 'x-data-field-key-' + fid
    let vid = 'x-data-field-value-'+ fid
    let kcls = 'x-data-field-key-element'
    let vcls = 'x-data-field-value-element'
    let key = xmake('div')
        .xStyle(gridLabelStyle)
        .xAppendChild(
            makeInputXWrapper(
                xmake('input')
                    .xStyle({
                        backgroundColor: common.themes._activeEntry().bgColor,
                        color: common.themes._activeEntry().fgColor,
                    })
                    .xAttr('placeholder', 'field '+ fid + ' name')
                    .xId(kid)
                    .xAddClass('x-theme-element')
                    .xAddClass(kcls)
                    .xAddEventListener('input', (e) => {fieldNameHandler(e.target.value,fid)} )
                    .xAddEventListener('paste',  (e) => {fieldNameHandler(e.target.value,fid)} )
                    .xAddEventListener('change', (e) => {fieldNameHandler(e.target.value,fid)} )))

    let vstyle = {
        overflow: 'scroll',
        width: '90%',
        backgroundColor: common.themes._activeEntry().bgColor,
        color: common.themes._activeEntry().fgColor,
    }
    let val =  xmake('div')
        .xStyle(gridValueStyle)
        .xAppendChild(
            makeInputXWrapper(
                xmake('input')
                    .xStyle(common.themes._activeProp().general.input)
                    .xStyle(vstyle)
                    .xAttr('placeholder', 'field ' + fid + ' value')
                    .xId(vid)
                    .xAddClass('x-theme-element')
                    .xAddClass(vcls)))

    return xmake('div')
        .xStyle(common.themes._activeProp().records.gridContainer)
        /*.xStyle({
            display: 'grid',
            gridTemplateColumns: 'max-content auto', // label value
            paddingTop: '10px'})*/
        .xAppendChild(key, val)
}

function createTemplateSelectBox() {
    let select = xmake('span')
    let tmpls = xmake('select').xId('x-data-templates')
            .xStyle(
                {
                    backgroundColor: common.themes._activeEntry().bgColor,
                    color: common.themes._activeEntry().fgColor,
                    marginLeft: '5px'})
        .xAddClass('x-theme-element')
        .xAddEventListener('change', (e) => {
            clearFields('x-data-field-key-element');
            common.data.rfts.current = e.target.value
            showDataPageInternal('none')
            setTimeout( () => {document.getElementById('x-data-create-button').click()}, 100)
        })
    for (const key of Object.keys(common.data.rfts.entries)) {
        let opt = xmake('option').xAttr('value', key).xAttr('text', key).xInnerHTML(key)
        if (key === common.data.rfts.current) {
            opt.xAttr('selected', true)
        }
        tmpls.xAppendChild(opt)
    }
    select.xAppendChild(
        xmake('label')
            .xStyle(
                {
                    fontSize: common.themes._activeProp().general.textButton.fontSize,
                    marginLeft: '5px',
                })
            .xAddClass('x-theme-element')
            .xAttr('htmlFor', 'x-data-templates')
            .xInnerHTML('Template: '),
        tmpls,
    )
    return select
}

// This function changes the type of the fname input element based on type defined by the field name.
// For example a field named "password" would change the fname input element type to a password input element.
// A field named "text" would change the fname input element type to a textarea element.
export function fieldNameHandler(fname, fid) {
    let vcls = 'x-data-field-value-element'
    let vid = 'x-data-field-value-' + fid
    let vpid = vid + '-parent'
    let ftype = getFieldType(fname)
    let e = document.getElementById(vid)
    let oldval = e.value
    let placeholder = `field ${ fid } value`
    if (e.tagName === 'TEXTAREA') {
        oldval = e.innerHTML
    }

    if (ftype === 'password' ) {
        if (e.tagName === 'TEXTAREA') {
            let p = e.parentNode
            e.remove()
            p.appendChild(
                xmake('div')
                    .xStyle({
                        marginLeft: '-7px',
                        padding: '2px'})
                    .xAppendChild(
                        makePasswordEntryWithId(vid, vcls, placeholder, '')
                    ))
        } else if (e.type.toLowerCase() === 'text') {
            e = e.parentNode
            let p = e.parentNode
            e.remove()
            p.appendChild(
                xmake('div')
                    .xStyle({
                        marginLeft: '-7px',
                        padding: '2px'})
                    .xId(vpid)
                    .xAppendChild(
                        makePasswordEntryWithId(vid, vcls, placeholder, oldval)
                    ))
        }
    } else if (ftype === 'textarea') {
        if (e.tagName === 'INPUT') {
            // change input to text area
            e = e.parentNode
            let p = e.parentNode
            if (p.parentNode.id === vpid) {
                e = p
                p = p.parentNode
            }
            e.remove()
            p.appendChild(
                xmake('textarea')
                    .xStyle({
                        backgroundColor: common.themes._activeEntry().bgColor,
                        color: common.themes._activeEntry().fgColor,
                    })
                    .xStyle(common.themes._activeProp().general.textarea)
                    .xAttr('placeholder', placeholder)
                    .xInnerHTML(oldval)
                    .xId(vid)
                    .xAddClass(vcls)
                    .xAddClass('x-theme-element'))
        }
    } else if (ftype === 'string') {
        let p = null
        if (e.type.toLowerCase() === 'password') {
            p = e.parentNode.parentNode
            if (p.parentNode.id === vpid) {
                // password is a special case
                e = p.parentNode
                p = e.parentNode
            } else {
                p = null
            }
        } else if (e.tagName === 'TEXTAREA') {
                p = e.parentNode
        }
        if (p !== null) {
            e.remove()
            p.appendChild(
                makeInputXWrapper(
                    xmake('input')
                        .xStyle(common.themes._activeProp().general.input)
                        .xStyle({
                            backgroundColor: common.themes._activeEntry().bgColor,
                            color: common.themes._activeEntry().fgColor,
                        })
                        .xAttr('placeholder', placeholder)
                        .xAttr('type', 'input')
                        .xAttr('value', oldval)
                        .xId(vid)
                        .xAddClass(vcls)
                        .xAddClass('x-theme-element'))
            )
        }
    }
}

function clearFields(id) {
    for (const obj of document.getElementsByClassName(id)) {
        if (obj.tagName === 'TEXTAREA') {
            obj.innerHTML = ''
        } else if (obj.tagName === 'INPUT') {
            obj.value = ''
        }
    }
}

// get the last field number defined
function getLastFieldNumber() {
    let m = 0
    let kcls = 'x-data-field-key-element'
    for (const obj of document.getElementsByClassName(kcls)) {
        let a = obj.id.split('-')
        let e = a[a.length - 1]
        m = Math.max(m, e)
    }
    return m
}

// Create a new record.
function createRecord() {
    let kcls = 'x-data-field-key-element'
    let vcls = 'x-data-field-value-element'
    let ks = {}
    let vs = {}
    for (const obj of document.getElementsByClassName(kcls)) {
        let a = obj.id.split('-')
        let idx = a[a.length - 1]
        if (obj.value) {
           ks[idx] = obj.value
        }
    }
    for (const obj of document.getElementsByClassName(vcls)) {
        let a = obj.id.split('-')
        let idx = a[a.length - 1]
        vs[idx] = obj.value
    }
    let rec = {}
    for(const idx of Object.keys(ks)) {
        if (idx in vs) {
            let k = ks[idx]
            let v = vs[idx]
            rec[k] = v
        }
    }

    if (!Object.keys(rec).length) {
        alert('No valid data. Cannot create the record.')
        return
    }

    let rid = document.getElementById('x-data-add-rid').value.trim()
    if (!rid) {
        alert('The record id must be defined to create a record.')
        return
    }

    rec.__id__ = rid
        if (rid in common.data._map) {
        // overwriting existing data
        let ok = confirm('Replace existing record?')
        if (ok) {
            let idx = common.data._map[rid]
            common.data.records[idx] = rec
        }
    } else {
        let idx = common.data.records.length
        common.data.records.push(rec)
        common.data._map[rid] = idx
    }
    common.data.records.sort((a,b) => {
        let xa = a.__id__.toLowerCase()
        let xb = b.__id__.toLowerCase()
        return xa.localeCompare(xb)
    })
    common.data.mtime = new Date().toISOString()
    showDataPage()
}
