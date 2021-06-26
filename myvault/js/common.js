import { VERSION, BUILD, GIT_COMMIT_ID, GIT_BRANCH } from '/js/version.js'
import { getThemeProps, getThemeEntries } from '/js/themes.js'
import { header  } from '/js/header.js'

export var TITLE = 'myVault - Secure Personal Data Manager'

// Global variables
// entries that start with '_' are ignored.
export var common = {
    // This maps the field name to the type.
    // for example the field name "description" maps to a textarea (multi-line) element
    // it is used by by getValueType()
    // May allow this to be modified in preferences in the future.
    meta: {
        atime: '', // last access time
        ctime: '', // creation time
        mtime: '', // last modification time
        btime: BUILD, // build date
        version: VERSION, // the system and data version
        gitCommitId: GIT_COMMIT_ID, // git commit id
        gitBranch: GIT_BRANCH,
        title: TITLE
    },
    ftype: [ // field type based on name.
        // Can't use RegExp objects here because of the save/restore logic, all searches are case insensitive
        {rex: 'password', type: 'password'}, // password, "password 1"
        {rex: 'passphrase', type: 'password'}, // passphrase, "my passphrase"
        {rex: 'secret', type: 'password'}, // secret, "secret value"
        {rex: 'note', type: 'textarea'},  // note, notes
        {rex: 'descripton', type: 'textarea'},  // description
    ],
    crypt: {
        _wasm: null, // populated at load time from the generated crypt.js
        algorithm: '',
        password: '' // master password
    },
    search: {
        cache: ''
    },
    data: {
        records: [], // JSON data
        _map: {}, // ephemeral map the record ids to indexes
        maxFields: 10, // max fields per record
        rfts: { //  record field templates
            current: 'PASS4',
            entries: {
                NONE: [],
                BOOK: ['author', 'read', 'rating', 'notes'], // read == date read
                PASS4: ['url', 'username', 'password', 'notes'],
                PASS5: ['url', 'username', 'password', 'email', 'notes'],
            }
        }
    },
    save: {
        filename: 'myvault.txt'
    },
    themes: {
        active: {
            entry: 'steelblue-dark',
            prop: 'desktop',
        },
        // Get the current active entry.
        // Allow theme entries to change dynamically.
        _activeEntry: () => {
            let a = common.themes.active.entry
            if ( ! common.themes.entries.hasOwnProperty(a)) {
                a = Object.keys(common.themes.entries)[0]
                common.themes.active.entry = a
            }
            return common.themes.entries[a]
        },
        // Get the current active property set.
        // Allow theme properties to change dynamically.
        _activeProp: () => {
            let p = common.themes.active.prop
            if ( ! common.themes.props.hasOwnProperty(p)) {
                p = Object.keys(common.themes.entries)[0]
                common.themes.active.prop = p
            }
            return common.themes.props[p]
        },
        props: getThemeProps(),
        entries: getThemeEntries(),
    },
    icons: { // Credit to ico moon free icons: https://icomoon.io/preview-free.html
        arrowDown: '/icons/arrow-down.svg',
        arrowLeft: '/icons/arrow-left.svg',
        arrowRight: '/icons/arrow-right.svg',
        arrowUp: '/icons/arrow-up.svg',
        arrowDownThin: '/icons/arrow-down2.svg',
        arrowLeftThin: '/icons/arrow-left2.svg',
        arrowRightThin: '/icons/arrow-right2.svg',
        arrowUpThin: '/icons/arrow-up2.svg',
        circleDown: '/icons/circle-down.svg',
        circleLeft: '/icons/circle-left.svg',
        circleRight: '/icons/circle-right.svg',
        circleUp: '/icons/circle-up.svg',
        clear: '/icons/cancel-circle.svg',
        cog: '/icons/cog.svg',
        cogs: '/icons/cogs.svg',
        collapse: '/icons/shrink2.svg',
        contrast: '/icons/contrast.svg',
        copy: '/icons/copy.svg',
        db: '/icons/database.svg',
        expand: '/icons/enlarge.svg',
        eye:  'icons/eye.svg',
        eyeBlocked: 'icons/eye-blocked.svg',
        info: '/icons/question.svg',
        lock: '/icons/lock.svg',
        pencil: '/icons/pencil.svg',
        paste: '/icons/paste.svg',
        plus: '/icons/plus.svg',
        list: '/icons/list.svg',
        menu: '/icons/menu.svg',
        reset: '/icons/loop2.svg',
        save: '/icons/download.svg',
        search: '/icons/search.svg',
        shrink: '/icons/shrink.svg',
        trash: '/icons/bin.svg',
        undo: '/icons/undo2.svg',
        unlock: '/icons/unlocked.svg',
    },
    iconFillColorFilter: {
        maxTries: 50,
        maxLoss: 0.8,
        cache: {}
    }
};

