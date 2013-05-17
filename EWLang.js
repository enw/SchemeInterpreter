// maybe use regex instead of old-school javascript string.indexOf()...

function Tokenizer () {
    var whitespace = "\n\r\t\m ";
    function isWhitespace (char) {
        return whitespace.indexOf(char) != -1;
    }

    var digits = "0123456789";
    function isDigit ( char ) {
        return digits.indexOf(char) != -1;
    }

    var operators = "()";
    function isOperator ( char ) {
        return operators.indexOf(char) != -1;
    }

    var chars="~!@#$%^&*_+-=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\][|}{';:/.,?><\"";
    function isChar ( char ) {
        return chars.indexOf(char) != -1;
    }

    // returns string of tokens
    this.parse = function (input) {
        var c, i=0, tokens = [];
        function advance () {
            return c=input[++i];
        }
        function addToken(type, value) {
            tokens.push({type:type, value:value});
        }

        // do magic
        while (i<input.length) {
            c=input[i];
            if (isWhitespace(c)) advance();
            else if (isOperator(c)) {
                addToken("operator", c);
                advance();
            } else if (isDigit(c)) {
                var num = c;
                while (isDigit(advance())) num += c;
                if (c === '.') {
                    do num += c; while (isDigit(advance()));
                }
                num = parseFloat(num);
                addToken("number", num);
            } else if (isChar(c)) {
                var idn = c;
                while (isChar(advance())) idn += c;
                addToken("identifier", idn);
            };
        }
        return tokens;
    } // function 
}


module.exports = Tokenizer;


/*
var tok = new Tokenizer;
console.log("parsed raw input into operators, numbers & identifiers\n", tok.parse("(123 abc 231)"));
*/