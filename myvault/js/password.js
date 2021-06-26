import { xmake, makeInputXWrapper } from '/myvault/js/utils.js'
import { makeIcon, changeIcon } from '/myvault/js/icons.js'
import { words } from '/myvault/js/en_words.js'
import { common } from '/myvault/js/common.js'

// Password stuff
// Generate a cryptic password composed of letters, digits and special characters.
// minlen = 15
// maxlen = 31
function pass1(opts) {
    function getval(prop, defval) {
        if (!opts) {
            return defval
        }
        if (opts.hasOwnProperly(prop)) {
            return opts.minlen
        }
        return defval
    }
    let alphabet = getval('alphabet', "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-!.");
    let size = alphabet.length;
    let result = '';
    let minlen = getval('minval', 15)
    let maxlen = getval('maxval', 31)

    // Add a touch more randomness.
    var num_rounds = Math.floor(Math.random() * (100));
    for (let j=0; j < num_rounds; j++) {
        var length = Math.floor(Math.random() * (maxlen - minlen)) + minlen;
        let array;
        if ('Uint8Array' in self && 'crypto' in self) {
            array = new Uint8Array(length);
            self.crypto.getRandomValues(array);
        } else {
            array = new Array(length);
            for (let i = 0; i < length; i++) {
                array[i] = Math.floor(Math.random() * 62);
            }
        }
        result = '';  // reset each round
        for (let i=0; i < length; i++) {
            result += alphabet.charAt(array[i] % size);
        }
    }
    return result;
}

// Generate a word.
 function randomWord(minlen, maxlen) {
    var i = Math.floor(Math.random() * words.length);
    var word = words[i];
    while (word.length < minlen || word.length > maxlen) {
        i = Math.floor(Math.random() * words.length);
        word = words[i];
    }
    return word;
}

// Generate a human readable (memorable) password.
function pass2() {
    const tminlen = 15;
    const tmaxlen = 31;
    const wminlen = 3;
    const wmaxlen = 15;
    const sep = '/';
    var result = '';
    while (result.length < tminlen || result.length > tmaxlen) {
        result = '';
        for(var i=0; i<3; i++) {
            var word = randomWord(wminlen, wmaxlen);
            if (i) {
                result += sep;
            }
            result += word;
        }
    }
    return result;
}
// ========================================================================
//
// DOM Setup
//
// ========================================================================
// This is the password prompt with all of the bells an whistles.
// TODO: add the getter and setter parameters.
export function makePasswordEntry(placeholder, getter, setter) {
    let value = getter() || ''
    return xmake('div')
        .xStyle(common.themes._activeProp().password.topdiv)
        .xAppendChild(
            makeInputXWrapper(
                xmake('input')
                    .xAttr('type', 'password')
                    .xStyle(common.themes._activeProp().password.css)
                    .xStyle({
                        backgroundColor: common.themes._activeEntry().bgColor,
                        color: common.themes._activeEntry().fgColor,
                    })
                    .xAddClass('x-password-input')
                    .xAddClass('x-theme-element')
                    .xAttr('placeholder', placeholder)
                    .xAttr('value', value)
                    .xAddEventListener('input', e => updatePassword(e, setter))
                    .xAddEventListener('click', e => updatePassword(e, setter))
                    .xAddEventListener('paste', e => updatePassword(e, setter))
                    .xAddEventListener('change', e => updatePassword(e, setter)))
                .xStyle({width: common.themes._activeProp().password.input.width}),
            xmake('span')
                .xStyle({marginLeft: '5px'})
                .xAddClass('x-password-length')
                .xInnerHTML(value.length),
            xmake('button')
                .xStyle({
                    backgroundColor: common.themes._activeEntry().bgColor,
                    color: common.themes._activeEntry().fgColor,
                    marginLeft: '10px',
                })
                .xAddClass('x-theme-element')
                .xAddEventListener('click', e => showHidePassword(e))
                .xTooltip('show or hide the password')
                .xAppendChild(makeIcon(common.icons.eyeBlocked, 'show').xAddClass('x-show-hide-img')),
            xmake('button')
                .xStyle({
                    backgroundColor: common.themes._activeEntry().bgColor,
                    color: common.themes._activeEntry().fgColor,
                    marginLeft: '10px',
                })
                .xAddClass('x-theme-element')
                .xAddEventListener('click', e => generateCrypticPassword(e))
                .xTooltip('generate pseudo-random cyptic password')
                .xAppendChild(makeIcon(common.icons.cog, 'generate').xAddClass('x-show-hide-img')),
            xmake('button')
                .xStyle({
                    backgroundColor: common.themes._activeEntry().bgColor,
                    color: common.themes._activeEntry().fgColor,
                    marginLeft: '10px',
                })
                .xAddClass('x-theme-element')
                .xAddEventListener('click', e => generateMemorablePassword(e))
                .xTooltip('generate pseudo-random memorable password')
                .xAppendChild(makeIcon(common.icons.cogs, 'generate2').xAddClass('x-show-hide-img')),
            xmake('button')
                .xStyle({
                    backgroundColor: common.themes._activeEntry().bgColor,
                    color: common.themes._activeEntry().fgColor,
                    marginLeft: '10px',
                })
                .xAddClass('x-theme-element')
                .xAddEventListener('click', e => copyPassword(e))
                .xTooltip('copy password to clipboard for pasting to external applications')
                .xAppendChild(makeIcon(common.icons.copy, 'copy').xAddClass('x-show-hide-img')))
}

