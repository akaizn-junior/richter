//Rich Te/xt Edito/r - Richter
import toolbarTools from './toolbar-tools.json';

export default class Richter {
    constructor(settings) {
        if(settings.makeDOM && true) {
            this.makeDOM(settings.refElement);
        } else {
            //build with an existing element by default
            this.build();
        }
        //enable/disable Session Storage - its enabled by default
        this._SSpageAutoSave(settings.enableSS);
    }

    //build the editor
    build() {
        //grab the element with an id of richter-editor
        let richter = document.getElementById('richter-editor');
        this.createEditor(richter);
    }

    //make the editor and attach it to a reference element
    makeDOM(attachTo) {
        let richter = document.createElement('div');
        richter.id = 'richter-editor';
        this.createEditor(richter);
        //finally if there is a reference element attach the editor to it
        let refElement = document.getElementById(attachTo);
        refElement.appendChild(richter);
    }

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

        //create the actual toolbar with all of the tools
        this.createToolbar(richterToolbar);
    }

    createToolbar(richterToolbar) {
        //create and append buttons
        richterToolbar.appendChild(this.createToolbarButtons());
        //create and append menus
        richterToolbar.appendChild(this.createToolbarMenus());
    }

    createToolbarButtons() {
        //create/append toolbar buttons
        //create a div container for buttons
        let buttonsBox = document.createElement('div');
        buttonsBox.id = 'richter-toolbar-buttons';
        toolbarTools.buttons.forEach(button => {
            //create a button as a span
            let btn = document.createElement('span');
            //create an image for the button icon
            let img = document.createElement('img');
            img.src = `client/assets/richter/${button.image}`;
            img.title = button.text;
            //append the image to the span
            btn.appendChild(img);
            //append this button to the toolbar
            buttonsBox.appendChild(btn);

            //add the behavior of this button
            btn.onclick = () => {
                this.formatDocument(button.command);
            };
        });

        return buttonsBox;
    }

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

    formatDocument(command, value) {
        //document.execCommand allows format commands to be run
        //on the text input of a content editable element.
        switch (command) {
        case 'cleanDoc':
            if(this.richterConfirm('Want to erase everything?', 'Yes', 'No')) {
                console.log('true');
                //grab the editor's page
                let richterPage = document.getElementById('richter-page');
                richterPage.innerHTML = '';
            }
            break;
        case 'formatblock': document.execCommand(command, 'blockquote'); break;
        case 'printDoc': this.printPage(); break;
        default: document.execCommand(command, false, value);
        }
    }

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

    //Session Storage
    _SSsaveState(sName, sValue) {
        //use session storage to store the state of the editor
        sessionStorage.setItem(sName, sValue);
    }

    _SSgetState(sName) {
        //get the state of an element
        //verify if the session exists
        if(sessionStorage.getItem(sName)) {
            //return the value if it exists
            return sessionStorage.getItem(sName);
        }
        //return -1 to indicate that the state does not exist
        return -1;
    }

    //page session storage autosave
    //true by default
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

    //Read session data
    _SSread() {
        //Check for page session data
        let richterPage = document.getElementById('richter-page');
        let _SSpage = this._SSgetState('page');
        if(_SSpage !== -1) richterPage.innerHTML = _SSpage;
    }

    /**
     * EXTRA EXTRA
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
