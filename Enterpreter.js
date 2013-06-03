/*
Based on (metacircular Scheme) evaluator in Structure and
Interpretation of Computer Programs (SICP) -
http://mitpress.mit.edu/sicp/full-text/book/book-Z-H-26.html#%_sec_4.1.1

The model has two basic parts:

1. To evaluate a combination (a compound expression other than a special form), evaluate the subexpressions and then apply the value of the operator subexpression to the values of the operand subexpressions.

2. To apply a compound procedure to a set of arguments, evaluate the body of the procedure in a new environment. To construct this environment, extend the environment part of the procedure object by a frame in which the formal parameters of the procedure are bound to the arguments to which the procedure is applied.
*/

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
    
    // create parse tree from expression
    // @expl : list of tokens
    // returns : one expression or value

    // example expl input - [{"type":"symbol","value":"+"},1,[{"type":"symbol","value":"*"},5,2]]
    var eval = this.eval = function ( expl, env ) {
        var env = (env)?env:makeInitialEnvironment();

        // set up env
        function makeInitialEnvironment() {
            var env = new Environment();
            // the usual first message...
            env.set("hello", makeString("Hello world!"));
            
            //  built-in-functions
            // TODO: make this programmatic...?
            env.set("+", function() {
                    var sum=0;
                    for (var k in arguments) sum+=arguments[k];
                    return sum;
            });
            env.set("*", function() {
                    var product=1;
                    for (var k in arguments) product *=arguments[k];
                    return product;
            });
            return env;
        }

        // self-evaluating things like bools, numbers
        function isSelfEvaluating(token) { return isNumber(token) || isBoolean(token) || isString(token); };


        function isString(token) { return typeof token == 'string'; };
        function isSymbol(token) { return getTokenType(token) == 'symbol'; };
        function isNumber(token) { return typeof token == 'number'; };
        function isBoolean(token) {
            return isSymbol(token) 
                && (getTokenValue(token) == '#t' 
                    || getTokenValue(token) =='#f')};
        function getNumber(token) { return getTokenValue(token); };
        function getString(token) { return getTokenValue(token); };
        function getBoolean(token) { return '#t'==getTokenValue(token); };
        function getSelfEvaluatingValue(token) { 
            var atom;
            if (isNumber(token)) {
                return getNumber(token);
            } else if (isBoolean(token)) {
                return getBoolean(token);
            } else if (isString(token)) {
                return getString(token);
            };
            throw('ERROR:getSelfEvaluatingValue'+JSON.stringify(token)); 
        };

        // variables
        function isVariable(token){ return getTokenType(token) == 'symbol' 
                && env.isDefined(getTokenValue(token)); };
        function getVariable(token){ return env.get(getTokenValue(token)); };

        // 
        function isApplication(sexp) {
            return Array.isArray(sexp);
        }
        
        function getOperator(app) {
            return app[0];
        }

        function getOperands(app) {
            return app.slice(1);
        }
        
        function evalListOfValues( list, env) {
            if (list.length == 0) {
                return [];
            } else {
                return [ eval (list[0], env) ].concat( 
                    evalListOfValues ( list.slice(1), env));
            }
        }

        /*
          Assignments have the form (set! <var> <value>):
         */
        function isAssignment ( expl ) {
            return expl && expl.type && expl.type == "set!";
        };

        /*
          the core of the evaluator

          primitive expressions - self-evaluating expressions, variables in env
          special forms -
              - quoted expressions (NOT HANDLED)
              - assignment - computes value, updates environment (NOT YET HANDLED)
              - if expression (NOT YET HANDLED)
              - lambda (NOT YET HANDLED)
              - begin (NOT YET HANDLED)
              - cond ( NOT YET HANDLED)
        */
        if (isSelfEvaluating(expl)) {
            return expl;
        } else if (isVariable(expl)) {
            return getVariable(expl);
        } else if (isApplication(expl)) {
            return apply( eval(getOperator(expl), env), 
                          evalListOfValues(getOperands(expl), env));
        } else {
            throw("Unknown expression type -- EVAL -- "+ JSON.stringify(expl));
        }
    };  // eval


    function isPrimitiveProcedure( proc ) {
        return typeof proc == 'function';
    }
    
    // compound procedures are constructed from parameters,
    // procedure bodies and environments
    function makeCompoundProcedure ( parameters, body, env )  {
        return {
            parameters:parameters,
            body: body,
            environment: env
        };
    }
    function isCompoundProcedure( proc ) {
        return proc && proc.type == 'procedure';
    }

    

    // apply primitive and compound (multi-step) procedures
    var apply = this.apply = function ( procedure, arguments ) {
        if (isPrimitiveProcedure( procedure )) {
            return procedure.apply({}, arguments);
        } else if (isCompoundProcedure( procedure )) {
            throw "TODO: apply compound procedure";
        }else {
            throw ("ERROR: apply uncaught::"+JSON.stringify(procedure)+"::"+arguments);
        }
    }

    // environment in which to evaluate fxn
    this.makeEnvironment = function (parent) {
        return new Environment(parent);
    }
    var Environment = function (parent) {
        var entries = {};
        // returns string, number, boolean, list or symbolic expression
        function getValue(token) {
            if (token.value) {
                return token.value;
            } else {
                return token;
            }
        }
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
            entries[name]=value;
        };
        this.get = function (name) {
            if (entries[name]) {
                return getValue(entries[name]);
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
//        return lisper.parse(s);
}
function test (type, s) {
    var results = interpret(s);
    console.log("TEST",type,s,'=',JSON.stringify(results));
}

var lisper = new EWLang;

test('number','1');
test('bool','#t');
test('bool','#f');
test('string','"hello, world!"');
test('value in environment','hello');
//test('value not defined in environment','no_hello');
test('apply','(+ 1 2)');
test('apply recurse','(+ 1 (* 5 2))');
/*
var parentEnv = lisper.makeEnvironment();
parentEnv.set('cat', 'Samuel');

// test environment
var env = lisper.makeEnvironment(parentEnv);
console.log('Environment',env);
env.set('sayHello', function() {console.log('sayHello')});
env.set('name', 'Todd Rundgren');
env.set('age', 32);
console.log('Environment',env.list());
*/
