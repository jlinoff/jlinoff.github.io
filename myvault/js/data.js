// The data page
import { common } from '/myvault/js/common.js'
import { makeIcon, changeIcon } from '/myvault/js/icons.js'
import { hideMenu  } from '/myvault/js/header.js'
import { hideAll,
         xmake,
         makeInputXWrapper,
         makeTextButton,
         makeIconButton,
         getFieldType,
         isURL,
         statusMsg,
       } from '/myvault/js/utils.js'
import { expandAccordion,
         collapseAccordion,
         accordionPanelClass,
         accordionPanelImgClass,
         accordionPanelButtonClass,
         makeAccordionEntry,
         clickedAccordionButton,
         getAccordionPanelStyle } from '/myvault/js/accordion.js'
import { addRecord } from '/myvault/js/add.js'
import { editRecord } from '/myvault/js/edit.js'

var gridLabelStyle = {}
var gridValueStyle = {}
var gridButtonStyle = {}

export function showDataPage() {
    gridLabelStyle = common.themes._activeProp().records.gridLabelStyle
    gridValueStyle = common.themes._activeProp().records.gridValueStyle
    gridButtonStyle = common.themes._activeProp().records.gridButtonStyle
    showDataPageInternal('block')
}

export function showDataPageInternal(v) {
    hideAll()
    hideMenu()
    let top = document.getElementById('page-data')
    top.style.display = v
    top.xRemoveChildren()
    makeViewPage(top)
}

// make the record view page
function makeViewPage(top) {
    let accordion = xmake('center')
        .xId('x-data-content-id')
        .xAppendChild(
            xmake(common.themes._activeProp().header.subtitle.element)
                .xInnerHTML('Records Page'),
            xmake('div')
                .xAppendChild(
                    makeInputXWrapper(
                        xmake('input')
                            .xId('x-data-search')
                            .xAttr('type', 'input')
                            .xStyle(common.themes._activeProp().general.search)
                            .xStyle({
                                backgroundColor: common.themes._activeEntry().bgColor,
                                color: common.themes._activeEntry().fgColor,
                            })
                            .xAddClass('x-theme-element')
                            .xAttr('placeholder', 'search')
                            .xAttr('value', common.search.cache)
                            .xTooltip('enter regular expression to search for matching records')
                            .xAddEventListener('click', e => updateSearch(e))
                            .xAddEventListener('input', e => updateSearch(e))
                            .xAddEventListener('paste', e => updateSearch(e))
                            .xAddEventListener('change', e => updateSearch(e)))
                ),
            xmake('div').xStyle({height: '10px'}),
            xmake('button')
                .xStyle({backgroundColor: common.themes._activeEntry().bgColor, color: common.themes._activeEntry().fgColor, marginBottom: '8px'})
                .xAddClass('x-theme-element')
                .xAppendChild(makeIcon(common.icons.expand, 'expand'))
                .xTooltip('expand accordion panels')
                .xAddEventListener('click', () => expandAccordion(top)),
            xmake('button')
                .xStyle({backgroundColor: common.themes._activeEntry().bgColor, color: common.themes._activeEntry().fgColor, marginBottom: '8px'})
                .xAddClass('x-theme-element')
                .xAppendChild(makeIcon(common.icons.collapse, 'collapse'))
                .xTooltip('collapse accordion panels')
                .xAddEventListener('click', () => {
                    collapseAccordion(top)
                }),
            xmake('button')
                .xStyle(
                    {
                        backgroundColor: common.themes._activeEntry().bgColor,
                        color: common.themes._activeEntry().fgColor,
                        marginLeft: '5px'})
                .xAddClass('x-theme-element')
                .xTooltip('create and insert new record')
                .xId('x-data-create-button')
                .xAddEventListener('click', (e) => {
                    addRecord(e, 'Add Record Page')
                })
                .xAppendChild(makeIcon(common.icons.plus, 'insert')),
            xmake('span')
                .xStyle({marginLeft: '5px'})
                .xId('x-records-length')
                .xInnerHTML(getNumVisibleRecs()),
        )
    top.xAppendChild(accordion)
    makeRecordEntries(accordion)
}

