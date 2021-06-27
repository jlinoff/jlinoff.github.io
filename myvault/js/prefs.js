// The preferences page
import { common, displayTheme, TITLE, restoreCommon, resetCommon } from '/myvault/js/common.js'
import { themes } from '/myvault/js/themes.js'
import { makeIcon, changeIcon } from '/myvault/js/icons.js'
import { hideAll,
         makeIconButton,
         makeTextButton,
         xmake,
         statusMsg } from '/myvault/js/utils.js'
import { hideMenu, header  } from '/myvault/js/header.js'
import { makePasswordEntry } from '/myvault/js/password.js'
import { expandAccordion,
         collapseAccordion,
         accordionPanelClass,
         accordionPanelImgClass,
         accordionPanelButtonClass,
         makeAccordionEntry,
         clickedAccordionButton,
         getAccordionPanelStyle } from '/myvault/js/accordion.js'

var gridLabelStyle = {}
var gridValueStyle = {}

var prefsCenterDiv = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
}

export function showPrefsPage() {
    hideAll()
    hideMenu()
    let top = document.getElementById('page-prefs')
    top.style.display = 'block' //  display this page
    top.xRemoveChildren()

    gridLabelStyle = common.themes._activeProp().records.gridLabelStyle
    gridValueStyle = common.themes._activeProp().records.gridValueStyle

    // Make the algorithms accordion button.
    // Use radio butttons
    // The WASM must have at least one algorithm

    // create this page
    top.xAppendChild(
        xmake('center')
            .xId('x-prefs-content-id')
            .xAppendChild(
                xmake(common.themes._activeProp().header.subtitle.element)
                    .xInnerHTML('Preferences Page'),
                xmake('button')
                    .xStyle({backgroundColor: common.themes._activeColors().bgColor, color: common.themes._activeColors().fgColor, marginBottom: '8px'})
                    .xAddClass('x-theme-element')
                    .xAppendChild(makeIcon(common.icons.expand, 'expand'))
                    .xTooltip('expand accordion panels')
                    .xAddEventListener('click', () => expandAccordion(top)),
                xmake('button')
                    .xStyle({backgroundColor: common.themes._activeColors().bgColor, color: common.themes._activeColors().fgColor, marginBottom: '8px'})
                    .xAddClass('x-theme-element')
                    .xAppendChild(makeIcon(common.icons.collapse, 'collapse'))
                    .xTooltip('collapse accordion panels')
                    .xAddEventListener('click', () => collapseAccordion(top))),

        // Encryption Algorithm
        prefsMasterPassword(),
        prefsAlgorithm(),
        prefsThemes(),
        prefsThemeProps(),
        prefsRecordFieldTemplates(),
        prefsFieldType(),
        prefsIconColorFilter(),
        prefsTitle(),
        prefsReset(),
        prefsRawEdit())

    }

// algorithm
function prefsAlgorithm() {
    let num = common.crypt._wasm.get_num_algorithms()
    if (num === 0) {
        return xmake('span') // basically nothing
    }
    let ap = makeAccordionEntry(
        'Encryption Algorithm',
        xmake('div')
            .xStyle(common.themes._activeProp().accordion.panel)
            .xId('x-prefs-algorithm-div')
            .xAppendChild(
                xmake('p')
                    .xStyle(common.themes._activeProp().general.text)
                    .xInnerHTML('Choose the algorithm to use for encryption and decryption.'),
            ))
    let adiv = ap.lastChild //getElementById('x-prefs-algorithm-div')
    for(let i=0; i <num; i++) {
        let aname = common.crypt._wasm.get_algorithm(i)
        adiv.xAppendChild(
            xmake('input')
                .xAttr('type', 'radio')
                .xAttr('name', 'algorithm')
                .xAttrIfTrue('checked', 'checked', common.crypt.algorithm === aname)
                .xAttr('value', aname)
                .xAddEventListener('change', (e) => { common.crypt.algorithm = e.target.value } ), // jshint ignore:line
            xmake('label')
                .xAttr('for', aname)
                .xInnerHTML(aname),
            xmake('br'))
    }
    adiv.xAppendChild(xmake('br'))
    return ap
}

