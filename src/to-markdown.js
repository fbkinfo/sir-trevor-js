'use strict';

var _ = require( './lodash' );
var utils = require( './utils' );


var normalizeWhitespaces = function ( content ) {

  content = content
    .replace( /&nbsp;/g, ' ' )
    .replace( /\n/g, '' );

  return content;

};

var normalizeBrTags = function ( content ) {

  content = content.replace( /<br\/?>(\s*<\/br>)?/gi, '<br>' );

  return content;

};

var removeBadThings = function ( content ) {

  content = content
    .replace( / class="?Mso[a-zA-Z]+"?/g, '' )
    .replace( /<!--.*?-->/g, '' )
    .replace( /\/\*.*?\*\//g, '' )
    .replace( /<\/?(meta|link|span|\\?xml:|st1:|o:|font).*?>/gi, '' )
    .replace( /<(style|script|applet|embed|noframes|noscript).*?\1.*?>/gi, '' );

  return content;

};

var removeEmptyTags = function ( content ) {

  content = content.replace( /<(\w+)(?:\s+\w+="[^"]+")*>((?:<br>|\s)*)<\/\1>/gi, '$2' );

  return content;

};

var escapeMarkdownChars = function ( content ) {

  content = content
    .replace( /\*/g, '\\*' )
    .replace( /\[/g, '\\[' )
    .replace( /\]/g, '\\]' )
    .replace( /\_/g, '\\_' )
    .replace( /\(/g, '\\(' )
    .replace( /\)/g, '\\)' )
    .replace( /\-/g, '\\-' )
    .replace( /~/g, '\\~' );

  return content;

};

var convertInlineTags = function ( content ) {

  var replaceTagAndAttr = function ( symbols ) {

    var openBody = symbols[ 0 ];
    var closeBody = symbols[ 1 ];
    var openData = symbols[ 2 ];
    var closeData = symbols[ 3 ];

    return function ( match, pAttr, pBefore, pText, pAfter ) { // jshint ignore:line

      return pBefore + openBody + pText + closeBody + openData + pAttr + closeData + pAfter;

    };

  };

  var replaceTag = function ( mark ) {

    return function ( match, pBefore, pText, pAfter ) {

      return pBefore + mark + pText + mark + pAfter;

    };

  };

  content = content.replace( /<(i|b|em|strong|strike)(?:\s+\w+="[^"]+")+>/gi, '<$1>' );

  content = content
    .replace( /<abbr.*?title=["'](.*?)["'].*?>((?:<br>|\s)*)([\s\S]*?)((?:<br>|\s)*)<\/abbr>/gi, replaceTagAndAttr( '[]{}' ) )
    .replace( /<a.*?href=["'](.*?)["'].*?>((?:<br>|\s)*)([\s\S]*?)((?:<br>|\s)*)<\/a>/gim, replaceTagAndAttr( '[]()' ) )
    .replace( /<strike>((?:<br>|\s)*)([\s\S]*?)((?:<br>|\s)*)<\/strike>/gi, replaceTag( '~~' ) )
    .replace( /<strong>((?:<br>|\s)*)([\s\S]*?)((?:<br>|\s)*)<\/strong>/gi, replaceTag( '**' ) )
    .replace( /<b>((?:<br>|\s)*)([\s\S]*?)((?:<br>|\s)*)<\/b>/gi, replaceTag( '**' ) )
    .replace( /<em>((?:<br>|\s)*)([\s\S]*?)((?:<br>|\s)*)<\/em>/gi, replaceTag( '_' ) )
    .replace( /<i>((?:<br>|\s)*)([\s\S]*?)((?:<br>|\s)*)<\/i>/gi, replaceTag( '_' ) );

  return content;

};

var convertNewlinesTags = function ( content ) {

  content = content
    .replace( /([^>])<div>/g, '$1\n' )
    .replace( /([^>])<p>/g, '$1\n\n' )
    .replace( /(<br>)?<\/div>/g, '\n' )
    .replace( /(<br>)?<\/p>/g, '\n\n' )
    .replace( /<br>/g, '\n' )
    .replace( /<\/?(div|p)>/g, '' )
    .replace( /(^\s+|\s+$)/, '' );

  return content;

};

var applyFormattersCustomFormatting = function ( content ) {

  var Formatters = require( './formatters' ); // intentionally deferring, circular dependency

  var formatName, format;

  for ( formatName in Formatters) {

    if ( ! Formatters.hasOwnProperty( formatName ) ) { continue; }

    format = Formatters[ formatName ];

    if ( ! _.isFunction( format.toMarkdown ) ) { continue; }

    content = format.toMarkdown( content );

  }

  return content;

};

var applyBlockCustomFormatting = function ( content, type ) {

  var Blocks = require( './blocks' ); // intentionally deferring, circular dependency

  if ( ! Blocks.hasOwnProperty( type ) ) { return content; }

  var block = Blocks[ type ];

  if ( ! _.isFunction( block.prototype.toMarkdown ) ) { return content; }

  content = block.prototype.toMarkdown( content );

  return content;

};

var removeRemainingTags = function ( content ) {

  content = content.replace( /<\/?[^>]+>/g, '' );

  return content;

};

var CHANGES = [

  normalizeWhitespaces,

  normalizeBrTags,
  
  removeBadThings,
  
  removeEmptyTags,

  escapeMarkdownChars,
  
  convertInlineTags,

  convertNewlinesTags,

  applyFormattersCustomFormatting,

  applyBlockCustomFormatting,

  removeRemainingTags

];

module.exports = function ( html, type ) {

  type = utils.classify( type );

  var markdown = html;

  for ( var i = 0; i < CHANGES.length; i++ ) {

    markdown = CHANGES[ i ]( markdown, type );

  }

  return markdown;

};