// make the record entries
function makeRecordEntries(accordion) {
    let did = 'x-data-records-div'
    let accordionDiv = document.getElementById(did)
    if (accordionDiv) {
        // Remove all previous instances.
        accordionDiv.remove()
    }
    accordionDiv = xmake('div')
        .xId(did)

    if ( getNumVisibleRecs() === 0) {
        if (common.data.records.length) {
            accordionDiv.xAppendChild(
                xmake('p')
                    .xStyle(common.themes._activeProp().text)
                    .xInnerHTML(`
No records found out of ${common.data.records.length} available. <br>
Please update the search term.`))
        } else {
            accordionDiv.xAppendChild(
                xmake('p')
                    .xStyle(common.themes._activeProp().text)
                    .xInnerHTML(`
No records found. <br>
Please load records or create the records manually by clicking the "plus" button above.
`))
        }
        accordion.xAppendChild(accordionDiv)
        return
    }

    // sort records before preesenting them.
    // This logic assumes a small number of records (<1000)
    // Could add a semaphore so that we only sort when the records change
    // if performance becomes a problem
    common.data.records.sort((a,b) => {
        var xa = a.__id__.toLowerCase()
        var xb = b.__id__.toLowerCase()
        return xa.localeCompare(xb)
    })

    let regexp = getSearchRegexp() // for search filtering
    if (accordionDiv) {
        // Remove all previous instances.
        accordionDiv.remove()
    }

    // create each entry
    for(let i=0; i<common.data.records.length; i++) {
        let rec = common.data.records[i]
        let text = JSON.stringify(rec,null,4)
        let rid = rec.__id__ // the accordion entry title is the record __id__
        let xid = 'x-record-view-container-' + i

        // filter by id
        if (!rid.match(regexp)) {
            continue
        }

        let div = xmake('div')
            .xStyle(common.themes._activeProp().records.gridContainer)
            .xId(xid)

        // Create the key/value fields
        let idx = 0
        for(const key of Object.keys(rec)) {
            let value = rec[key]
            idx += 1
            if ( key === '__id__' ) { // skip the title
                continue
            }
            makeRecordViewEntry(i, idx, div, key, value)
        }

        // Add the edit/trash buttons at the bottom.
        div.xAppendChild(
            xmake('div')
                .xStyle({
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gridColumn: '1 / -1',  // span
                })
                .xAppendChild(
                    makeIconButton('edit the record',
                                   'Edit',
                                   common.icons.pencil,
                                   (e) => { // jshint ignore:line
                                       editRecord(xid, i, common.data.records[i]) // jshint ignore:line
                                   }),
                    xmake('span').xStyle({width: '10px'}),
                    makeIconButton('delete the record',
                                   'Delete',
                                   common.icons.trash,
                                   (e) => { // jshint ignore:line
                                       common.data.records.splice(i, 1) // jshint ignore:line
                                       showDataPage()
                                   }),
                )
        )

        // Make the accordion entry.
        let elem = makeAccordionEntry(rid, div,
                                      () => {}, // panel expand action here
                                      () => {}) // panel collapse action here
        accordionDiv.xAppendChild(elem)
    }
    accordion.xAppendChild(accordionDiv)
    document.getElementById('x-records-length').innerHTML = getNumVisibleRecs()
}

// get the regex for the search constraints
function getSearchRegexp() {
    let e = document.getElementById('x-data-search')
    let filterString = ''
    let regexp = null
    if (e) {
        filterString = e.value.trim()
    }
    if (filterString.length === 0) {
        filterString = '.'
    }
    try {
        regexp = new RegExp(filterString, 'i')
    } catch (exc) {
        alert(`invalid search expresion: "${filterString}"\nregexp:${exc}`)
        return RegExp('.', 'i')
    }
    return regexp
}

// Get the number of visible records
function getNumVisibleRecs() {
    let regexp = getSearchRegexp()
    let numrecs = 0
    for(let i=0; i<common.data.records.length; i++) {
        let rec = common.data.records[i]
        let rid = rec.__id__ // the accordion entry title is the record __id__
        if (rid.match(regexp)) {
            numrecs++
        }
    }
    return numrecs
}