// manage themes
function prefsThemes() {
    let text = JSON.stringify(common.themes.colors, null, 4)
    let eid = 'x-prefs-themes-buffer'
    let eidlen = eid + '-length'
    let div =  makeAccordionEntry(
        'Theme Colors',
        xmake('div')
            .xStyle(common.themes._activeProp().accordion.panel)
            .xAppendChild(
                xmake('p').xStyle(common.themes._activeProp().general.text)
                    .xInnerHTML(`
Set or customize the theme background and foreground colors that you want to use.
The colors can be specified as name: "red" or a hex value "#0000ff".
`),
                makeThemeEntrySelectBox(),
                xmake('br'),
                xmake('textarea')
                    .xStyle({
                        backgroundColor: common.themes._activeColors().bgColor,
                        color: common.themes._activeColors().fgColor,
                        marginTop: '5px',
                    })
                    .xStyle(common.themes._activeProp().general.textarea)
                    .xAddClass('x-theme-element')
                    .xAttr('rows', '10')
                    .xAttr('placeholder', 'theme definitions')
                    .xId(eid)
                    .xInnerHTML(text),
                xmake('br'),
                xmake('div')
                    .xStyle({marginTop: '5px'})
                    .xAppendChild(
                        makeIconButton('copy to clipboard', 'copy', common.icons.copy, () => {
                            let text = document.getElementById(eid).value
                            navigator.clipboard.writeText(text).then((text) => {}, () => {
                                alert('internal error: paste to clipboard operation failed')})
                        }),
                        makeIconButton('save', 'save', common.icons.pencil, () => {
                            let text = document.getElementById(eid).value
                            let rec = null
                            try {
                                rec = JSON.parse(text)
                            } catch(e) {
                                alert(`cannot save, invalid JSON\nerror: ${ e }`)
                                return
                            }
                            common.themes.colors = rec
                            displayTheme()
                            header()
                            showPrefsPage()
                        }),
                        xmake('span')
                            .xId(eidlen)
                            .xInnerHTML(text ? text.length : '?'),
                        xmake('div').xStyle({marginTop: '10px'}).xInnerHTML(' ')
                    )
            )
    )
    return div
}

// manage themes
function prefsThemeProps() {
    let text = JSON.stringify(common.themes.props, null, 4)
    let eid = 'x-prefs-themes-props-buffer'
    let eidlen = eid + '-length'
    let div =  makeAccordionEntry(
        'Theme Properties',
        xmake('div')
            .xStyle(common.themes._activeProp().accordion.panel)
            .xAppendChild(
                xmake('p').xStyle(common.themes._activeProp().general.text)
                    .xInnerHTML(`
Set or customize the theme properties.
THe properties are font sizes, icon sizes, layout information and spacing.
This information is used internally by the webapp for dynamic styling.
Basically everything but the color scheme.
It is not user friendly because it requires knowledge of the internal implementation.
`),
                makeThemePropsSelectBox(),
                xmake('br'),
                xmake('textarea')
                    .xStyle({
                        backgroundColor: common.themes._activeColors().bgColor,
                        color: common.themes._activeColors().fgColor,
                        marginTop: '5px',
                    })
                    .xStyle(common.themes._activeProp().general.textarea)
                    .xAddClass('x-theme-element')
                    .xAttr('rows', '10')
                    .xAttr('placeholder', 'theme definitions')
                    .xId(eid)
                    .xInnerHTML(text),
                xmake('br'),
                xmake('div')
                    .xStyle({marginTop: '5px'})
                    .xAppendChild(
                        makeIconButton('copy to clipboard', 'copy', common.icons.copy, () => {
                            let text = document.getElementById(eid).value
                            navigator.clipboard.writeText(text).then((text) => {}, () => {
                                alert('internal error: paste to clipboard operation failed')})
                        }),
                        makeIconButton('save', 'save', common.icons.pencil, () => {
                            let text = document.getElementById(eid).value
                            let rec = null
                            try {
                                rec = JSON.parse(text)
                            } catch(e) {
                                alert(`cannot save, invalid JSON\nerror: ${ e }`)
                                return
                            }
                            common.themes.props = rec
                            displayTheme()
                            header()
                            showPrefsPage()
                        }),
                        xmake('span')
                            .xId(eidlen)
                            .xInnerHTML(text ? text.length : '?'),
                        xmake('div').xStyle({marginTop: '10px'}).xInnerHTML(' ')
                    )
            )
    )
    return div
}

