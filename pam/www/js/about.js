// about dialogue
import { xmk, xget, xgetn, enableFunctionChaining } from '/js/lib.js'
import { mkModalRecordButton, mkPopupModalDlg } from '/js/utils.js'

export const VERSION = '1.0.0-alpha'

export function menuAboutDlg() {
    let body = xmk('center')
        .xAppendChild(
            xmk('p').xInnerHTML('PAM &copy; 2022'),
            xmk('p').xInnerHTML(`Version ${VERSION}`),
            xmk('p').xInnerHTML('Personal Accounts Manager'),
            xmk('p').xInnerHTML('Written by Joe Linoff'),
            xmk('p').xInnerHTML('<a href="https://github.com/jlinoff/myvault">Project Page</a>'),
            xmk('p').xInnerHTML('<a href="https://jlinoff.github.io/myvault/help/index.html">Help</a>'),
            xmk('p').xInnerHTML('<i>A web app that allows you to securely manage your personal accounts data without ever communicating with a server.</i>'),

        )
    let b1 = mkModalRecordButton('Close',
                                 'btn-secondary',
                                 'close the dialogue',
                                 (el) => {
                                     console.log(el)
                                     return true
                                 })
    let e = mkPopupModalDlg('menuAboutDlg', 'About', body, b1)
    return e
}

