function EWLang () {
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

    var chars="~!@#$%^&*_+-=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\][|}{';:/.,?><\"";
    function isChar ( char ) {
        return chars.indexOf(char) != -1;
    }

    // returns list of tokens
    this.lex = function (input) {
        var c, i=0, tokens = [];
        function advance () {
            return c=input[++i];
        }
        function addToken(type, value) {
            tokens.push({type:type, value:value});
        }

        // create list of tokens
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
                addToken("number", num);
            } else if (isChar(c)) {
                var idn = c;
                while (isChar(advance())) idn += c;
                addToken("operator", idn);
            };
        }
        return tokens;
    }; // lex
    
    // create parse tree from list of tokens
    // @input : list of tokens from lex
    this.parse = function ( input ) {
        function isOperation ( input ) {
            
        }

        // turn flat list of tokens (including parens) in to list including lists
        function listify ( input ) {
            function isList(input) {
                // lists start with parens
                return (input.type == "paren" && input.value == "(");
            }

            var c, i=0; rl=[];
            while (i<input.length) {
                c=input[i];
                console.log("listify", isList(c)); rl.push(c);
                i++;
            }
            return rl;
        }

        var tlist = listify (input);
        return tlist;
    };  // parse

    // environment in which to evaluate fxn
    function Environment () {
        var entries = {};
    }

    // evaluate a parse tree
    this.eval = function ( fxn, environment ) {
    }; // eval

    // lex, parse, eval
    this.interpret = function ( lispString ) {
        return this.parse ( this.lex( lispString ) );
    }; // interpret
}


module.exports = EWLang;


var tok = new EWLang;
console.log("parsed raw input into operators, numbers & identifiers\n", tok.interpret("(+ 1 (* 2 3))"));
