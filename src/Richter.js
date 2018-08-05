// *******************************
// Rich Te/xt Edito/r - Richter
// *******************************

//The toolbar tools defined separately
import toolbarTools from './toolbar-tools.json';

export default class Richter {
    /**
     * Richter - Rich Te/xt Edito/r
     * @author Simao Nziaka
     * @version 0.1.0
     * @constructor
     * @param {object} settings Editor settings. Empty by default
     */
    constructor(settings={}) {
        /**
         * Create richter in the DOM and attach it to a given existing element
         */
        if(settings.makeDOM && true) {
            this.makeDOM(settings.refElement);
        }

        //build richter with an existing div#richter by default
        this.build();

        //enable/disable Session Storage - its enabled by default
        this._SSpageAutoSave(settings.enableSS);
    }

    /**
     * Build Richter based on an existing div#richter element
     */
    build() {
        //grab the element with an id of richter
        let richter = document.getElementById('richter');
        this.createEditor(richter);
    }

    /**
     * Make Richter in the DOM and attach it to a given element
     * @param {string} attachTo The element to attach the newly created div#richter
     */
    makeDOM(attachTo) {
        let richter = document.createElement('div');
        richter.id = 'richter';
        this.createEditor(richter);
        //finally if there is a reference element attach the editor to it
        let refElement = document.getElementById(attachTo);
        refElement.appendChild(richter);
    }

    // ***************************
    //    CREATE ELEMENTS
    // ***************************

    /**
     * Append all the other components (toolbar, page) to Richter
     * @param {HTMLElement} richter The editor
     */
    createEditor(richter) {
        //create a toolbar for the editor
        let richterToolbar = document.createElement('div');
        richterToolbar.id = 'richter-toolbar';
        //create the editor page
        let richterPage = document.createElement('div');
        richterPage.id = 'richter-page';
        //make the page editable
        richterPage.contentEditable = true;
        //Set the grammarly editor to false. In case the user has the extension, it will be disabled.
        richterPage.setAttribute('data-gramm_editor', 'false');

        //add the elements to the editor
        richter.appendChild(richterToolbar);
        richter.appendChild(richterPage);

        //add the default style
        richter.style = `
            min-width: 40em;
            border: 1px solid rgb(240, 240, 240);
            background: rgb(251, 251, 251);
        `;

        richterToolbar.style = `
            background: rgb(243, 239, 239);
            padding-bottom: 1px;
        `;

        richterPage.style = `
            min-height: 50em;
            padding: 5px;
            background: white;
            outline:none;
        `;

        //create the actual toolbar with all of the tools
        this.createToolbar(richterToolbar);
    }

    /**
     * Append buttons and menus to the toolbar
     * @param {HTMLDivElement} richterToolbar Richter's toolbar
     */
    createToolbar(richterToolbar) {
        //create and append buttons
        richterToolbar.appendChild(this.createToolbarButtons());
        //create and append menus
        richterToolbar.appendChild(this.createToolbarMenus());
    }

    /**
     * Create buttons for the toolbar based on the toolbarTools data
     * @property {object} toolbarTools JSON containing all the tools rendered in the toollbar
     * @returns {HTMLElement} The element containing all the buttons
     */
    createToolbarButtons() {
        //create/append toolbar buttons
        //create a div container for buttons
        let buttonsBox = document.createElement('div');
        buttonsBox.id = 'richter-toolbar-buttons';
        toolbarTools.buttons.forEach(button => {
            //create buttons
            let btn = document.createElement('button');
            btn.innerHTML = button.text.charAt(0).toLowerCase() + button.text.charAt(1).toLowerCase();
            btn.title = button.text;

            //add the default style
            btn.style = `
                cursor: pointer;
                padding-left: 5px;
                margin: 2px;
                border: 1px solid grey;
            `;

            //append this button to the toolbar
            buttonsBox.appendChild(btn);

            //add the behavior of this button
            btn.onclick = () => {
                this.formatDocument(button.command);
            };
        });

        return buttonsBox;
    }

    /**
     * Create menus for the toolbar based on the toolbarTools data
     * @property {object} toolbarTools JSON containing all the tools rendered in the toollbar
     * @returns {HTMLElement} The element containing all the menus
     */
    createToolbarMenus() {
        //create/append toolbar menus
        //create a div container for menus
        let menusBox = document.createElement('div');
        menusBox.id = 'richter-toolbar-menus';
        toolbarTools.menus.forEach(tool => {
            let toolMenu = document.createElement('select');
            //create a default option for the select
            let defaultOption = document.createElement('option');
            defaultOption.selected = true;
            defaultOption.disabled = true;
            defaultOption.innerText = tool.header;
            //append the default option to the mneu
            toolMenu.appendChild(defaultOption);
            //grab all the other options
            for(let value in tool.values) {
                let option = document.createElement('option');
                //set this value as the inner text
                option.innerText = tool.values[value];
                option.value = value;
                //add the option to the menu
                toolMenu.appendChild(option);
            }

            //add the behavior of this menu
            toolMenu.onchange = () => {
                //pass the tool command and this select element/option index value
                //so that when the selected item/option is selected
                //it value is used to format the document
                this.formatDocument(tool.command, toolMenu[toolMenu.selectedIndex].value);
            };

            //append the menu to the toolbar
            menusBox.appendChild(toolMenu);
        });

        return menusBox;
    }

