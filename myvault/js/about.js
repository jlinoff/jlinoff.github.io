// display the about page
import { VERSION, BUILD, GIT_COMMIT_ID, GIT_BRANCH } from '/myvault/js/version.js'
import { xmake, hideAll, makeTextButton } from '/myvault/js/utils.js'
import { hideMenu  } from '/myvault/js/header.js'
import { common } from '/myvault/js/common.js'

export function showAboutPage(event) {
    hideAll()
    hideMenu()

    let top = document.getElementById('page-about')
    top.style.display = 'block' //  display this page
    top.xRemoveChildren()
    let project = 'https://github.com/jlinoff/myvault'
    let webapp = 'https://jlinoff.github.io/myvault'
    let help = '/myvault/help/index.html'

    let col1 = common.themes._activeProp().about.grid.col1
    let col2 = common.themes._activeProp().about.grid.col2

    top.xAppendChild(
        xmake('center')
            .xAppendChild(
                xmake('div').xStyle({height: '5px'}),
                xmake('div').xStyle(common.themes._activeProp().about.grid)
                    .xAddClass('x-theme-element')
                    .xAppendChild(
                        xmake('div').xStyle(col1).xInnerHTML('Author:'),
                        xmake('div').xStyle(col2).xInnerHTML('Joe Linoff'),
                        xmake('div').xStyle(col1).xInnerHTML('Copyright:'),
                        xmake('div').xStyle(col2).xInnerHTML('2021'),
                        xmake('div').xStyle(col1).xInnerHTML('License:'),
                        xmake('div').xStyle(col2).xInnerHTML('MIT Open Source'),
                        xmake('div').xStyle(col1).xInnerHTML('Version:'),
                        xmake('div').xStyle(col2).xInnerHTML(VERSION),
                        xmake('div').xStyle(col1).xInnerHTML('Build:'),
                        xmake('div').xStyle(col2).xInnerHTML(BUILD),
                        xmake('div').xStyle(col1).xInnerHTML('GitCommitId:'),
                        xmake('div').xStyle(col2).xInnerHTML(GIT_COMMIT_ID),
                        xmake('div').xStyle(col1).xInnerHTML('GitBranch:'),
                        xmake('div').xStyle(col2).xInnerHTML(GIT_BRANCH),
                        xmake('div').xStyle(col1).xInnerHTML('Project:'),
                        xmake('div').xStyle(col2).xInnerHTML(`${project}`)
                            .xStyle({cursor: 'pointer'}).xAddClass('x-hover').xTooltip('link to the project page')
                            .xAddEventListener('click', () => window.open(project, '_blank')),
                        xmake('div').xStyle(col1).xInnerHTML('Webapp:'),
                        xmake('div').xStyle(col2).xInnerHTML(`${webapp}`)
                            .xStyle({cursor: 'pointer'}).xAddClass('x-hover').xTooltip('link to the web app')
                            .xAddEventListener('click', () => window.open(webapp, '_blank')),
                        xmake('div').xStyle(col1).xInnerHTML('HelpDoc:'),
                        xmake('div').xId('x-about-help-link').xStyle(col2).xInnerHTML(`${help}`)
                            .xStyle({cursor: 'pointer'}).xAddClass('x-hover').xTooltip('link to the help page')
                            .xAddEventListener('click', () => window.open(help, '_blank')),
                    ),
            )
    )
}
