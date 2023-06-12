import { xmk, xget } from './lib.js'

// define search input element
export function mkSearchInputElement() {
    let e = xmk('input')
        .xId('search')
        .xClass('m-1', 'w-100')
        .xAttrs({
            'type': 'search',
            'title': 'search as you type',
            'placeholder': 'Search',
            'aria-label': 'Search'
        })
        .xAddEventListener('click', (event) => { searchRecords(event.target.value) })
        .xAddEventListener('input', (event) => { searchRecords(event.target.value) })
        .xAddEventListener('change', (event) => { searchRecords(event.target.value) })
        .xAddEventListener('paste', (event) => { searchRecords(event.target.value) })
    return e
}


function showItem(element) {
    if (element.classList.contains('d-none')) {
        element.classList.remove('d-none')
    }
}


function hideItem(element) {
    if (!element.classList.contains('d-none')) {
        element.classList.add('d-none')
    }
}


function matches(value, element, regex) {
    if (element.match(regex)) {
        return  true
    }
    return false
}


export function searchRecords(searchValue) {
    if (!searchValue) {
        searchValue = '.'  // show all records by default
    }
    let regex = null
    try {
        regex = window.prefs.searchCaseInsensitive ? new RegExp(searchValue, 'i') : new RegExp(searchValue)
    } catch (exc) {
        // This can occur when a partial expression is being typed in.
        //alert(`ERROR! invalid search expression: "${value}"\nregexp:${exc}`)
        //console.log(`WARNING! invalid search expression: "${value}"\nregexp:${exc}`)
        value = '.'
        regex = window.prefs.searchCaseInsensitive ? new RegExp(searchValue, 'i') : new RegExp(searchValue)
    }
    // Figure out which accordion items to show.
    let recordsContainer = document.body.xGet('#records-accordion') // middle part of the document.
    let accordionItems = recordsContainer.xGetN('.accordion-item')
    let num = 0
    for (let accordionItem of accordionItems) {
        let button = accordionItem.xGet('.accordion-button')
        let title = button.innerHTML
        let matched = false
        hideItem(accordionItem) // all items are hidden by default unless they match.

        // search the titles
        if (window.prefs.searchRecordTitles) {
            if (matches(searchValue, title, regex)) {
                showItem(accordionItem)
                num += 1
                matched = true
                continue
            }
        }

        // search the field names
        if (!matched && window.prefs.searchRecordFieldNames) {
            let names = accordionItem.xGetN('.x-fld-name')
            for (let element of names) {
                let name = element.innerHTML
                if (matches(searchValue, name, regex)) {
                    showItem(accordionItem)
                    num += 1
                    matched = true
                    break
                }
            }
        }

        // search the field values
        if (!matched && window.prefs.searchRecordFieldValues) {
            let values = accordionItem.xGetN('.x-fld-value')
            for (let element of values) {
                let type = element.getAttribute('data-fld-type')
                // how should passwords be managed? using the raw value
                let value = element.getAttribute('data-fld-raw-value')
                if (matches(searchValue, value, regex)) {
                    showItem(accordionItem)
                    num += 1
                    matched = true
                    break
                }
            }
        }
    }
    xget('#x-num-records').xInnerHTML(num)
}
