(function(exports) {
	"use strict";
	exports.parse = function(str) {
		var toks = str.split(/(\s|\(|\)|'[^']*'|"[^"]*")/)
					.filter(function(el) { return (el !== "" && el !== " "); }),
			stripOuterQuotes = function(str) {
				var first = str.charAt(0),
					last = str.charAt(str.length - 1);

				if (first.search(/('|")/) !== -1 && first === last) {
					return str.substr(1, str.length - 2);
				} else {
					return str;
				}
			},
			constructML = function(toks) {
				var i, string, key, value,
					tok = toks.pop(),
					output = [],
					tag = null,
					attributes = [];

				while (tok !== ")") {
					if (tok === "(") {
						if (tag === null) {
							tok = toks.pop();
							tag = tok;
						} else {
							toks.push(tok);
							output.push(constructML(toks));
						}
					} else if (tok[0] === ":") {
						key = tok.substring(1);
						value = stripOuterQuotes(toks.pop());
						attributes.push([ key, value ]);
					} else {
						output.push(stripOuterQuotes(tok));
					}
					tok = toks.pop();
				}

				string = "<" + tag;
				for (i = 0; i < attributes.length; i++) {
					string += " " + attributes[i][0] + "='" + attributes[i][1] + "'";
				}
				string += ">" + output.join("") + "</" + tag + ">";
				return string;
			},
			balancedParentheses = toks.reduce(function(prev, cur) {
				var pdict = { "(": 1, ")": -1 };
				return prev + (cur in pdict ? pdict[cur] : 0);
			}, 0),
			validTags = toks.reduce(function(prev, cur, i, arr) {
				return (i > 0 ? (prev && (arr[i - 1] !== "(" || cur !== ")")) : prev);
			}, true);

		if (balancedParentheses !== 0) {
			throw new Error("Unbalanced or unexpected parentheses.");
		} else if (!validTags) {
			throw new Error("Invalid tag constructor.");
		}

		toks.reverse();

		return constructML(toks);
	};
})(typeof exports === "undefined" ? this : exports);
