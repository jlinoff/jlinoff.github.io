import { common } from '/js/common.js'
import { xmake,
         makeTextButton,
         makeIconButton,
         getFieldType,
         isURL,
         deepCopyObject,
         makeInputXWrapper,
       } from '/js/utils.js'
import { makePasswordEntryWithId } from '/js/password.js'
import { showDataPage } from '/js/data.js'  // TODO: hate this circular dependency
import { fieldNameHandler } from '/js/add.js'  // TODO: hate this circular dependency

var gridLabelStyle = {}
var gridValueStyle = {}
var gridButtonStyle = {}

// Create the edit entries
export function editRecord(xid, idx, inrec) {
    let rec = deepCopyObject(inrec)
    let mid = xid + '-edit'
    let view = document.getElementById(xid)
    let eid = 'x-data-field-edit-container'
    view.xStyle({display: 'none'})
    gridLabelStyle = common.themes._activeProp().records.gridLabelStyle
    gridValueStyle = common.themes._activeProp().records.gridValueStyle
    gridButtonStyle = common.themes._activeProp().records.gridButtonStyle

    // Add the initial fields. Provide enough entries for all templates.
    let top = document.getElementById(mid)
    if (top) {
        top.remove()
    }

    let fieldsContainer = xmake('div').xId(eid)
    let numFields = Object.keys(rec).length
    for(let fid=0; fid<numFields; fid++) {
        fieldsContainer.xAppendChild(createField(numFields, xid, idx, fid, rec))
    }

    let p = view.parentNode
    p.xAppendChild(
        xmake('div')
            .xId(mid)
            .xAppendChild(
                fieldsContainer,
                xmake('div').xStyle({
                    height: '5px',
                }),
                makeTextButton('Save the changes',
                               'Save',
                               (e) => {
                                   saveData(view, mid, idx)
                                   cleanup(view, mid)
                               }),
                makeTextButton('Revert the changes back to the original contents',
                               'Revert',
                               (e) => {
                                   cleanup(view, mid)
                               }),
                makeTextButton('add field - the field type changes based on the field name, eg "password" -> password field or "notes" -> note field',
                               'Add Field',
                               (e) => {
                                   // Add a new field with no value.
                                   // This must be done to make it visible in editRecord
                                   let nrec = makeRecordFromDomFields()
                                   let kid = 'new field name' + numFields
                                   nrec[kid] = ''
                                   editRecord(xid, idx, nrec)
                               }),
                xmake('div').xStyle({height: '5px'}),
            )
    )
}

// make the record from the DOM fields
function makeRecordFromDomFields() {
    let rec = {}
    //let drec = common.data.records[idx]
    //let numFields = Object.keys(drec).length
    // scan for all possible input values
    for(let fid=0; fid<common.data.maxFields; fid++) {
        let kid = 'x-data-field-key-' + fid
        let vid = 'x-data-field-value-'+ fid
        let kobj =  document.getElementById(kid)
        let vobj = document.getElementById(vid)
        if (!kobj || !vobj) {
            continue
        }
        let key = kobj.value.trim()
        let val =  vobj.value.trim()
        if (!key || !val) {
            continue
        }
        rec[key] = val
    }

    return rec
 }

// save the data
// handle the case where the title changes
// by redisplaying the records.u
function saveData(view, mid, idx) {
    let rec = makeRecordFromDomFields()
    if (common.data.records[idx] !== rec.__id__) {
        // Sort becausee the __id__ changed.
        common.data.records.sort((a,b) => {
            var xa = a.__id__.toLowerCase()
            var xb = b.__id__.toLowerCase()
            return xa.localeCompare(xb)
        })
    }
    common.data.records[idx] = rec
    common.data.mtime = new Date().toISOString()
    showDataPage()

}

// common cleanup - get rid of the temporary edit fields.
function cleanup(view, mid) {
    view.xStyle({display: 'grid'})
    let m = document.getElementById(mid)
    if (m) {
        m.remove()
    }
}