// create the selection box.
function makeThemeEntrySelectBox() {
    let sid = 'x-prefs-themes-select'
    let eid = sid + '-entry'
    let select = xmake('span')
    let entries = xmake('select').xId(sid)
        .xStyle(
            {
                backgroundColor: common.themes._activeColors().bgColor,
                color: common.themes._activeColors().fgColor,
                marginLeft: '5px'})
        .xAddClass('x-theme-element')
        .xAddEventListener('change', (e) => {
            common.themes.active.entry = e.target.value
            displayTheme()
            header()
            showPrefsPage()
        })

    for (const key of Object.keys(common.themes.colors)) {
        let opt = xmake('option').xAttr('value', key).xAttr('text', key).xInnerHTML(key)
        if (key === common.themes.active.entry) {
            opt.xAttr('selected', true)
        }
        entries.xAppendChild(opt)
    }

    select.xAppendChild(
        xmake('label')
            .xStyle(
                {
                    backgroundColor: common.themes._activeColors().bgColor,
                    color: common.themes._activeColors().fgColor,
                    marginLeft: '5px'})
            .xAddClass('x-theme-element')
            .xAttr('htmlFor', 'sid')
            .xInnerHTML('Choose Active Themes'),
        entries,
    )
    return select
}

// create theme props  selection box.
function makeThemePropsSelectBox() {
    let sid = 'x-prefs-theme-propss-select'
    let eid = sid + '-entry'
    let select = xmake('span')
    let entries = xmake('select').xId(sid)
        .xStyle(
            {
                backgroundColor: common.themes._activeColors().bgColor,
                color: common.themes._activeColors().fgColor,
                marginLeft: '5px'})
        .xAddClass('x-theme-element')
        .xAddEventListener('change', (e) => {
            common.themes.active.prop = e.target.value
            displayTheme()
            header()
            showPrefsPage()
        })

    for (const key of Object.keys(common.themes.props)) {
        let opt = xmake('option').xAttr('value', key).xAttr('text', key).xInnerHTML(key)
        if (key === common.themes.active.prop) {
            opt.xAttr('selected', true)
        }
        entries.xAppendChild(opt)
    }

    select.xAppendChild(
        xmake('label')
            .xStyle(
                {
                    backgroundColor: common.themes._activeColors().bgColor,
                    color: common.themes._activeColors().fgColor,
                    marginLeft: '5px'})
            .xAddClass('x-theme-element')
            .xAttr('htmlFor', 'sid')
            .xInnerHTML('Choose Active Props'),
        entries,
    )
    return select
}

