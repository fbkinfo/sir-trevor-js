"use strict";

var Block = require('../block');
var stToHTML = require('../to-html');

var ScribeListBlockPlugin = function(block) {
  return function(scribe) {
    scribe.el.addEventListener('keydown', function(ev) {
      var selection, range;

      if (ev.keyCode === 13 && !ev.shiftKey) { // enter pressed
        ev.preventDefault();

        // copy what's right of caret to
        // new list item
        selection = new scribe.api.Selection();
        range = selection.range.cloneRange();
        range.collapse(false);
        range.setEndAfter(scribe.el.lastChild, 0);

        var div = document.createElement('div');
        div.appendChild(range.extractContents());

        block.addListItemAfterCurrent(div.innerHTML);
      } else if (ev.keyCode === 8 && !block.hasLastListItem()) { // backspace pressed
        selection = new scribe.api.Selection();
        range = selection.range.cloneRange();

        if (scribe.getContent().length === 0) {
          block.removeCurrentListItem();
        } else if (range.startOffset === 0) {
          range.collapse(false);
          range.setEndAfter(scribe.el.lastChild, 0);

          var html = range.extractContents();

          block.removeCurrentListItem();
          block.appendToCurrentItem(html);
        }
      }
    });
  };
};


module.exports = Block.extend({
  type: 'list',
  title: function() { return i18n.t('blocks:list:title'); },
  icon_name: 'list',
  multi_editable: true,

  scribeOptions: { allowBlockElements: false },
  configureScribe: function(scribe) {
    scribe.use(new ScribeListBlockPlugin(this));
  },

  editorHTML: '<ul class="st-list-block__list"></ul>',
  listItemEditorHTML: '<li class="st-list-block__item"><div class="st-block__editor"></div></li>',

  initialize: function() {
    this.editorIds = [];
  },

  // Data functions (loading, converting, saving)
  beforeLoadingData: function() {
    this.setupListVariables();

    this.loadData(this._getData());
  },

  onBlockRender: function() {
    if (!this.ul) { this.setupListVariables(); }
    if (this.editorIds.length < 1) { this.addListItem(); }
  },

  setupListVariables: function() {
    this.$ul = this.$inner.find('ul');
    this.ul = this.$ul.get(0);
  },

  loadData: function(data) {
    var block = this;
    if (this.options.convertFromMarkdown && !data.isHtml) {
      data = this.parseFromMarkdown(data.text);
    }

    if (data.listItems.length) {
      data.listItems.forEach(function(li) {
        block.addListItem(li);
      });
    } else {
      block.addListItem();
    }
  },

  parseFromMarkdown: function(markdown) {
    var listItems = markdown.replace(/^ - (.+)$/mg,"$1").split("\n");
    listItems = listItems.map(function(item) {
      return stToHTML(item, this.type);
    }.bind(this));

    return { listItems: listItems, isHtml: true };
  },

  _serializeData: function() {
    var data = {isHtml: true, listItems: []};

    this.editorIds.forEach(function(editorId) {
      data.listItems.push(this.getTextEditor(editorId).scribe.getContent());
    }.bind(this));

    return data;
  },

  // List Items manipulation functions (add, remove, etc)
  addListItemAfterCurrent: function(content) {
    this.addListItem(content, this.getCurrentTextEditor());
  },

  addListItem: function(content, after) {
    content = content || '';
    if (content.trim() === "<br>") { content = ''; }

    var editor = this.newTextEditor(this.listItemEditorHTML, content);

    if (after && this.ul.lastchild !== after.node) {
      var before = after.node.nextSibling;
      this.ul.insertBefore(editor.node, before);

      var idx = this.editorIds.indexOf(after.id) + 1;
      this.editorIds.splice(idx, 0, editor.id);
    } else {
      this.$ul.append(editor.node);
      this.editorIds.push(editor.id);
    }

    editor.editor.focus();
  },

  focusOnNeighbour: function(item) {
    var idx = this.editorIds.indexOf(item.id);
    var neighbour = this.editorIds[idx - 1] || this.editorIds[idx + 1];

    if (neighbour) {
      var editorObj = this.getTextEditor(neighbour);
      editorObj.editor.focus();
    }
  },

  removeCurrentListItem: function() {
    if (this.editorIds.length === 1) { return; }

    var item = this.getCurrentTextEditor();
    var idx = this.editorIds.indexOf(item.id);

    this.focusOnNeighbour(item);
    this.editorIds.splice(idx, 1);
    this.ul.removeChild(item.node);
    this.removeTextEditor(item.id);
  },

  appendToCurrentItem: function(content) {
    this.appendToTextEditor(this.getCurrentTextEditor().id, content);
  },

  hasLastListItem: function() {
    return this.editorIds.length === 1;
  }

});
