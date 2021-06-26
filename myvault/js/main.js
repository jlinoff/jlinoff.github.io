// main entry point
// Enable element functio chaining.
import { xmake, enableFunctionChaining, statusMsg } from '/js/utils.js'
import { header  } from '/js/header.js'
import { common, displayTheme, saveCommon, restoreCommon } from '/js/common.js'


import init, {
decrypt,
    encrypt,
    get_algorithm,
    get_name,
    get_num_algorithms,
    header_prefix,
    header_suffix,
} from '/js/crypt.js';

async function loadCrypt() {
    await init()
    let fcts = {
        decrypt: decrypt, // decrypt(algorithm: string, password: string, plaintext: string) -> string
        encrypt: encrypt, // encrypt(algorithm: string, password: string, plaintext: string) -> string
        get_algorithm: get_algorithm, // get_algorithm(int) -> string
        get_name: get_name, // get_name() -> string (module name)
        get_num_algorithms: get_num_algorithms, // get_num_algorithms() -> int
        header_prefix: header_prefix, // header_prefix(algorithm: string) -> string
        header_suffix: header_suffix, // header_suffix(algorithm: string) -> string
    }
    common.crypt._wasm = fcts
    enableFunctionChaining()
    restoreCommon()
}
loadCrypt()

// Handle refresh and reload.
window.addEventListener('beforeunload', () => {
    console.log('beforeunload')
    saveCommon()
})

// Initialize the window.
window.onload = () => {
    enableFunctionChaining()
    header()
    displayTheme()

    let style = document.createElement('style');
    style.innerHTML = css()
    document.head.append(style)

    // Setup the basic main pages.
    let pageNames = [ 'about', 'prefs', 'load', 'data', 'save']
    for(let i = 0; i < pageNames.length; i++) {
        let name = 'page-' + pageNames[i]
        document.body.append(
            xmake('div')
                .xId(name)
                .xAddClass('x-spa-page')
                .xStyle({display: 'none'}))
    }

}

// Common styles - function allows dynamic variable values.
function css() {
    let width = '1000px'  // default
    let mlr = 'auto'
    if (window.innerWidth < 1000) {
        width = window.innerWidth - 20
        mlr = '5px'
    }
    document.body.xStyle( common.themes._activeProp().body)
    let text =`
.x-spa-page {
  width: ${ width };
  margin-top: 3em;
  margin-left: ${mlr};
  margin-right: ${mlr};
 }

.x-hover:hover {
   font-style: italic;
}

.x-vertical-center {
  margin-top: 0;
  margin-bottom: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
`
    return text;
}