// record field templates
function prefsRecordFieldTemplates() {
    let text = JSON.stringify(common.data.rfts, null, 4)
    let eid = 'x-prefs-rtfs-buffer'
    let eidlen = eid + '-length'
    return makeAccordionEntry(
        'Record Field Templates',
        xmake('div')
        .xStyle(common.themes._activeProp().accordion.panel)
            .xAppendChild(
                xmake('p').xStyle(common.themes._activeProp().general.text)
                    .xInnerHTML(`
Define custom record field templates. These provide a way to quickly define common record fields.
Please use all caps and numbers for the template names to guarantee that internal processing works.
`),
                xmake('textarea')
                    .xStyle({
                        backgroundColor: common.themes._activeColors().bgColor,
                        color: common.themes._activeColors().fgColor,
                        marginTop: '5px',
                    })
                    .xStyle(common.themes._activeProp().general.textarea)
                    .xAddClass('x-theme-element')
                    .xAttr('rows', '10')
                    .xAttr('placeholder', 'record field templates JSON')
                    .xId(eid)
                    .xInnerHTML(text),
                xmake('br'),
                xmake('div')
                    .xStyle({marginTop: '5px'})
                    .xAppendChild(
                        makeIconButton('copy to clipboard', 'copy', common.icons.copy, () => {
                            let text = document.getElementById(eid).value
                            navigator.clipboard.writeText(text).then((text) => {}, () => {
                                alert('internal error: paste to clipboard operation failed')})
                        }),
                        makeIconButton('save', 'save', common.icons.pencil, () => {
                            let text = document.getElementById(eid).value
                            let rec = null
                            try {
                                rec = JSON.parse(text)
                            } catch(e) {
                                alert(`cannot save, invalid JSON\nerror: ${ e }`)
                                return
                            }
                            common.data.rfts = rec
                        }),
                        xmake('span')
                            .xId(eidlen)
                            .xInnerHTML(text ? text.length : '?')))
    )
    return  makeAccordionEntry(title, kvpairs)
}

function prefsFieldType() {
    let text = JSON.stringify(common.ftype, null, 4) || '[]'
    let eid = 'x-prefs-ftype-buffer'
    let eidlen = eid + '-length'
    return makeAccordionEntry(
        'Record Field Name Value Type Map',
        xmake('div')
        .xStyle(common.themes._activeProp().accordion.panel)
            .xAppendChild(
                xmake('p').xStyle(common.themes._activeProp().general.text)
                    .xInnerHTML(`
Define custom record field name value type map. These change the value types
based on the field named.  For example a field named "passphrase" will
create a password field. The valid types are string, password and
textarea. The rex values are interpreted as case insensitive regular
expresssions.
`),
                xmake('br'),
                xmake('textarea')
                    .xStyle(
                        {
                            display: 'grid',
                            gridTemplateColumns: 'max-content auto', // label value
                            backgroundColor: common.themes._activeColors().bgColor,
                            color: common.themes._activeColors().fgColor,
                            marginTop: '5px',
                        })
                    .xStyle(common.themes._activeProp().general.textarea)
                    .xAddClass('x-theme-element')
                    .xAttr('rows', '10')
                    .xAttr('placeholder', 'record field templates JSON')
                    .xId(eid)
                    .xInnerHTML(text),
                xmake('br'),
                xmake('div')
                    .xStyle({marginTop: '5px'})
                    .xAppendChild(
                        makeIconButton('copy to clipboard', 'copy', common.icons.copy, () => {
                            let text = document.getElementById(eid).value
                            navigator.clipboard.writeText(text).then((text) => {}, () => {
                                alert('internal error: paste to clipboard operation failed')})
                        }),
                        makeIconButton('save', 'save', common.icons.pencil, () => {
                            let text = document.getElementById(eid).value
                            let rec = null
                            try {
                                rec = JSON.parse(text)
                            } catch(e) {
                                alert(`cannot save, invalid JSON\nerror: ${ e }`)
                                return
                            }
                            common.data.rfts = rec
                        }),
                        xmake('span')
                            .xId(eidlen)
                            .xInnerHTML(text.length)))
    )
    return  makeAccordionEntry(title, kvpairs)
}