    /**
     * Handles cases where the direct use of execCommand is not possible
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/document/execCommand | MDN: Document.execCommand}
     * @param {string} command The command to run using execCommand
     * @param {string} value The value of the command
     */
    formatDocument(command, value) {
        switch (command) {
        case 'cleanDoc':
            if(this.richterConfirm('Want to erase everything?', 'Yes', 'No')) {
                console.log('true');
                //grab the editor's page
                let richterPage = document.getElementById('richter-page');
                richterPage.innerHTML = '';
            }
            break;
        case 'printDoc': this.printPage(); break;
        default: document.execCommand(command, false, value);
        }
    }

    /**
     * Print the contents of the page
     */
    printPage() {
        /**
         * ALlow window print without any new wrapper window
         * Richter css defines a media query @media print
         * that alows only the richter page to be printed.
         *
         * For the overall website, the main style needs also a media query
         * that removes anything extra that might be printed
         *
         * Or just go ahead and implement a new wrapper window for print
         * window.open and window.write and add onload=window.print in the body tag
         */
        window.print();
    }

    // ***************************
    //    SESION STORAGE
    // ***************************

    /**
     * Save the state of an element in the session storage
     * @param {string} sName Session storage key
     * @param {string} sValue Session storage value
     */
    _SSsaveState(sName, sValue) {
        //use session storage to store the state of the editor
        window.sessionStorage.setItem(sName, sValue);
    }

    /**
     * Get the state of an element from the session storage
     * @param {string} sName Name of the item to read from the session storage
     * @returns {(string|number)} The value of the item read or -1 if no value found
     */
    _SSgetState(sName) {
        //get the state of an element
        //verify if the session exists
        if(window.sessionStorage.getItem(sName)) {
            //return the value if it exists
            return window.sessionStorage.getItem(sName);
        }
        //return -1 to indicate that the state does not exist
        return -1;
    }

    /**
     * Autosave the page in the session storage
     * @param {Boolean} _SSenable Enable page autosave by default
     */
    _SSpageAutoSave(_SSenable = true) {
        if(_SSenable) {
            //get the editor's page
            let richterPage = document.getElementById('richter-page');
            //listen for any change on input
            richterPage.oninput = () => {
                this._SSsaveState('page', richterPage.innerHTML);
            };
        }
        //Read the data back after saving it
        //this is safe to do since this function only runs once
        //a read from session storange is only done on loads
        this._SSread();
    }

    /**
     * Read session storage data
     */
    _SSread() {
        //Check for page session data
        let richterPage = document.getElementById('richter-page');
        let _SSpage = this._SSgetState('page');
        if(_SSpage !== -1) richterPage.innerHTML = _SSpage;
    }

    // ***************************
    //    EXTRA EXTRA
    // ***************************

    /**
     * Richter own confirm box
     * @param {string} message What to show in the confirm box
     * @param {string} btn1Label Label on the first button
     * @param {string} btn2Label Label on the second button
     * @returns {Boolean} True from btn1 and false for btn2
     */
    richterConfirm(message, btn1Label, btn2Label) {
        //create the confirm box
        let confirmBox = document.createElement('div');
        confirmBox.classList.add('confirm');
        confirmBox.innerHTML = `
        <p id='confirm-msg'>${message}</p>
        <div id='confirm-btns'>
        <button id='confirm-acceptBtn'>${btn1Label}</button>
        <button id='confirm-denyBtn'>${btn2Label}</button>
        </div>
        `;
        //append to the body of the document
        document.body.appendChild(confirmBox);
        //find the confirm box on the body
        //by accessing the last child element
        let confirmBoxBtns = document.body
            .children[document.body.children.length - 1]
            .children[1];

        //grab the buttons
        let btn1 = confirmBoxBtns.children[0];
        let btn2 = confirmBoxBtns.children[1];

        let ret;

        //listen for button clicks and return
        btn1.onclick = () => {
            ret = true;
        };
        btn2.onclick = () => {
            ret = false;
        };

        return ret;
    }
}

//export Richter as a class
module.exports = Richter;