// Make a password entry with an ID - not DRY!!! needs to be fixed
export function makePasswordEntryWithId(eid, cls, placeholder,  value) {
    return xmake('div')
        .xStyle(common.themes._activeProp().password.topdiv)
        .xAppendChild(
            makeInputXWrapper(
                xmake('input')
                    .xAttr('type', 'password')
                    .xStyle(common.themes._activeProp().password.css)
                    .xStyle({
                        backgroundColor: common.themes._activeEntry().bgColor,
                        color: common.themes._activeEntry().fgColor,
                    })
                    .xAddClass(cls)
                    .xAddClass('x-password-input')
                    .xAddClass('x-theme-element')
                    .xAttr('placeholder', placeholder)
                    .xAttr('value', value)
                    .xAddEventListener('input', e => updatePasswordLength(e))
                    .xAddEventListener('paste', e => updatePasswordLength(e))
                    .xAddEventListener('click', e => updatePasswordLength(e))
                    .xAddEventListener('change', e => updatePasswordLength(e))
                    .xId(eid))
                .xStyle({width: common.themes._activeProp().password.input.width}),
            xmake('span')
                .xStyle({marginLeft: '5px'})
                .xAddClass('x-password-length')
                .xInnerHTML(value.length),
            xmake('button')
                .xStyle({
                    backgroundColor: common.themes._activeEntry().bgColor,
                    color: common.themes._activeEntry().fgColor,
                    marginLeft: '10px'})
                .xAddClass('x-theme-element')
                .xAddEventListener('click', e => showHidePassword(e))
                .xTooltip('show or hide the password')
                .xAppendChild(makeIcon(common.icons.eyeBlocked, 'show').xAddClass('x-show-hide-img')),
            xmake('button')
                .xStyle({
                    backgroundColor: common.themes._activeEntry().bgColor,
                    color: common.themes._activeEntry().fgColor,
                    marginLeft: '10px'})
                .xAddClass('x-theme-element')
                .xAddEventListener('click', e => generateCrypticPassword(e))
                .xTooltip('generate pseudo-random cyptic password')
                .xAppendChild(makeIcon(common.icons.cog, 'generate').xAddClass('x-show-hide-img')),
            xmake('button')
                .xStyle({
                    backgroundColor: common.themes._activeEntry().bgColor,
                    color: common.themes._activeEntry().fgColor,
                    marginLeft: '10px'})
                .xAddClass('x-theme-element')
                .xAddEventListener('click', e => generateMemorablePassword(e))
                .xTooltip('generate pseudo-random memorable password')
                .xAppendChild(makeIcon(common.icons.cogs, 'generate2').xAddClass('x-show-hide-img')),
            xmake('button')
                .xStyle({
                    backgroundColor: common.themes._activeEntry().bgColor,
                    color: common.themes._activeEntry().fgColor,
                    marginLeft: '10px'})
                .xAddClass('x-theme-element')
                .xAddEventListener('click', e => copyPassword(e))
                .xTooltip('copy password to clipboard for pasting to external applications')
                .xAppendChild(makeIcon(common.icons.copy, 'copy').xAddClass('x-show-hide-img')))
}

function updatePasswordLength(event) {
    let button = event.currentTarget
    let div = button.parentNode
    let input = div.parentNode.getElementsByClassName('x-password-input')[0]
    let span = div.parentNode.getElementsByClassName('x-password-length')[0]
    span.innerHTML = input.value.length
}

function showHidePassword(event) {
    let button = event.currentTarget
    let div = button.parentNode
    let input = div.parentNode.getElementsByClassName('x-password-input')[0]
    let itype = input.getAttribute('type').toLowerCase()
    let svg = button.getElementsByClassName('x-icon-element')[0]
    if ( itype === 'password') {
        input.setAttribute('type', 'input')
        changeIcon(svg, common.icons.eye)
    } else {
        input.setAttribute('type', 'password')
        changeIcon(svg, common.icons.eyeBlocked)
    }
    updatePasswordLength(event)
}

function generateCrypticPassword(event) {
    let button = event.currentTarget
    let div = button.parentNode
    let input = div.parentNode.getElementsByClassName('x-password-input')[0]
    input.value = pass1()
    let size = div.parentNode.getElementsByClassName('x-password-length')[0]
    size.innerHTML = input.value.length
    updatePasswordLength(event)
    dispatchChangeEvent(input)
}

function generateMemorablePassword(event) {
    let button = event.currentTarget
    let div = button.parentNode
    let input = div.parentNode.getElementsByClassName('x-password-input')[0]
    input.value = pass2() // TODO
    let size = div.parentNode.getElementsByClassName('x-password-length')[0]
    size.innerHTML = input.value.length
    updatePasswordLength(event)
    dispatchChangeEvent(input)
}

function copyPassword(event) {
    let button = event.currentTarget
    let div = button.parentNode
    let input = div.parentNode.getElementsByClassName('x-password-input')[0]
    let text = input.value
    updatePasswordLength(event)
    navigator.clipboard.writeText(text).then((text) => {}, () => {
        alert('internal error: paste to clipboard operation failed')})
}

function updatePassword(event, setter) {
    let input = event.currentTarget
    setter(input.value)
    updatePasswordLength(event)
}

function dispatchChangeEvent(input) {
    const event = new Event('change')
    input.dispatchEvent(event)
}