// manage icon color filer discovery
function prefsIconColorFilter() {
    let text = JSON.stringify(common.iconFillColorFilter, null, 4)
    let eid = 'x-prefs-icon-color-filter-buffer'
    let eidlen = eid + '-length'
    let div =  makeAccordionEntry(
        'Icon Fill Color Filter Algorithm Settings',
        xmake('div')
            .xStyle(common.themes._activeProp().accordion.panel)
            .xAppendChild(
                xmake('p').xStyle(common.themes._activeProp().general.text)
                    .xInnerHTML(`
Set the parameters for discovering the color filter for the SVG icon fill valus.
Note that this assumes that the fill color is #000000 (black).
maxTries is the maximum number of iterations to try before giving up.
maxLoss is the maximum acceptable loss and cache is the cache of already
processessed colors.
`),
                xmake('br'),
                xmake('textarea')
                    .xStyle({
                        backgroundColor: common.themes._activeColors().bgColor,
                        color: common.themes._activeColors().fgColor,
                        marginTop: '5px',
                    })
                    .xStyle(common.themes._activeProp().general.textarea)
                    .xAddClass('x-theme-element')
                    .xAttr('rows', '10')
                    .xAttr('placeholder', 'theme definitions')
                    .xId(eid)
                    .xInnerHTML(text),
                xmake('br'),
                xmake('div')
                    .xStyle({marginTop: '5px'})
                    .xAppendChild(
                        makeIconButton('copy to clipboard', 'copy', common.icons.copy, () => {
                            let text = document.getElementById(eid).value
                            navigator.clipboard.writeText(text).then((text) => {}, () => {
                                alert('internal error: paste to clipboard operation failed')})
                        }),
                        makeIconButton('save', 'save', common.icons.pencil, () => {
                            let text = document.getElementById(eid).value
                            let rec = null
                            try {
                                rec = JSON.parse(text)
                            } catch(e) {
                                alert(`cannot save, invalid JSON\nerror: ${ e }`)
                                return
                            }
                            common.iconFillColorFilter = rec
                            displayTheme()
                            header()
                            showPrefsPage()
                        }),
                        xmake('span')
                            .xId(eidlen)
                            .xInnerHTML(text ? text.length : '?'))
            )
    )
    return div
}

// app title
function prefsTitle() {
    return makeAccordionEntry(
        'Change Title',
        xmake('div')
            .xStyle(common.themes._activeProp().accordion.panel)
            .xAppendChild(
                xmake('p').xStyle(common.themes._activeProp().general.text)
                    .xInnerHTML(`
Change the application title.
`),
                xmake('div')
                    .xStyle(prefsCenterDiv)
                    .xAppendChild(
                        xmake('input')
                            .xStyle({
                                backgroundColor: common.themes._activeColors().bgColor,
                                color: common.themes._activeColors().fgColor,
                                minWidth: '64ch',
                            })
                            .xStyle(common.themes._activeProp().general.text)
                            .xId('x-prefs-title-input')
                            .xAttr('value', common.meta.title)
                            .xAttr('placeholder', 'app title'),
                        xmake('span')
                            .xAppendChild(
                                makeTextButton('change the app title',
                                               'Change',
                                               (e) => {
                                                   let x = document.getElementById('x-prefs-title-input')
                                                   common.meta.title = x.value
                                                   header()
                                                   showPrefsPage()
                                               }),
                                makeTextButton('change the app title to the default name',
                                               'Default',
                                               (e) => {
                                                   let x = document.getElementById('x-prefs-title-input')
                                                   common.meta.title = TITLE
                                                   header()
                                                   showPrefsPage()
                                               }),
                            )
                    )
            )
    )
}

// reset - clear the session storage
function prefsReset() {
    return makeAccordionEntry(
        'Reset',
        xmake('div')
            .xStyle(common.themes._activeProp().accordion.panel)
            .xAppendChild(
                xmake('p').xStyle(common.themes._activeProp().general.text)
                    .xInnerHTML(`
Reset the internal state by clearing the internal session storage and reloading.
This is useful during development when the common data changes.
`),
                xmake('div')
                    .xStyle(prefsCenterDiv)
                    .xAppendChild(
                        makeTextButton('clear session storage', 'Reset', (e) => {
                            sessionStorage.removeItem('common')
                            let status = document.getElementById('x-prefs-reset-status')
                            let store =  sessionStorage.getItem('common')
                            restoreCommon() // reload the raw default common data
                            if (!store) {
                                statusMsg('session storage cleared - reloading the page')
                            } else {
                                alert( `session storage not cleared: ${store.length} bytes remaining`)
                                return
                            }
                            resetCommon()
                            //location.reload(true)
                            displayTheme()
                            header()
                            showPrefsPage()
                        }),
                    )
            )
    )
}