// make record entry
function makeRecordViewEntry(ridx, idx, div, key, value) {
    // TODO: add copy to clipboard function add password capability
    let pid = 'x-data-record-password-key-' + ridx + '-' + idx
    let ftype = getFieldType(key)
    if (ftype === 'string') {
        // check for the special case where the value is a URL
        if (isURL(value)) {
            ftype = 'url'
        }
    }
    let label = xmake('div')
            .xStyle(gridLabelStyle)
            .xAppendChild(
                xmake('div')
                    .xStyle({
                        top: '0',
                        textAlign: 'right',
                        backgroundColor: common.themes._activeEntry().bgColor,
                        color: common.themes._activeEntry().fgColor,
                    })
                    .xAddClass('x-theme-element')
                    .xInnerHTML(key))

    let vobj = null
    let vstyle = {
        overflow: 'scroll',
        width: '100%',
        backgroundColor: common.themes._activeEntry().bgColor,
        color: common.themes._activeEntry().fgColor,
    }

    switch(ftype) {
    case 'textarea':
        let numrows = 2 + value.split('\n').length
        vobj =  xmake('div')
            .xStyle(gridValueStyle)
            .xAppendChild(
                xmake('textarea')
                    .xStyle(vstyle)
                    .xStyle({
                        rows: `${ numrows }`,
                        height: `${ numrows }em`,
                    })
                    .xAttr('placeholder', 'field '+ key + ' value')
                    .xAttr('readonly', true)
                    .xAddClass('x-theme-element')
                    .xInnerHTML(value))
        break
    case'password':
        vobj =  xmake('div')
            .xStyle(gridValueStyle)
            .xAppendChild(
                xmake('input')
                    .xStyle(vstyle)
                    .xAttr('placeholder', 'field '+ key + ' value')
                    .xAttr('type', 'password')
                    .xAttr('value', value)
                    .xAttr('readonly', true)
                    .xId(pid)
                    .xAddClass('x-theme-element'))
        break
    case 'url':
        vobj =  xmake('div')
            .xStyle(gridValueStyle)
            .xAppendChild(
                xmake('a')
                    .xStyle(vstyle)
                    .xStyle(common.themes._activeProp().records.gridUrlAdjustment)
                    .xAddClass('x-theme-element')
                    .xAttr('href', value)
                    .xAttr('target', '_blank')
                    .xInnerHTML(value))
        break
    case 'string':
    default:
        vobj =  xmake('div')
            .xStyle(gridValueStyle)
            .xAppendChild(
                xmake('span')
                    .xStyle(vstyle)
                    .xAddClass('x-theme-element')
                    .xInnerHTML(value))

    }

    let buttons = xmake('div').xStyle(gridButtonStyle)

    if ( ftype === 'password') { // append the eye/eyeBlocked
        buttons.xAppendChild(
            xmake('button')
                .xStyle({
                    backgroundColor: common.themes._activeEntry().bgColor,
                    color: common.themes._activeEntry().fgColor,
                    marginLeft: '5px',
                })
                .xAddClass('x-theme-element')
                .xAddEventListener('click', (event) => {
                    let button = event.currentTarget
                    let img = button.getElementsByTagName('img')[0]
                    let pp = event.currentTarget.parentNode.parentNode
                    let input = pp.getElementsByTagName('input')[0] // get the password input
                    if (input.type === 'text') {
                        input.type = 'password'
                        changeIcon(img, common.icons.eyeBlocked)
                    } else {
                        input.type = 'input'
                        changeIcon(img, common.icons.eye)
                    }
                })
                .xTooltip(`click to show/hide ${ key }`)
                .xAppendChild(makeIcon(common.icons.eyeBlocked, 'show')))
    }

    buttons.xAppendChild(
        xmake('button')
            .xStyle({
                backgroundColor: common.themes._activeEntry().bgColor,
                color: common.themes._activeEntry().fgColor,
                marginLeft: '5px',
            })
            .xAddClass('x-theme-element')
            .xAddEventListener('click', e => {
                statusMsg(`copied ${value.length} bytes to the clipboard`)
                navigator.clipboard.writeText(value).then((value) => {}, () => {
                    alert('internal error: paste to clipboard operation failed')})
            })
            .xTooltip(`paste ${ key } to clipboard for pasting to external applications`)
            .xAppendChild(makeIcon(common.icons.copy, 'copy')))

    // assemble the field
    div.xAppendChild(label, vobj, buttons)
}


function updateSearch(event) {
    let accordion = document.getElementById('x-data-content-id')
    makeRecordEntries(accordion)
}
