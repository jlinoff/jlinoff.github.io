// Password generation utilities.
import { statusBlip } from '/js/status.js'
import { words } from '/js/en_words.js'

export const ALPHA_LOWER = "abcdefghijklmnopqrstuvwxyz"
export const ALPHA_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
export const DEC_DIGITS = "0123456789"
export const HEX_DIGITS = "0123456789abcdef"
export const SPECIAL = "_-+!./#$%^"
export const ALPHABET = ALPHA_LOWER + ALPHA_UPPER + DEC_DIGITS + SPECIAL

// generate a cryptic password
// length - is the length for the resulting password
// alphabet - is the array of characters to use
export function getCrypticPassword(length, alphabet) {
    // Define the array and initially load it with random values.
    let array = new Uint8Array(length) // length of the desired password
    // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
    crypto.getRandomValues(array) // load with random values.
    let result = ''
    for (let i=0; i < array.length; i++) {
        // pick a random character from the alphabet
        result += alphabet.charAt(array[i] % alphabet.length);
    }
    return result;
}

export function getRandomWord(minlen, maxlen) {
    var i = Math.floor(Math.random() * words.length);
    var tries = 0
    var word = words[i]
    while (tries < 100 && (word.length < minlen || word.length > maxlen)) {
        i = Math.floor(Math.random() * words.length)
        word = words[i]
        tries += 1
    }
    if (tries >= 100) {
        console.log('ERROR: tries exceeded threshold')
        word = '?'
    }
    return word
}

export function getMemorablePassword(length) {
    let tries = 0
    let sep = window.prefs.memorablePasswordWordSeparator
    let minlen = window.prefs.memorablePasswordMinWordLength
    let maxlen = length
    let numwords = 0
    let maxwords = window.prefs.memorablePasswordMaxWords
    let minwords = window.prefs.memorablePasswordMinWords
    let maxtries = window.prefs.memorablePasswordMaxTries
    let result = ''
    while (result.length !== length && tries < maxtries) {
        result = ''
        numwords = 0
        while (result.length < length) {
            numwords += 1
            let word = getRandomWord(minlen, maxlen)
            if (numwords > 1) {
                result += sep
            }
            result += word
            if (numwords > maxwords) {
                break
            }
        }
        tries += 1
        if (numwords > maxwords || numwords < minwords) {
            result = '' // failed
        }
    }
    if (tries >= maxtries) {
        console.log('ERROR: tries exceeded threshold')
        result = '???' + getCrypticPassword(length, HEX_DIGITS)
    }
    if (result.length !== length) {
        console.log('ERROR: tries exceeded threshold', result.length)
        result = '???' + getCrypticPassword(length, HEX_DIGITS)
    }
    return result
}