// Get the value type based on the field name.
// returns 'password', 'textarea' or 'string'
export function getValueType(fieldName) {
    // (O(N) is okay because the list is very short.
    common.ftype.forEach( (obj) => {
        if ( obj.search(fieldName) ) {
            return obj.type
        }
    })
    return 'string'
}

// Use this when colors change.
export function refreshTheme() {
    if (common.theme.mode === 'dark' ) {
        setDarkModeTheme()
    } else {
        setLightModeTheme()
    }
}

// new
export function displayTheme() {
    document.body.style.color = common.themes._activeEntry().fgColor
    document.body.style.backgroundColor = common.themes._activeEntry().bgColor
    let es = document.getElementsByClassName('x-theme-element')
    for(let i=0;i<es.length; i++) {
        es[i].style.color = common.themes._activeEntry().fgColor
        es[i].style.backgroundColor = common.themes._activeEntry().bgColor
    }
}

// save to session storage
export function saveCommon() {
    // NOTE: was unable to get deep copy working reliably
    let rec = {
        meta: common.meta,
        ftype: common.ftype,
        crypt: {
            algorithm: common.crypt.algorithm,
            password: common.crypt.password,
        },
        search: common.search,
        data: {
            records: common.data.records,
            maxFields: common.data.maxFields,
            rfts: common.data.rfts,
        },
        save: common.save,
        themes: {
            active: common.themes.active,
            entries: common.themes.entries,
            props: common.themes.props,
        },
        icons: common.icons
    }
    let text = JSON.stringify(rec)
    sessionStorage.setItem('common', text)
}

// restore from session storage
export function restoreCommon() {
    let now = new Date().toISOString()
    let wasm = common.crypt._wasm
    let store =  sessionStorage.getItem('common')
    if (store) {
        try {
            let jdata = JSON.parse(store)
            common.meta = jdata.meta
            common.ftype = jdata.ftype
            common.crypt.algorithm = jdata.crypt.algorithm
            common.crypt.password = jdata.crypt.password
            common.search = jdata.search
            common.data.records = jdata.data.records
            common.data.maxFields = jdata.data.maxFields
            common.data.rfts = jdata.data.rfts
            common.save = jdata.save
            if (jdata.themes.active.entry in common.themes.entries) {
                // handle the case where the session store contains
                // an theme thata no longer exists.
                common.themes.active.entry = jdata.themes.active.entry
                common.themes.entries = jdata.themes.entries
            }
            if (jdata.themes.active.prop in common.themes.props) {
                // handle the case where the session store contains
                // an theme thata no longer exists.
                common.themes.active.prop = jdata.themes.active.prop
                common.themes.props = jdata.themes.props
            }
            common.icons = jdata.icons
        } catch(e) {
            alert(`cannot parse session store\nerror: ${e}`)
        }
    }
    // fix the crypt algorithm references
    if (common.crypt.algorithm === '') {
        common.crypt.algorithm = wasm.get_algorithm(0)
    }
    common.meta.atime = now
    if (common.meta.mtime === '') {
        common.meta.mtime = now
    }
    if (common.meta.ctime === '') {
        common.meta.ctime = now
    }

    // set the title.
    header()
}

// reset for common
export function resetCommon() {
    common.themes.props = getThemeProps()
    common.themes.entries = getThemeEntries()
    saveCommon()
}