// Create an edit field (key and value)
function createField(numFields, xid, idx, fid, rec) {
    let kid = 'x-data-field-key-' + fid
    let vid = 'x-data-field-value-'+ fid
    let kcls = 'x-data-field-key-element'
    let vcls = 'x-data-field-value-element'
    let fkey = Object.keys(rec)[fid]
    let fname = fkey
    let fvalue = rec[fkey] || ''
    let ftype = getFieldType(fkey)
    let key = xmake('div')
        .xStyle(gridLabelStyle)
        .xAppendChild(
            makeInputXWrapper(
                xmake('input')
                    .xStyle({
                        backgroundColor: common.themes._activeEntry().bgColor,
                        color: common.themes._activeEntry().fgColor,
                    })
                    .xId(kid)
                    .xAttr('placeholder', 'field '+ fid + ' name')
                    .xAttr('value', fkey)
                    .xAddClass('x-theme-element')
                    .xAddClass(kcls)
                    .xAddEventListener('click', (e) => {fieldNameHandler(e.target.value,fid)} )
                    .xAddEventListener('input', (e) => {fieldNameHandler(e.target.value,fid)} )
                    .xAddEventListener('paste',  (e) => {fieldNameHandler(e.target.value,fid)} )
                    .xAddEventListener('change', (e) => {fieldNameHandler(e.target.value,fid)} ),
            ).xAddClass('x-vertical-center')
        )

    // TODO: change based on field type
    let valdiv =  xmake('div').xStyle(gridValueStyle)
    let placeholder = `${fkey} value`
    let val = null
    switch(ftype) {
    case 'textarea':
        let numrows = 1 + fvalue.split('\n').length
        valdiv.xAppendChild(
                xmake('textarea')
                    .xStyle({
                        fontFamily: 'monospace',
                        backgroundColor: common.themes._activeEntry().bgColor,
                        color: common.themes._activeEntry().fgColor,
                        width: '100%'})
                     .xAttr('placeholder', placeholder)
                    .xAttr('rows', numrows)
                    .xInnerHTML(fvalue)
                    .xId(vid)
                    .xAddClass(vcls)
                    .xAddClass('x-theme-element')
                    .xInnerHTML(fvalue))
        break
    case 'password':
        valdiv.xAppendChild(
            makePasswordEntryWithId(vid, vcls, `${fkey} value`, fvalue))
        break
    default: // string
        let vstyle = {
            overflow: 'scroll',
            width: '90%',
            backgroundColor: common.themes._activeEntry().bgColor,
            color: common.themes._activeEntry().fgColor,
        }
        valdiv.xAppendChild(
            (
                makeInputXWrapper(
                    xmake('input')
                        .xStyle(common.themes._activeProp().general.input)
                        .xStyle(vstyle)
                        .xAttr('placeholder', placeholder)
                        .xId(vid)
                        .xAttr('value', fvalue)
                        .xAddClass('x-theme-element')
                        .xAddClass(vcls)
                        .xAddEventListener()
                )))
        break
    }

    let buttons = xmake('div').xStyle(gridButtonStyle)

    if (fid > 1) { // can't go up at the top
        buttons.appendChild(
            makeIconButton(`move ${fkey } up`,
                           'up',
                           common.icons.arrowUpThin,
                           (e) => {
                               // move field up one slot
                               let i = fid
                               let j = i - 1
                               let nrec = swapFields(i, j, rec)
                               editRecord(xid, idx, nrec)
                           }))
    }

    if ( fid < (numFields - 1 )) { // can't go down at the bottom
        buttons.appendChild(
            makeIconButton(`move ${fkey } down`,
                           'down',
                           common.icons.arrowDownThin,
                           (e) => {
                               // move field down one slot
                               let i = fid
                               let j = i + 1
                               let nrec = swapFields(i, j, rec)
                               editRecord(xid, idx, nrec)
                           }))
    }
    if (fkey !== '__id__') {
        // cannot delete the field id
        buttons.appendChild(
            makeIconButton(`remove ${ fkey }`,
                           'trash',
                           common.icons.trash,
                           (e) => {
                               delete rec[fkey]
                               editRecord(xid, idx, rec)
                           }))

    } else {
        buttons = xmake('div').xStyle(gridButtonStyle).xInnerHTML('&nbsp;')
    }

    return xmake('div')
        .xStyle(common.themes._activeProp().records.gridContainer)
        .xAppendChild(key, valdiv, buttons)
}

// swap order of object fields.
function swapFields(i, j, rec) {
    let keys = Object.keys(rec)
    let tmp = keys[j]
    keys[j] = keys[i]
    keys[i] = tmp
    let nrec= {}
    keys.forEach( (k) => {nrec[k]= rec[k]})
    return nrec
}
