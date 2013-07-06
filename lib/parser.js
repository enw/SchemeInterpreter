/*jslint node:true nomen:true */

// support running as a commonJS module or in a browser
if (typeof module === 'undefined') { var module = {exports: {}}; }

var parse = module.exports.parser = function (input) {
    "use strict";
    
    // token, string, etc
    function makeToken(type, value) {return {type: type, value: value}; }
    //    function makeString(value) {return {type:'string', value:value}};
    function makeString(value) {return value; }

    var whitespace = "\n\r\t ",
        digits = "0123456789",
        parens = "()",
        chars = "~!@#$%^&*_+-=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ][|}{'\\\";:/.,?><",
        quotes = "'\"",
        c,
        i = 0,
        tokens = [],
        num,
        quote,
        str,
        idn;

    
    function isWhitespace(char) {
        return whitespace.indexOf(char) !== -1;
    }

    function isDigit(char) {
        return digits.indexOf(char) !== -1;
    }

    function isParen(char) {
        return parens.indexOf(char) !== -1;
    }

    function isChar(char) {
        return chars.indexOf(char) !== -1;
    }

    function isQuote(char) {
        return quotes.indexOf(char) !== -1;
    }

    function advance() {
        i += 1;
        c = input[i];
        return c;
    }
    function addNumber(num) {
        tokens.push(num);
    }
    function addString(str) {
        tokens.push(str);
    }
    function addToken(type, value) {
        tokens.push(makeToken(type, value));
        //tokens.push(value);
    }

    // lex/tokenize
    while (i < input.length) {
        c = input[i];
        if (isWhitespace(c)) {
            advance();
        } else if (isParen(c)) {
            addToken("paren", c);
            advance();
        } else if (isDigit(c)) {
            num = c;
            while (isDigit(advance())) {
                num += c;
            }
            if (c === '.') {
                do { num += c; } while (isDigit(advance()));
            }
            num = parseFloat(num);
            addNumber(num);
        } else if (isQuote(c)) {
            quote = c;
            advance();
            str = c;
            while (advance() !== quote) {
                str += c;
            }
            advance();
            addString(str);

        } else if (isChar(c)) {
            idn = c;
            while (isChar(advance())) { idn += c; }
            addToken("symbol", idn);
        }
    }

    // the one token to return
    function makeParseTree(input) {
        var token,
            i = 0,
            s = input,
            c = s[i]; // char
        

        function advance() {
            i += 1;
            c = s[i];
            return c;
        }

        // consume one token/char
        // if token is (, return a list with child tokens
        // else return a token
        function next() {
            function getToken(type, value) {
                return {
                    type: type,
                    value: value
                };
            }

            function addChild(token, child) {
                token.value.push(child);
            }
            var token;

            function isOpenParen(token) {
                return c.type === 'paren' && c.value === '(';
            }
            function isCloseParen(token) {
                return c.type === 'paren' && c.value === ')';
            }

            if (isOpenParen(c)) {
                token = [];
                while (!isCloseParen(advance())) {
                    token.push(next());
                }
            } else {
                token = c;
            }
            return token;
        }
        return next();
    } // makeParseTree
    return makeParseTree(tokens);
}; // parse

// do tests if this is run directly
/*
if (!module.parent) {
    console.log('Testing Parser...');

    var test = function (type, s) {
        "use strict";
        function interpret(s) {
            return parse(s);
        }
        var results = interpret(s);
        console.log("TEST", type, s, '=', results);
    };

    test('number', '1');
    test('bool', '#t');
    test('bool', '#f');
    test('string', '"hello, world!"');
    test('apply', '(+ 1 2)');
    test('apply recurse', '(+ 1 (* 5 2))');
    test('assignment (set!)', '(set! "age" 37)');
    test('assignment (set!)', '(set! "weight" 135.6)');
    test('just-set value in environment (weight)', 'weight');
    test('set value in environment', 'age');
    //test('value not set in environment', 'height'); // triggers blocking error
    test('quote a list', '(quote (1 2 3))');
}
*/
