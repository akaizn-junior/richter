'use strict';

//chai for assertions
import { expect } from 'chai';

//Richter
import Richter from './Richter.js'

//JSDOM emulates DOM components in node globaly
import DOM from 'jsdom-global';
//Mock the DOM with implied html, head and body tags
DOM('<!DOCTYPE html><div id=\'richter\'></div><div id=\'editor\'></div>', {
    url: "https://richter.io/",
    contentType: "text/html"
});

describe('Richter', () => {
    it('should be a js class', () => {
        expect(Richter).to.be.a('function').that.respondsTo('constructor');
    });

    it('should have a build method', () => {
        expect(Richter).to.respondTo('build');
    });

    it('should have a makeDOM method', () => {
        expect(Richter).to.respondTo('makeDOM');
    });

    it('should build using div#richter in the mock DOM', () => {
        expect(new Richter()).to.be.an('object');
    });

    it('should build in the mock DOM by makeDOM', () => {
        expect(new Richter({ makeDOM: true, refElement: 'editor' }))
            .to.be.an('object');
    });

    it('should build a toolbar', () => {
        expect(document.getElementById('richter-toolbar')).to.be.an('HTMLDivElement');
    });

    it('should build a page', () => {
        expect(document.getElementById('richter-page')).to.be.an('HTMLDivElement');
    });

    it('should have an empty page', () => {
        expect(document.getElementById('richter-page').innerHTML).to.equal('');
    });
});

describe('Richter\'s Page', () => {
    //create the editor
    const editor = new Richter();
    //grab the page
    let rPage = document.getElementById('richter-page');
    let pageContent = 'Hello World!';

    it('should have content', () => {
        rPage.innerHTML = pageContent;
        expect(rPage.innerHTML).to.equal(pageContent);
    });
});
