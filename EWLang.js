function EWLang () {
    // token, string, etc
    function makeToken(type, value) {return {type:type, value:value}};
    //    function makeString(value) {return {type:'string', value:value}};
    function makeString(value) {return value;};
    function getTokenType(tok) {return tok.type};
    function getTokenValue(tok) {return tok.value};

    // get token value

    // returns parse tree
    this.parse = function (input) {
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
                addToken("number", num);
            } else if (isQuote(c)) {
                var quote=c;
                advance();
                var str=c;
                while (advance()!=quote) str += c;
                advance();
                addToken("string",str);

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
                    token = getToken('list', []);
                    while (!isCloseParen(advance())) {
                        addChild(token, next());
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
    
    // create parse tree from expression
    // @expl : list of tokens
    // returns : one expression or value
    var eval = this.eval = function ( expl, env ) {
        var env = (env)?env:makeInitialEnvironment();
        
        // parsed tokens
        var car = expl[0];
        var cdr = expl.slice(1);

        // set up env
        function makeInitialEnvironment() {
            var env = new Environment();
            // the usual first message...
            env.set("hello", makeString("Hello world!"));
            
            //  built-in-functions
            env.set("+", function() {
                    var sum=0;
                    for (var i in arguments) sum+=arguments;
                    return sum;
            });
            return env;
        }

        // self-evaluating things like bools, numbers
        function isAtom(token) { return isNumber(token) || isBoolean(token) || isString(token); };
        function isString(token) { return getTokenType(token) == 'string'; };
        function isSymbol(token) { return getTokenType(token) == 'symbol'; };
        function isNumber(token) { return getTokenType(token) == 'number'; };
        function isBoolean(token) {
            return isSymbol(token) 
                && (getTokenValue(token) == '#t' 
                    || getTokenValue(token) =='#f')};
        function getNumber(token) { return getTokenValue(token); };
        function getString(token) { return getTokenValue(token); };
        function getBoolean(token) { return '#t'==getTokenValue(token); };
        function getAtom(token) { 
            var atom;
            if (isNumber(token)) {
                return getNumber(token);
            } else if (isBoolean(token)) {
                return getBoolean(token);
            } else if (isString(token)) {
                return getString(token);
            };
            throw('ERROR:getAtom'+JSON.stringify(token)); 
        };

        // variables
        function isVariable(token){ return getTokenType(token) == 'symbol' 
                && env.isDefined(getTokenValue(token)); };
        function getVariable(token){ return env.get(getTokenValue(token)); };

        //
        if (isAtom(car)) {
            return getAtom(car);
        } else if (isVariable(car)) {
            return getVariable(car);
        } else {
            console.log(expl);
            throw("ERROR: unable to eval. Not defined in environment::"+ expl);
        }
    };  // eval

    // environment in which to evaluate fxn
    this.makeEnvironment = function (parent) {
        return new Environment(parent);
    }
    var Environment = function (parent) {
        var entries = {};
        this.list = function () {
            if (parent) {
                var union = parent.list();
                for (var i in entries) {
                    union[i.name] = entries[i];
                }
                entries = union;
            }
            return entries;
        }
        this.isDefined = function( name ) {
            return entries[name] != undefined;
        }
        this.set = function(name, value){
            entries[name]={name:name,value:value};
        };
        this.get = function (name) {
            if (entries[name]) {
                return entries[name].value;
            } else {
                if (parent) {
                    return parent.get(name);
                } else {
                    return null;
                }
            }
        }
    }
}


module.exports = EWLang;


function interpret(s) {
    return lisper.eval(lisper.parse(s));
}
function test (type, s) {
    //    var results = interpret(s);
    var results = lisper.parse(s);
    console.log("TEST",type,s,'=',JSON.stringify(results));
}

var lisper = new EWLang;

test("int","1");
test("bool","#t");
test("bool","#f");
test("string",'"hello, world!"');
test("value in environment","hello");
//test("value not defined in environment","no_hello");
//test("apply","(+ 1 2)");
test("apply","(+ 1 2)");
test("apply recurse","(+ 1 (* 5 2))");
test("sexp","(+ 1 2)");
//console.log("parsed raw input into operators, numbers & identifiers\n", lisp.eval(lisp.parse("(+ 1 (* 2 3))")));
/*

var parentEnv = lisper.makeEnvironment();
parentEnv.set("cat", "Samuel");

// test environment
var env = lisper.makeEnvironment(parentEnv);
console.log("Environment",env);
env.set("sayHello", function() {console.log('sayHello')});
env.set("name", "Todd Rundgren");
env.set("age", 32);
console.log("Environment",env.list());
*/