// preferences stuff
import { xmk, xget, xgetn, enableFunctionChaining } from '/js/lib.js'
import { icon, mkModalRecordButton, mkPopupModalDlg } from '/js/utils.js'

export function initPrefs() {
    window.prefs = {
        fileName: 'example.txt',
        filePass: '',
        passwordRangeLengthDefault: 20,
        passwordRangeMinLength: 12,
        passwordRangeMaxLength: 32,
        memorablePasswordWordSeparator: '/',
        memorablePasswordMinWordLength: 2,
        memorablePasswordMinWords: 3,
        memorablePasswordMaxWords: 5,
        memorablePasswordMaxTries: 10000,
        clearBeforeLoad: true,
        loadDupStrategy: 'ignore', // valid strategies are 'ignore', 'replace', 'allow' - only used if clearBeforeLoad
        logStatusToConsole: false, // tee the status to console.log
    }
}

export function menuPrefsDlg() {
    let labelClasses = ['col-9']
    let inputClasses = ['col-3']
    let initClearBeforeLoadCheckbox = ''
    let initLoadStrategyVisibility = null
    if (window.prefs.clearBeforeLoad) {
        initLoadStrategyVisibility = 'd-none'
        initClearBeforeLoadCheckbox = 'bi-check2-square'
    } else {
        initClearBeforeLoadCheckbox = 'bi-square'
    }
    let body = xmk('span')
        .xAppendChild(

            // log status to the console.
            xmk('div').xClass('row').xAppend(
                xmk('div').xClass(...labelClasses).xAppend(
                    xmk('label')
                        .xClass('col-form-label')
                        .xAttrs({'title': 'tee status to console.log'})
                        .xInnerHTML('Log Status to the Console')
                ),
                xmk('div').xClass(...inputClasses).xAppend(
                    xmk('div').xClass('input-group').xAppend(
                        xmk('button')
                            .xClass('form-control', 'btn', 'btn-lg')
                            .xAttrs({'type': 'button',
                                     'title': 'duplicate status to the console'
                                    })
                            .xAppend(icon(initClearBeforeLoadCheckbox, 'enable or disable'))
                            .xAddEventListener('click', (event) => {
                                console.log(event)
                                console.log(event.target.parentElement.tagName)
                                let button = event.target.xGetParentOfType('button')
                                let icon = button.xGet('i')
                                let enabled = icon.classList.contains('bi-check2-square')
                                let mbody = event.target.xGetParentWithClass('modal-body')
                                if (enabled) {
                                    icon.classList.remove('bi-check2-square')
                                    icon.classList.add('bi-square')
                                    window.prefs.logStatusToConsole = false
                                    let msg = 'do not log status to console'
                                    button.xAttr('title', msg)
                                    icon.xAttr('title', msg)
                                } else {
                                    icon.classList.remove('bi-square')
                                    icon.classList.add('bi-check2-square')
                                    window.prefs.logStatusToConsole = true
                                    let msg = 'log status to console'
                                    button.xAttr('title', msg)
                                    icon.xAttr('title', msg)
                                }
                            }),
                    ),
                ),
            ),

            // clear records before loading
            xmk('div').xClass('row').xAppend(
                xmk('div').xClass(...labelClasses).xAppend(
                    xmk('label')
                        .xClass('col-form-label')
                        .xInnerHTML('Clear Records On Load')
                ),
                xmk('div').xClass(...inputClasses).xAppend(
                    xmk('div').xClass('input-group').xAppend(
                        xmk('button')
                            .xClass('form-control', 'btn', 'btn-lg')
                            .xAttrs({'type': 'button',
                                     'title': 'clear records before loading'
                                    })
                            .xAppend(icon(initClearBeforeLoadCheckbox, 'enable or disable'))
                            .xAddEventListener('click', (event) => {
                                console.log(event)
                                console.log(event.target.parentElement.tagName)
                                let button = event.target.xGetParentOfType('button')
                                let icon = button.xGet('i')
                                let enabled = icon.classList.contains('bi-check2-square')
                                let mbody = event.target.xGetParentWithClass('modal-body')
                                let row = mbody.xGet('#x-prefs-load-dup-row')
                                if (enabled) {
                                    icon.classList.remove('bi-check2-square')
                                    icon.classList.add('bi-square')
                                    window.prefs.clearBeforeLoad = false
                                    let msg = 'do not clear records before loading'
                                    button.xAttr('title', msg)
                                    icon.xAttr('title', msg)
                                    if (row.classList.contains('d-none')) {
                                        row.classList.remove('d-none')
                                    }
                                } else {
                                    icon.classList.remove('bi-square')
                                    icon.classList.add('bi-check2-square')
                                    window.prefs.clearBeforeLoad = true
                                    let msg = 'clear records before loading enabled'
                                    button.xAttr('title', msg)
                                    icon.xAttr('title', msg)
                                    if (!row.classList.contains('d-none')) {
                                        row.classList.add('d-none')
                                    }
                                }
                            }),
                    ),
                ),
            ),

            // Clear before load - NOT working, checkbox doesn't have a check!
            xmk('div').xClass('row', initLoadStrategyVisibility).xId('x-prefs-load-dup-row').xAppend(
                xmk('div').xClass(...labelClasses).xAppend(
                    xmk('label')
                        .xClass('col-form-label')
                        .xInnerHTML('Load Duplicate Record Strategy')
                ),
                xmk('div').xClass(...inputClasses).xAppend(
                    // Load duplication strategy
                    xmk('div').xClass('dropdown').xAppend(
                        xmk('button')
                            .xId('x-prefs-load-dup-button')
                            .xClass('btn', 'dropdown-toggle')
                            .xAttrs({
                                'data-bs-toggle': 'dropdown',
                                'aria-expanded': 'false',
                                'type': 'button',
                            })
                            .xInnerHTML('ignore'),
                        xmk('ul')
                            .xAttrs({'aria-labelledby': 'x-prefs-load-dup-button'})
                            .xClass('dropdown-menu')
                            .xAppend(
                                xmk('li').xClass('dropdown-item')
                                    .xAttr('href', '#')
                                    .xInnerHTML('allow')
                                    .xAddEventListener('click', (event) => {
                                        let button = event.target.xGetParentWithClass('dropdown').xGet('button')
                                        button.innerHTML = event.target.innerHTML
                                        window.prefs.loadDupStrategy = event.target.innerHTML
                                    }),
                                xmk('li').xClass('dropdown-item', 'active')
                                    .xAttr('href', '#')
                                    .xInnerHTML('ignore')
                                    .xAddEventListener('click', (event) => {
                                        let button = event.target.xGetParentWithClass('dropdown').xGet('button')
                                        button.innerHTML = event.target.innerHTML
                                        window.prefs.loadDupStrategy = event.target.innerHTML
                                    }),
                                xmk('li').xClass('dropdown-item')
                                    .xAttr('href', '#')
                                    .xInnerHTML('replace')
                                    .xAddEventListener('click', (event) => {
                                        let button = event.target.xGetParentWithClass('dropdown').xGet('button')
                                        button.innerHTML = event.target.innerHTML
                                        window.prefs.loadDupStrategy = event.target.innerHTML
                                    }),
                            ),
                    ),
                ),
            ),

            // Maximum password length
            xmk('div').xClass('row').xAppend(
                xmk('div').xClass(...labelClasses).xAppend(
                    xmk('label')
                        .xClass('col-form-label')
                        .xInnerHTML('Minimum Password Length')
                ),
                xmk('div').xClass(...inputClasses).xAppend(
                    xmk('div').xClass('input-group').xAppend(
                        xmk('input')
                            .xId('x-prefs-password-length-minimum')
                            .xClass('form-control')
                            .xAttrs({'type': 'number',
                                     'value': window.prefs.passwordRangeMinLength,
                                     'min': 4,
                                     'max': 39,
                                     'title': 'min=4, max=39'
                                    })
                            .xAddEventListener('change', (event) => {
                                if (event.target.value > window.prefs.passwordRangeMaxLength) {
                                    event.target.value = window.prefs.passwordRangeMaxLength
                                } else {
                                    window.prefs.passwordRangeMinLength = event.target.value
                                }
                            })
                            .xAddEventListener('input', (event) => {
                                if (event.target.value > window.prefs.passwordRangeMaxLength) {
                                    event.target.value = window.prefs.passwordRangeMaxLength
                                } else {
                                    window.prefs.passwordRangeMinLength = event.target.value
                                }
                            }),
                    ),
                ),
            ),

            // Maximum password length
            xmk('div').xClass('row').xAppend(
                xmk('div').xClass(...labelClasses).xAppend(
                    xmk('label')
                        .xClass('col-form-label')
                        .xInnerHTML('Maximum Password Length')
                ),
                xmk('div').xClass(...inputClasses).xAppend(
                    xmk('div').xClass('input-group').xAppend(
                        xmk('input')
                            .xId('x-prefs-password-length-maximum')
                            .xClass('form-control')
                            .xAttrs({'type': 'number',
                                     'value': window.prefs.passwordRangeMaxLength,
                                     'min': 5,
                                     'max': 40,
                                     'title': `min=5, max=40`,
                                    })
                            .xAddEventListener('change', (event) => {
                                if (event.target.value <= window.prefs.passwordRangeMinLength) {
                                    event.target.value = window.prefs.passwordRangeMinLength
                                } else {
                                    window.prefs.passwordRangeMaxLength = event.target.value
                                }
                            })
                            .xAddEventListener('input', (event) => {
                                if (event.target.value <= window.prefs.passwordRangeMinLength) {
                                    event.target.value = window.prefs.passwordRangeMinLength
                                } else {
                                    window.prefs.passwordRangeMaxLength = event.target.value
                                }
                            }),
                    ),
                ),
            ),

            // Memorable Password Min Word Length
            xmk('div').xClass('row').xAppend(
                xmk('div').xClass(...labelClasses).xAppend(
                    xmk('label')
                        .xClass('col-form-label')
                        .xInnerHTML('Memorable Password Min Word Length')
                ),
                xmk('div').xClass(...inputClasses).xAppend(
                    xmk('div').xClass('input-group').xAppend(
                        xmk('input')
                            .xClass('form-control')
                            .xAttrs({'type': 'number',
                                     'value': window.prefs.memorablePasswordMinWordLength,
                                     'title': 'minimum word length in memorable passwords',
                                    })
                            .xAddEventListener('change', (event) => {
                                window.prefs.memorablePasswordMinWordLength = event.target.value
                            })
                            .xAddEventListener('input', (event) => {
                                window.prefs.memorablePasswordMinWordLength = event.target.value
                            }),
                    ),
                ),
            ),

            // Memorable Password Word Separator
            xmk('div').xClass('row').xAppend(
                xmk('div').xClass(...labelClasses).xAppend(
                    xmk('label')
                        .xClass('col-form-label')
                        .xInnerHTML('Memorable Password Word Separator')
                ),
                xmk('div').xClass(...inputClasses).xAppend(
                    xmk('div').xClass('input-group').xAppend(
                        xmk('input')
                            .xClass('form-control')
                            .xAttrs({'type': 'text',
                                     'value': window.prefs.memorablePasswordWordSeparator,
                                     'title': 'string used to separate words in memorable passwords',
                                    })
                            .xAddEventListener('change', (event) => {
                                window.prefs.memorablePasswordWordSeparator = event.target.value
                            })
                            .xAddEventListener('input', (event) => {
                                window.prefs.memorablePasswordWordSeparator = event.target.value
                            }),
                    ),
                ),
            ),

            // Memorable Password Min Words
            xmk('div').xClass('row').xAppend(
                xmk('div').xClass(...labelClasses).xAppend(
                    xmk('label')
                        .xClass('col-form-label')
                        .xInnerHTML('Memorable Password Min Words')
                ),
                xmk('div').xClass(...inputClasses).xAppend(
                    xmk('div').xClass('input-group').xAppend(
                        xmk('input')
                            .xClass('form-control')
                            .xAttrs({'type': 'number',
                                     'value': window.prefs.memorablePasswordMinWords,
                                     'title': 'minimum number of words in memorable passwords',
                                    })
                            .xAddEventListener('change', (event) => {
                                window.prefs.memorablePasswordMinWords = event.target.value
                            })
                            .xAddEventListener('input', (event) => {
                                window.prefs.memorablePasswordMinWords = event.target.value
                            }),
                    ),
                ),
            ),

            // Memorable Password Max Words
            xmk('div').xClass('row').xAppend(
                xmk('div').xClass(...labelClasses).xAppend(
                    xmk('label')
                        .xClass('col-form-label')
                        .xInnerHTML('Memorable Password Max Words')
                ),
                xmk('div').xClass(...inputClasses).xAppend(
                    xmk('div').xClass('input-group').xAppend(
                        xmk('input')
                            .xClass('form-control')
                            .xAttrs({'type': 'number',
                                     'value': window.prefs.memorablePasswordMaxWords,
                                     'title': 'maximum number of words in memorable passwords',
                                    })
                            .xAddEventListener('change', (event) => {
                                window.prefs.memorablePasswordMaxWords = event.target.value
                            })
                            .xAddEventListener('input', (event) => {
                                window.prefs.memorablePasswordMaxWords = event.target.value
                            }),
                    ),
                ),
            ),

            // memorablePasswordMaxTries
            xmk('div').xClass('row').xAppend(
                xmk('div').xClass(...labelClasses).xAppend(
                    xmk('label')
                        .xClass('col-form-label')
                        .xInnerHTML('Memorable Password Max Tries')
                ),
                xmk('div').xClass(...inputClasses).xAppend(
                    xmk('div').xClass('input-group').xAppend(
                        xmk('input')
                            .xClass('form-control')
                            .xAttrs({'type': 'number',
                                     'value': window.prefs.memorablePasswordMaxTries,
                                     'title': 'maximum number of tries to generate a memorable password',
                                    })
                            .xAddEventListener('change', (event) => {
                                window.prefs.memorablePasswordMaxTries = event.target.value
                            })
                            .xAddEventListener('input', (event) => {
                                window.prefs.memorablePasswordMaxTries = event.target.value
                            }),
                    ),
                ),
            ),

        )
    let b1 = mkModalRecordButton('Close',
                                 'btn-secondary',
                                 'close the dialogue',
                                 (el) => {
                                    //console.log(el)
                                    return true
    })

    let e = mkPopupModalDlg('menuPrefsDlg', 'Preferences', body, b1)
    return e
}
