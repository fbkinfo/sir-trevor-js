"use strict";

var _ = require('../lodash');
var $ = require('jquery');

var Block = require('../block');
var stToHTML = require('../to-html');

var template = '<div class="st-text-block st-required" contenteditable="true"><ul><li></li></ul></div>';

module.exports = Block.extend({

  type: 'list',

  title: function() { return i18n.t('blocks:list:title'); },

  icon_name: 'list',

  editorHTML: function() {
    return _.template(template, this);
  },

  loadData: function(data){
    this.getTextBlock().html('<ul>' + stToHTML(data.text, this.type) + '</ul>');
  },

  onBlockRender: function() {
    this.getTextBlock().on('click keyup focus', this.checkForList.bind(this));
    this.getTextBlock().on('keydown', this.handleEnter.bind(this));
  },

  checkForList: function() {
    if (this.$('ul').length === 0) {
      document.execCommand('insertUnorderedList', false, false);
    }
  },

  handleEnter: function(event) {
    if ( ! ( event.keyCode === 13 ) ) { return; }
    event.preventDefault();
    event.stopPropagation();
    if ( this.isEmpty() ) { return; }
    if ( ! window.getSelection ) { return; }
    var currentLi = $( window.getSelection().getRangeAt( 0 ).startContainer ).closest( 'li' );
    var newLi = $( '<li>' );
    newLi.insertAfter( currentLi );
    newLi.caretToStart();
  },

  toMarkdown: function(markdown) {
    markdown = markdown
      .replace(/<\/li>/mg, '\n')
      .replace(/<.+?>/g, '')
      .replace(/^(.+)$/mg, ' - $1');

    return markdown;
  },

  toHTML: function(html) {
    html = html
      .replace(/^ - (.+)$/mg, '<li>$1</li>')
      .replace(/\n/mg, '');

    return html;
  },

  onContentPasted: function(event, target) {
    this.$('ul').html(this.pastedMarkdownToHTML(target[0].innerHTML));
    this.getTextBlock().caretToEnd();
  },

  isEmpty: function() {
    return _.isEmpty(this.getBlockData().text);
  }

});
