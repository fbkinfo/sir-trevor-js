"use strict";

/* Our base formatters */

var Formatter = require('./formatter');

var Bold = Formatter.extend({
  title: "bold",
  cmd: "bold",
  keyCode: 66,
  text : "B"
});

var Italic = Formatter.extend({
  title: "italic",
  cmd: "italic",
  keyCode: 73,
  text : "i"
});

var Strike = Formatter.extend({
  title: "strike",
  cmd: "strikeThrough",
  keyCode: 68,
  text : "S"
});

var Link = Formatter.extend({

  title: "link",
  iconName: "link",
  cmd: "CreateLink",
  text : "link",

  onClick: function() {

    // редактирование существующего текста ссылки
    var selection = window.getSelection(),
      node,
      initial_link = '';

    if (selection.rangeCount > 0) {
      node = selection.getRangeAt(0)
        .startContainer
        .parentNode;
      if (node && node.nodeName === "A" && node.getAttribute('href')) {
        initial_link = node.getAttribute('href');
      }
    }

    var link = window.prompt(i18n.t("general:link"), initial_link),
      link_regex = /((ftp|http|https):\/\/.)|mailto(?=\:[-\.\w]+@)/;

    if (link && link.length > 0) {

      if (!link_regex.test(link)) {
        link = "http://" + link;
      }

      // экранирую скобки, чтобы не было проблем с парсингом Markdown-ссылок
      link = link.replace('(', '%28').replace(')', '%29');

      document.execCommand(this.cmd, false, link);

    }
  },

  isActive: function() {
    var selection = window.getSelection(),
    node;

    if (selection.rangeCount > 0) {
      node = selection.getRangeAt(0)
      .startContainer
      .parentNode;
    }

    return (node && node.nodeName === "A");
  }
});

var UnLink = Formatter.extend({
  title: "unlink",
  iconName: "link",
  cmd: "unlink",
  text : "link"
});

var Hint = Formatter.extend({

  title: "hint",
  cmd: "CreateHint",
  text : "?",

  getSelectionHtml: function () {
    var html = "";
    if (typeof window.getSelection !== "undefined") {
      var sel = window.getSelection();
      if (sel.rangeCount) {
        var container = document.createElement("p");
        for (var i = 0, len = sel.rangeCount; i < len; ++i) {
          container.appendChild(sel.getRangeAt(i).cloneContents());
        }
        html = container.innerHTML;
      }
    } else if (typeof document.selection !== "undefined") {
      if (document.selection.type === "Text") {
        html = document.selection.createRange().htmlText;
      }
    }
    return html;
  },

  onClick: function() {

    // редактирование существующего текста ссылки
    var selection = window.getSelection(),
      node,
      initial_hint = '';

    if (selection.rangeCount > 0) {
      node = selection.getRangeAt(0)
        .startContainer
        .parentNode;
      if (node && node.nodeName === "ABBR" && node.getAttribute('title')) {
        initial_hint = node.getAttribute('title');
      }
    }

    var hint = window.prompt('Текст подсказки:', initial_hint);
    var selected_text = this.getSelectionHtml();

    if (hint && hint.length > 0) {
      // заменяю скобки, чтобы не было проблем с парсингом Markdown-ссылок
      hint = hint.replace(/"/g, '&quot;').replace(/'/g, '&quot;').replace(/\{/g, '[').replace(/}/g, ']');
      document.execCommand('insertHTML', false, '<abbr title="' + hint + '">' + selected_text + '</abbr>');
    } else {
      if (hint === '' && node && node.nodeName === "ABBR") {
        node.parentNode.removeChild(node);
        document.execCommand('insertText', false, selected_text + ' ');
      }
    }
  },

  isActive: function() {
    var selection = window.getSelection(),
    node;

    if (selection.rangeCount > 0) {
      node = selection.getRangeAt(0)
      .startContainer
      .parentNode;
    }

    return (node && node.nodeName === "ABBR");
  }
});

exports.Bold = new Bold();
exports.Italic = new Italic();
exports.Strike = new Strike();
exports.Link = new Link();
exports.Unlink = new UnLink();
exports.Hint = new Hint();
