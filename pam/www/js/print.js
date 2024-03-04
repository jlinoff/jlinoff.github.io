// Print the records in plaintext top
/**
 * Print records in plaintext to allow users to store them
 * locally. This is not secure but it allows users to keep a hard
 * copy.
 */
import { xmk, xget, xgetn, enableFunctionChaining } from './lib.js'
import { statusBlip } from './status.js'
import { VERSION } from './version.js'  // automatically generated by make

export function enablePrinting() {
    let eps = document.body.xGetN('.x-print')
    for (let ep of eps) {
        if ( window.prefs.enablePrinting ) {
            ep.xStyle({'display': 'block'})
        } else {
            ep.xStyle({'display': 'none'})
        }
    }
}

export function printRecords() {
    statusBlip(`generating print document...`)
    let html = genRecordsDocument()
    let pwin = window.open()
    pwin.document.write(html)
    pwin.print()
    pwin.close()
}

// The new Sanitizer API is not yet widely available.
function sanitize(html) {
    return html.replace('&', '&nbsp;').replace('<', '&lt;').replace('>', '&gt;').replace("'", '&apos;').replace('"', '&quot;')
}

function genRecordsDocument() {
    let recordsContainer = document.body.xGet('#records-accordion') // middle part of the document.
    if (!recordsContainer) {
        return '<h4>No records</h4>'
    }
    let accordionItems = recordsContainer.xGetN('.accordion-item')
    if (!accordionItems) {
        return '<h4>No records</h4>'
    }
    if (accordionItems.length === 0) {
        return '<h4>No records available</h4>'
    }

    // Count the number of records that will be printed.
    let count = 0
    for (let i=0; i<accordionItems.length; i++) {
        let accordionItem = accordionItems[i]
        if (accordionItem.classList.contains('d-none') === false) {
            count += 1
        }
    }
    if (count === 0) {
        return '<h4>No records selected</h4>'
    }

    // Get the search string.
    let search = document.getElementById('search').value

    // The header.
    let html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Records Report</title>
    <meta name="author" content="Joe Linoff">
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <center>
`
    html += '      <h2>PAM Records Report</h2>\n'
    html += '      <h4>\n'
    if (!!search) {
        search = sanitize(search)
        html += `Found ${count} Records Containing "${search}"<br />`
    }
    if (window.prefs.lastUpdated) {
        html += `Last Updated: ${sanitize(window.prefs.lastUpdated)}<br />`
    } else {
        let now = new Date()
        let dts = now.toISOString()
        html += `Last Updated: ${sanitize(dts)}<br />`
    }
    html += `Total Records: ${accordionItems.length}\n`
    html += '      </h4>'

    // Get the record data and build the HTML contents.
    let twidth = '90%'
    let tpad = 'font-size:larger;padding-left:10px;padding-right:10px'
    let tpad1 = 'font-size:x-large;padding-left:10px;padding-right:10px;'
    let tstyle = 'font-size:larger;page-break-inside:avoid'
    //let vstyle = `margin:0;${tpad}`
    let vstyle = `${tpad}`
    let fstyle = tpad
    let j = 0
    for (let i=0; i<accordionItems.length; i++) {
        let accordionItem = accordionItems[i]
        if (accordionItem.classList.contains('d-none') ===true) {
            continue
        }
        let button = accordionItem.xGet('.accordion-button')
        let title = button.innerHTML
        j += 1
        html += `
      <p>&nbsp;</p>
      <table border="1" cellpadding="1" cellspacing="0" width="90%" style="${tstyle}">
          <tr>
           <th valign="middle" bgcolor="lightgray" colspan="2" style="${tpad1}">
             <b>&nbsp;${title}&nbsp;</b>
           </th>
         </tr>
         <tr>
           <td valign="middle" align="right" style="${fstyle}">
             &nbsp;<i>__index__</i>:&nbsp;
           </td>
           <td valign="middle" align="left" style="${vstyle}">
             ${j}
           </td>
         </tr>
`
        let rows = accordionItem.xGetN('.row')
        for (let i=0; i<rows.length; i++) {
            let row = rows[i]
            let nameDiv = row.xGet('.x-fld-name')
            if (!nameDiv) {
                continue // button row
            }
            let name = nameDiv.innerHTML
            let valueDiv = row.xGet('.x-fld-value')
            let type = valueDiv.getAttribute('data-fld-type')
            let value = valueDiv.innerHTML
            switch( type ) {
            case 'html':
            case 'password':
            case 'textarea':
            case 'url':
                value = valueDiv.getAttribute('data-fld-raw-value')
                break
            default:
                break
            }
            name = sanitize(name)
            value = sanitize(value)
            // row prefix and name
            html += `
         <tr>
           <td valign="middle" align="right" style="${fstyle}">
             &nbsp;${name}:&nbsp;
           </td>
           <td valign="middle" align="left" style="${vstyle}">
`
            // row value
            if (type === 'textarea') {
                html += `             <pre>${value}</pre>`
            } else {
                html += `             ${value}`
            }

            // row suffix
            html += `
           </td>
         </tr>
`
        }
        html += `
       </table>
`
    }
    html += `
    </center>
  </body>
</html>
`
    return html
}
