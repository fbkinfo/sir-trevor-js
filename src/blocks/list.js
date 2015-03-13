"use strict";

var _ = require('../lodash');

var Block = require('../block');
var ScribeInterface = require('../scribe-interface');

var ScribeListBlockPlugin = function(scribe) {
  var block = this;

  scribe.el.addEventListener('focus', function() {
    // move caret to the end
  });

  scribe.el.addEventListener('keydown', function(ev) {
    if (ev.keyCode == 13 && !ev.shiftKey) { // enter pressed
      block.addNewItem();
      ev.preventDefault();
      return false;
    } else if (ev.keyCode == 8) {
      if (scribe.getContent() == 0) {
        block.removeCurrentItem();
      }
    }
  });
};

module.exports = Block.extend({

  type: 'list',

  title: function() { return i18n.t('blocks:list:title'); },

  scribeOptions: { allowBlockElements: false },

  editorHTML: '<ul class="st-list-block__list"></ul>',

  lineItemEditorHTML: '<li class="st-list-block__item"><div class="st-block__editor"></div></li>',

  icon_name: 'list',

  editors : {},

  loadData: function(data) {
    if (this.options.convertFromMarkdown && !data.isHtml) {
      data = this.parseFromMarkdown(data.text);
    }

    if (data.listItems.length) {
      data.listItems.forEach(function(li) {
        this.addNewItem(li);
      });
    } else {
      this.addNewItem();
    }
  },

  // migration from old data format
  parseFromMarkdown: function(markdown) {
    var listItems = markdown.replace(/^ - (.+)$/mg,"<li>$1</li>").split("\n");
    return { listItems: listItems, isHtml: true };
  },

  addNewItem: function(item) {
    this.$ul.append(this.lineItemEditorHTML);
    var itemEditor = this.$inner.find('.st-block__editor[contenteditable!="true"]');
    var id = _.uniqueId('list-editor');
    itemEditor.get(0).dataset.editorId = id;

    itemEditor
        .bind('keyup', this.getSelectionForFormatter)
        .bind('mouseup', this.getSelectionForFormatter)
        .bind('DOMNodeInserted', this.clearInsertedStyles);


    var config = function(scribe) {
      scribe.use(ScribeListBlockPlugin.bind(this));
    }.bind(this);

    var scribe = ScribeInterface.initScribeInstance(
      itemEditor.get(0), this.scribeOptions, config);

    itemEditor.focus();
    this.editors[id] = scribe;
  },

  removeCurrentItem: function() {
    if (Object.keys(this.editors).length > 1) {
      var editor = this.getCurrentEditor();
      var li = editor.el.parentNode;
      this.$ul.get(0).removeChild(li);
      delete this.editors[editor.el.dataset.editorId];
      return true;
    } else {
      return false;
    }
  },

  _serializeData: function() {
  },

  onBlockRender: function() {
    this.$ul = this.$inner.find('ul');
    this.addNewItem();
  },

  execTextBlockCommand: function(cmdName) {
    return ScribeInterface.execTextBlockCommand(this.getCurrentEditor(), cmdName);
  },

  queryTextBlockCommandState: function(cmdName) {
    return ScribeInterface.queryTextBlockCommandState(this.getCurrentEditor(), cmdName);
  },

  getCurrentEditor: function() {
    var editor = this.editors[document.activeElement.dataset.editorId];
    if (editor) {
      this.currentEditor = editor;
    }

    return this.currentEditor;
  },

  isEmpty: function() {
    var data = this.getBlockData();

    if (!data.isHtml) {
      return _.isEmpty(data.text);
    } else {
      return data.listItems.length;
    }
  }
});
