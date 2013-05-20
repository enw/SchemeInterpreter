function EWLang () {
    // returns list of tokens
    this.lex = function (input) {
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
    
    // create parse tree from expression
    // @expl : list of tokens
    // returns : one expression or value
    var eval = this.eval = function ( expl, env ) {
        var environment = (env)?env:new Environment();
        var car = expl[0];
        var cdr = expl.slice(1);

        // self-evaluating things like bools, numbers
        function isAtomic(exp) {
            //            console.log("isAtomic", exp);            
            return /[0-9]/.test(exp.value);
        }

        if (isAtomic(car)) {
            return car.value;
        } else {
            console.log("TODO:eval:",expl);
            return "TODO:eval:"+expl;
        }
    };  // eval

    // environment in which to evaluate fxn
    function Environment () {
        var entries = {};
    }
}


module.exports = EWLang;


function interpret(s) {
    return lisper.eval(lisper.lex(s));
}
function test (type, s) {
    console.log("TEST",type, interpret(s));
}

var lisper = new EWLang;
test("int","1");
test("string","'abc'"); // ???
test("sexp","(+ 1 2)");
//console.log("parsed raw input into operators, numbers & identifiers\n", lisp.eval(lisp.lex("(+ 1 (* 2 3))")));
