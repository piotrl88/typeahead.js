/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

// inspired by https://github.com/jharding/bearhug

var highlight = function(doc) {
    "use strict";
    var defaults = {
        node: null,
        pattern: null,
        tagName: "strong",
        className: null,
        wordsOnly: false,
        caseSensitive: false
    };
    return function hightlight(o) {
        var regexTable;
        o = _.mixin({}, defaults, o);
        if (!o.node || !o.pattern) {
            return;
        }
        o.pattern = _.isArray(o.pattern) ? o.pattern : [ o.pattern ];
        regexTable = getRegex(o.pattern, o.caseSensitive, o.wordsOnly);
        traverse(o.node, hightlightTextNode);
        function hightlightTextNode(textNode) {
            var matchNode, wrapperNode,
              match,
              allMatch = true,
              text = textNode.data,
              matchesTable = [];

          _.each(regexTable, function(regex) {
            if (regex.exec(text)) {
	            match = regex.exec(text);
	            matchesTable.push({index: match.index, length: match[0].length});
	            text = text.substr(0, match.index) + getPipesString(match[0].length) +
			            text.substr(match.index + match[0].length);
            } else {
	            allMatch = false;
	            return false;
            }
          });

          if (allMatch) {
            matchesTable.sort(sortFromLast);
            _.each(matchesTable, function(match) {
	            matchNode = textNode.splitText(match.index);
	            matchNode.splitText(match.length);

	            wrapperNode = doc.createElement(o.tagName);
	            wrapperNode.appendChild(matchNode.cloneNode(true));

	            matchNode.parentNode.replaceChild(wrapperNode, matchNode);
            });
          }
          return !!allMatch;
        }

        function getPipesString(length) {
          var str = '', i;
          for (i = 0; i < length; i++) {
  	        str = str + '|';
          }
          return str;
        }

        function sortFromLast(a, b) {
          return a.index > b.index ? -1 : 1
        }

        function traverse(el, hightlightTextNode) {
            var childNode, TEXT_NODE_TYPE = 3;
            for (var i = 0; i < el.childNodes.length; i++) {
                childNode = el.childNodes[i];
                if (childNode.nodeType === TEXT_NODE_TYPE) {
                    i += hightlightTextNode(childNode) ? 1 : 0;
                } else {
                    traverse(childNode, hightlightTextNode);
                }
            }
        }
    };
    
    function getRegex(patterns, caseSensitive, wordsOnly) {
        var escapedPatterns = [], regexStr, regexTable;
        for (var i = 0, len = patterns.length; i < len; i++) {
            escapedPatterns.push(_.escapeRegExChars(patterns[i]));
        }
      regexStr = escapedPatterns[0];
      regexTable = regexStr.trim().split(/\s+/g);
      _.each(regexTable, function(str, i){
        str = wordsOnly ? "\\b(" + str + ")\\b" : "(" + str + ")";
        regexTable[i] =  caseSensitive ? new RegExp(str) : new RegExp(str, "i");
      });

        return regexTable;
    }
}(window.document);
