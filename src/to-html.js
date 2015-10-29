'use strict';

var _ = require( './lodash' );
var utils = require( './utils' );


var startWrap = function ( content, type, shouldWrap ) {

  if ( ! shouldWrap ) { return content; }

  content = '<div>' + content;

  return content;

};

var convertInlineTags = function ( content ) {

  var replaceTagAndAttr = function ( tag, attr ) {

    return function ( match, pText, pAttr ) {

      return '<' + tag + ' ' + attr + "='" + pAttr + "'>" + pText.trim().replace( /\n/g, '<br>' ) + '</' + tag + '>';

    };

  };

  var replaceTag = function ( tag ) {

    return function ( match, pBefore, pText ) {

      return pBefore + '<' + tag + '>' + pText.trim().replace( /\n/g, '<br>' ) + '</' + tag + '>±§';

    };

  };

  content = content
    .replace( /\[((?:\\\]|[^\]])+)\]\(([^\)]+)\)/g, replaceTagAndAttr( 'a', 'href' ) )
    .replace( /\[((?:\\\]|[^\]])+)\]\{([^\}]+)\}/g, replaceTagAndAttr( 'abbr', 'title' ) )
    .replace( /(^|[^\\])_((?:\\_|[^_])*[^_\\])(?=_)/g, replaceTag( 'i' )  ).replace( /\>±§_/g, '>' )
    .replace( /(^|[^\\])\*\*((?:\\\*|[^*])+)\*(?=\*)/g, replaceTag( 'b' ) ).replace( /\>±§\*/g, '>' )
    .replace( /(^|[^\\])~~((?:\\~|[^~])+)~(?=~)/g, replaceTag( 'strike' ) ).replace( /\>±§~/g, '>' )
    .replace( /^\> (.+)$/mg, '$1' );

  return content;

};

var applyFormattersCustomFormatting = function ( content ) {

  var Formatters = require( './formatters' ); // intentionally deferring, circular dependency

  var formatName, format;

  for ( formatName in Formatters) {

    if ( ! Formatters.hasOwnProperty( formatName ) ) { continue; }

    format = Formatters[ formatName ];

    if ( ! _.isFunction( format.toHTML ) ) { continue; }

    content = format.toHTML( content );

  }

  return content;

};

var applyBlockCustomFormatting = function ( content, type ) {

  var Blocks = require( './blocks' ); // intentionally deferring, circular dependency

  if ( ! Blocks.hasOwnProperty( type ) ) { return content; }

  var block = Blocks[ type ];

  if ( ! _.isFunction( block.prototype.toHTML ) ) { return content; }

  content = block.prototype.toHTML( content );

  return content;

};

var doNewlinesWrap = function ( content, type, shouldWrap ) {

  if ( ! shouldWrap ) { return content; }

  content = content.replace( /\n{2,}/g, function ( match ) {

    var result = '</div>';

    for ( var i = 1; i < match.length; i++ ) {

      result += '<div><br></div>';

    }

    result += '<div>';

    return result;

  } );

  return content;

};

var removeRemainingMarkdown = function ( content ) {

  content = content
    .replace( /\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;' )
    .replace( /\n/g, '<br>' )
    .replace( /~~/g, '' )
    .replace( /\*\*/g, '' )
    .replace( /__/g, '' );

  return content;

};

var unescapeMarkdownChars = function ( content ) {

  content = content
    .replace( /\\\*/g, '*' )
    .replace( /\\\[/g, '[' )
    .replace( /\\\]/g, ']' )
    .replace( /\\\_/g, '_' )
    .replace( /\\\(/g, '(' )
    .replace( /\\\)/g, ')' )
    .replace( /\\\-/g, '-' )
    .replace( /\\~/g, '~' );

  return content;

};

var finishWrap = function ( content, type, shouldWrap ) {

  if ( ! shouldWrap ) { return content; }

  content += '</div>';

  return content;

};

var CHANGES = [

  startWrap,

  convertInlineTags,

  applyFormattersCustomFormatting,

  applyBlockCustomFormatting,

  doNewlinesWrap,

  removeRemainingMarkdown,

  unescapeMarkdownChars,

  finishWrap

];

module.exports = function ( markdown, type ) {
  
  type = utils.classify( type );

  var html = markdown;

  var shouldWrap = type === 'Text';

  for ( var i = 0; i < CHANGES.length; i++ ) {

    html = CHANGES[ i ]( html, type, shouldWrap );

  }

  return html;

};
