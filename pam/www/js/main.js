/**
 * The main entry point for the application.
 * @module main
 */
import { xmk, xget, xgetn, enableFunctionChaining } from '/js/lib.js'
import { statusBlip } from '/js/status.js'
import { words } from '/js/en_words.js'
import { icon } from '/js/utils.js'
import { menuAboutDlg } from '/js/about.js'
import { initPrefs, menuPrefsDlg } from '/js/prefs.js'
import { menuSaveDlg } from '/js/save.js'
import { menuLoadDlg } from '/js/load.js'
import { mkMenu } from '/js/menu.js'

/**
 * Actions to take when the window is loaded.
 * @global
 */
window.onload = () => { initPrefs(); main() }

// https://developer.mozilla.org/en-US/docs/Web/API/Window#events
/**
 * Clean up actions to take when the window is unloaded.
 * @global
 */
window.addEventListener('beforeunload', () => {/*console.log('beforeunload')*/})
window.addEventListener('unload', () => {/*console.log('unload')*/})
window.addEventListener('load', () => {/*console.log('load')*/})

/**
 * Main entry point for the application.
 */
export function main() {
    // Enable the extra "x" prototype functions for elements.
    //console.log('window.isSecureContext: ', window.isSecureContext)
    enableFunctionChaining()
    initialize()
    adjust()
    //setTimeout(() => {adjust()}, 1000)
    const secure = window.isSecureContext? '(secure)' : ''
    statusBlip(`initializing PAM... ${secure} ${window.screen.width}x${window.screen.height}`, 1500)
}

function adjust() {
    // Hack to adjust the alignment of the top and middle sections
    // i could not get it to work usig bootstrap 5 classes!
    let top = xget('#top-section')
    let mid = xget('#mid-section')
    let ct = window.getComputedStyle(top);
    let cm = window.getComputedStyle(mid);
    //mid.style.marginTop = ct.height  // first try
    mid.style.marginTop = ct.fontSize  // this worked!
}

function initialize() {
    topLayout()
}

// This is a decent start for
//
// +----------------------------------------------------------------+
// |                             header                             |
// +----------------------------------------------------------------+
// | content                                                        |
// +----------------------------------------------------------------+
// |                             footer                             |
// +----------------------------------------------------------------+
//
function topLayout() {
    let lines = ''
    for (let i=1; i<=50; i++) {
        lines += `line ${i}<br />`
    }
    // TODO: need to add search to the header and a status line to the footer.
    document.body.xClass('bg-dark')
    document.body.xAppendChild(
        xmk('header')
            .xId('top-section')
            .xClass('fixed-top',
                    'border',
                    'p-2',
                    'bg-dark',
                    'fs-5',
                    'text-center',
                    'text-light')
            .xAppendChild(createSearchAndMenu()),
        xmk('div')
            .xId('mid-section')
            .xClass('h-100',
                    //'border', 'border-2', 'border-danger', // debugging
                    'overflow-auto',
                    'pt-5',
                    'pb-5',
                    'p-2',
                   )
            .xAppend( xmk('div').xClass('accordion').xId('records-accordion') ),
        xmk('footer')
            .xClass('fixed-bottom',
                    'border',
                    'p-2',
                    'bg-dark',
                    'fs-5',
                    'text-center',
                    'text-info',
                   )
            .xId('status')
            .xAttrs({'title': 'dynamic status messages appear here'})
            .xInnerHTML('footer')
    )
}

// Create the search input and the menu at the top.
function createSearchAndMenu() {
    let e = xmk('div')
        .xClass('row',
                'd-flex',
                'align-items-center',
               )
        .xAppendChild(
            xmk('div')
                .xClass('col')
                .xAppendChild(searchInput()),
            xmk('div')
                .xClass('col-auto', 'text-start')
                .xAppendChild(
                    xmk('button')
                        .xClass('btn', 'btn-lg', 'px-0', 'ms-2')
                        .xAttrs({
                            'type': 'button',
                            'title': 'clear the search field',
                        })
                        .xAddEventListener('click', (event) => {
                            document.body.xGet('#search').value = ''
                            filterRecords('')
                        })
                        .xAppend(
                            icon('bi-x-circle', 'clear the search field'),
                        ),
                ),
            xmk('div')
                .xClass('col-auto', 'text-end' )
                .xAppendChild(mkMenu()),
        )
    return e
}

// search input element
function searchInput() {
    let e = xmk('input')
        .xId('search')
        .xClass(
            'm-2',
            'w-100',
        )
        .xAttrs({
            'type': 'search',
            'title': 'search as you type',
            'placeholder': 'Search',
            'aria-label': 'Search'
        })
        .xAddEventListener('click', (event) => { filterRecords(event.target.value) })
        .xAddEventListener('input', (event) => { filterRecords(event.target.value) })
        .xAddEventListener('change', (event) => { filterRecords(event.target.value) })
        .xAddEventListener('paste', (event) => { filterRecords(event.target.value) })
    return e
}

function filterRecords(value) {
    if (!value) {
        value = '.'
    }
    let regex = null
    try {
        regex = new RegExp(value, 'i')
    } catch (exc) {
        // This can occur when a partial expresion is being typed in.
        //alert(`ERROR! invalid search expression: "${value}"\nregexp:${exc}`)
        console.log(`WARNING! invalid search expression: "${value}"\nregexp:${exc}`)
        regex = new RegExp('.', 'i')
    }
    let recordsContainer = document.body.xGet('#records-accordion') // middle part of the document.
    let accordionItems = recordsContainer.xGetN('.accordion-item')
    for (let i=0; i<accordionItems.length; i++) {
        let accordionItem = accordionItems[i]
        let button = accordionItem.xGet('.accordion-button')
        let title = button.innerHTML
        if (title.match(regex)) {
            if (accordionItem.classList.contains('d-none')) {
                accordionItem.classList.remove('d-none')
            }
        } else {
            if (!accordionItem.classList.contains('d-none')) {
                accordionItem.classList.add('d-none')
            }
        }
    }
}
