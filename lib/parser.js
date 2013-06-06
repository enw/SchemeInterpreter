module.exports = function (input) {
    // token, string, etc
    function makeToken(type, value) {return {type:type, value:value}};
    //    function makeString(value) {return {type:'string', value:value}};
    function makeString(value) {return value;};

    var whitespace = "\n\r\t\m ";
    function isWhitespace (char) {
        return whitespace.indexOf(char) != -1;
    }

    var digits = "0123456789";
    function isDigit ( char ) {
        return digits.indexOf(char) != -1;
    }

    var parens = "()";
    function isParen ( char ) {
        return parens.indexOf(char) != -1;
    }

    var chars="~!@#$%^&*_+-=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\][|}{'\";:/.,?><";
    function isChar ( char ) {
        return chars.indexOf(char) != -1;
    }

    var quotes="'\"";
    function isQuote ( char ) {
        return quotes.indexOf(char) != -1;
    }

    var c, i=0, tokens = [];
    function advance () {
        return c=input[++i];
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
    while (i<input.length) {
        c=input[i];
        if (isWhitespace(c)) advance();
        else if (isParen(c)) {
            addToken("paren", c);
            advance();
        } else if (isDigit(c)) {
            var num = c;
            while (isDigit(advance())) num += c;
            if (c === '.') {
                do num += c; while (isDigit(advance()));
            }
            num = parseFloat(num);
            addNumber(num);
        } else if (isQuote(c)) {
            var quote=c;
            advance();
            var str=c;
            while (advance()!=quote) str += c;
            advance();
            addString(str);

        } else if (isChar(c)) {
            var idn = c;
            while (isChar(advance())) idn += c;
            addToken("symbol", idn);
        };
    }

    // the one token to return
    function makeParseTree(input) {
        var token,
        i = 0,
        s=input,
        c = s[i] // char
        ;

        function advance() {
            c = s[++i];
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
                return c.type == 'paren' && c.value == '(';
            }
            function isCloseParen(token) {
                return c.type == 'paren' && c.value == ')';
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
        var ret = next();
        return ret;
    } // makeParseTree
    return makeParseTree(tokens);
}; // parse

// do tests if this is run directly
if (!module.parent) {
    console.log("TODO: run tests");
}
