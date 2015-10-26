"use strict";

/*
  Embedly Block
*/

var Block = require('../block');
var $ = require('jquery');

module.exports = Block.extend({

  type: 'embedly',
  title: function() { return i18n.t('blocks:embedly:title'); },

  droppable: false,
  pastable: true,

  icon_name: 'embed',

  editorHTML: '<div class="st-block__editor st-type-embedly"></div>',

  loadData: function(data){
    this.$editor.html(data.html.replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
  },

  onContentPasted: function(event, target){
    this.handleDropPaste($(event.target).val());
  },

  handleDropPaste: function(data){
    this.setAndLoadData({
      html: data.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    });
    this.$inputs.hide();
    this.$editor.find('div').html(data);
    this.$editor.show();
  }

});
