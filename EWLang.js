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
            //            tokens.push({type:type, value:value});
            tokens.push(value);
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
        var env = (env)?env:makeInitialEnvironment();
        var car = expl[0];
        var cdr = expl.slice(1);

        // set up env
        function makeInitialEnvironment() {
            var env = new Environment();
            // the usual first message...
            env.set("hello", "Hello world!");
            
            //  built-in-functions
            env.set("+", function() {
                    var sum=0;
                    for (var i in arguments) sum+=arguments;
                    return sum;
            });
            return env;
        }

        // self-evaluating things like bools, numbers
        function isAtom(exp) { return /[0-9]|true|false/.test(exp); };
        function getAtom(exp) { return exp; };

        // variables
        function isVariable(exp){ return env.isDefined(exp); };
        function getVariable(exp){ return env.get(exp); };

        //
        if (isAtom(car)) {
            return car;
        } else if (isVariable(car)) {
            //            console.log("GOT VARIABLE", car, isVariable(car));
            return getVariable(car);
        } else {
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
    return lisper.eval(lisper.lex(s));
}
function test (type, s) {
    var results = interpret(s);
    console.log("TEST",type, results);
}

var lisper = new EWLang;

test("int","1");
test("bool","true");
test("value in environment","hello");
//test("value not defined in environment","no_hello");
test("apply","(+ 1 2)");
/*
test("apply","(+ 1 2)");
test("apply recurse","(+ 1 (* 5 2))");
test("sexp","(+ 1 2)");
//console.log("parsed raw input into operators, numbers & identifiers\n", lisp.eval(lisp.lex("(+ 1 (* 2 3))")));
*/
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