// raw edit of the common data
function prefsRawEdit() {
    let text = JSON.stringify(common, null, 4)
    let eid = 'x-prefs-raw-common-buffer'
    let eidlen = eid + '-length'
    return makeAccordionEntry(
        'Raw Edit',
        xmake('div')
            .xStyle(common.themes._activeProp().accordion.panel)
            .xAppendChild(
                xmake('p').xStyle(common.themes._activeProp().general.text)
                    .xInnerHTML(`
Edit the raw preferences data. This is not for the faint of heart
because it can break the program but it allows full access to
the internals.
`),
                xmake('br'),
                xmake('textarea')
                    .xStyle(
                        {
                            display: 'grid',
                            gridTemplateColumns: 'max-content auto', // label value
                            backgroundColor: common.themes._activeColors().bgColor,
                            color: common.themes._activeColors().fgColor,
                            marginTop: '5px'})
                    .xStyle(common.themes._activeProp().general.textarea)
                    .xAddClass('x-theme-element')
                    .xAttr('rows', '10')
                    .xAttr('placeholder', 'record field templates JSON')
                    .xId(eid)
                    .xInnerHTML(text),
                xmake('br'),
                xmake('div')
                    .xStyle({marginTop: '5px'})
                    .xAppendChild(
                        makeIconButton('save', 'save', common.icons.pencil, () => {
                            let text = document.getElementById(eid).value
                            let rec = null
                            try {
                                rec = JSON.parse(text)
                            } catch(e) {
                                alert(`cannot save, invalid JSON\nerror: ${ e }`)
                                return
                            }
                            for (const key of Object.keys(rec)) {
                                if (key === 'crypt' ) {
                                    continue // user cannot change the crypt stuff
                                }
                                common[key] = rec[key]
                            }
                        }),
                        makeIconButton('copy to clipboard', 'copy', common.icons.copy, () => {
                            let text = document.getElementById(eid).value
                            navigator.clipboard.writeText(text).then((text) => {}, () => {
                                alert('internal error: paste to clipboard operation failed')})
                        }),
                        makeIconButton('format JSON', 'format', common.icons.expand, (e) => {
                            let text = document.getElementById(eid).value
                            let json = null
                            try {
                                json = JSON.parse(text)
                            } catch (event) {
                                alert(`cannot format, invalid JSON\nerror: ${ event }`)
                                return
                            }
                            let x  = JSON.stringify(json, null, 4)
                            document.getElementById(eid).value = x
                            document.getElementById(eidlen).innerHTML = x.length
                        }),
                        makeIconButton('unformat JSON', 'compress', common.icons.shrink, (e) => {
                            let text = document.getElementById(eid).value
                            let json = null
                            try {
                                json = JSON.parse(text)
                            } catch (event) {
                                alert(`cannot compress, invalid JSON\nerror: ${ event }`)
                                return
                            }
                            let x  = JSON.stringify(json)
                            document.getElementById(eidlen).innerHTML = x.length
                            document.getElementById(eid).value = x
                        }),
                        xmake('span')
                            .xId(eidlen)
                            .xInnerHTML(text ? text.length : '?')))
    )
    return  makeAccordionEntry(title, kvpairs)
}

// master password
function prefsMasterPassword() {
    return makeAccordionEntry(
        'Master Password',
        xmake('div')
            .xStyle(common.themes._activeProp().accordion.panel)
            .xAppendChild(
                xmake('p').xStyle(common.themes._activeProp().general.text)
                    .xInnerHTML(`
Set the master password. This is the password that is used to encrypt and decrypt file contents.
It is what keeps your data safe. Do not share this password and do not lose it.
If the password is lost, the data <i>cannot</i> be recovered.
Try to make the password hard to guess.
This panel will provide options when you press on the gear/gears butttons.
It does not try to grade your password for strength.
That is up to you to decide.
`),
                makePasswordEntry('password',
                                  () => { return common.crypt.password},  // Getter
                                  (value) => {common.crypt.password = value}  // Setter
                                 ).xStyle({marginBottom: common.themes._activeProp().accordion.panel.padding})
            )
    )
}
