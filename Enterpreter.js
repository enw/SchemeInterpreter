/*
Based on (metacircular Scheme) evaluator in Structure and
Interpretation of Computer Programs (SICP) -
http://mitpress.mit.edu/sicp/full-text/book/book-Z-H-26.html#%_sec_4.1.1

The model has two basic parts:

1. To evaluate a combination (a compound expression other than a special form), evaluate the subexpressions and then apply the value of the operator subexpression to the values of the operand subexpressions.

2. To apply a compound procedure to a set of arguments, evaluate the body of the procedure in a new environment. To construct this environment, extend the environment part of the procedure object by a frame in which the formal parameters of the procedure are bound to the arguments to which the procedure is applied.
*/

function EWLang () {
    // get token value, type
    function getTokenType(tok) {return tok.type};
    function getTokenValue(tok) {return tok.value};

    // returns parse tree
    this.parse = require ('./lib/parser');

    // environment in which to evaluate fxn
    var Environment = require ('./lib/Environment');

    // set up env
    function makeInitialEnvironment() {
        var env = new Environment();
        
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

    // 'global' environment
    var _env = makeInitialEnvironment();
            
    // create parse tree from expression
    // @expl : list of tokens
    // returns : one expression or value
    // example expl input - [{"type":"symbol","value":"+"},1,[{"type":"symbol","value":"*"},5,2]]
    var eval = this.eval = function ( expl, env ) {
console.log("eval this",expl);
        var env = (env)?env:_env;

        function isString(token) { return typeof token == 'string'; };
        function isSymbol(token) { return getTokenType(token) == 'symbol'; };
        function isNumber(token) { return typeof token == 'number'; };
        function makeSymbol ( value ) {
            return { type:'symbol', value:value };
        }
        function makeBooleanSymbol ( jsBool ) {
            return makeSymbol ( (jsBool)?'#t':'#f' );
        };
        function isBoolean(token) {
            return isSymbol(token) 
                && (getTokenValue(token) == '#t' 
                    || getTokenValue(token) =='#f')};
        function getNumber(token) { return getTokenValue(token); };
        function getString(token) { return getTokenValue(token); };
        
        // constructors
        function makeProcedure ( parameters, body, env ) {
            return { type: 'procedure',
                     parameters:parameters, 
                     body: body,
                     env: env
                   };
        };
        function isProcedure ( expl ) {
            return exp && exp.type && exp.type == 'procedure';
        };

        // returns javascript boolean
        function isTrue(token) { return '#t'==getTokenValue(token); };

        function getSelfEvaluatingValue(token) { 
            var atom;
            if (isNumber(token)) {
                return getNumber(token);
            } else if (isBoolean(token)) {
                return isTrue(token);
            } else if (isString(token)) {
                return getString(token);
            };
            throw('ERROR:getSelfEvaluatingValue'+JSON.stringify(token)); 
        };
        
        // self-evaluating things like bools, numbers
        function isSelfEvaluating(token) { return isNumber(token) || isBoolean(token) || isString(token); };
        function evalSelfEvaluating(token) { 
/*
            if (isBoolean(token)) { // output #t, #f as #t, #f

                token.inspect = function () { return token.value; }
            } 
*/
            return token; 
        };
        addExpressionType ("self-evaluating", isSelfEvaluating, evalSelfEvaluating);

        // helper function()
        function first ( list ) { return list[0]; };
        function rest ( list ) { return list.slice(1); };
        function isTaggedList ( expl, tag ) {
//            console.log("isTaggedList", expl[0], tag);
            return Array.isArray(expl) && getTokenValue(expl[0]) == tag;
        }

        // variables
        function isVariable(token){ return getTokenType(token) == 'symbol' 
                && env.isDefined(getTokenValue(token)); };
        function evalVariable(token){ return env.get(getTokenValue(token)); };
        addExpressionType ("variable", isVariable, evalVariable);

        // quoted - (quote <anything>)
        function isQuote ( expl ) { return isTaggedList(expl, 'quote'); }
        function evalQuote( expl, env ) { return first(rest ( expl )); }
        addExpressionType ( "quote", isQuote, evalQuote );

        // assignment - (set! <var> <value>)
        function isAssignment ( expl ) { 
            //            console.log("isAssignment", expl, isTaggedList(expl, 'set!'));
            return isTaggedList(expl, 'set!');
        };
        function evalAssignment(expl, env) {
            env.set(expl[1], expl[2]);
            return "ok";// + JSON.stringify(env.list());
        }
        addExpressionType ("assignment", isAssignment, evalAssignment);

        // if 
        function isIf ( expl ) {
            //console.log('isIf', expl);
            return isTaggedList(expl, 'if');
        }

        // helper
        function makeIf ( predicate, consequent, alternative ) {
            return [ makeSymbol('if'), consequent, alternative ];
        }

        function evalIf (expl, env) {
            function predicate ( expl ) {
                return first( rest ( expl) );
            };
            function consequent ( expl ) {
                return first ( rest ( rest ( expl ) ) );
            };
            function alternative ( expl ) {
                var alt = first ( rest ( rest ( rest ( expl ))));
                return (alt)?alt:makeBooleanSymbol(false);
            };

            if ( isTrue ( eval (predicate ( expl ) ) )) {
                return eval ( consequent ( expl ), env );
            } else {
                return eval ( alternative ( expl ), env );
            }
        }
        addExpressionType ("if", isIf, evalIf);

        // lambda
        function isLambda ( sexp ) { 
//console.log("isLambda", sexp, isTaggedList(expl, 'lambda'));
return isTaggedList(expl, 'lambda'); };
        function evalLambda ( expl, env ) {
            function lambda_parameters ( expl ) {
console.log("lambda_parameters", expl);
                return first ( rest ( expl ) );
            };
            function lambda_body ( expl ) {
                return first ( rest ( rest ( expl ) ) );
            };
            return makeCompoundProcedure ( lambda_parameters( expl ), 
                                   lambda_body ( expl ),
                                   env);
        }
        addExpressionType ("lambda", isLambda, evalLambda);


        // applications
        function isApplication(sexp) { return Array.isArray(sexp); }
        function evalApplication(expl, env) {
            return apply( eval(getOperator(expl), env), 
                          evalListOfValues(getOperands(expl), env));
        };
        addExpressionType ("application", isApplication, evalApplication);
        
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
          the core of the evaluator

          primitive expressions - self-evaluating expressions, variables in env
          special forms -
              - quoted expressions 
              - assignment - computes value, updates environment
              - if expression
              - lambda
              - begin (NOT YET HANDLED)
              - cond ( NOT YET HANDLED)
        */
        for (var i=0;i<expressionTypes.length;i++) {
            var test = expressionTypes[i].test,
                evaluate = expressionTypes[i].evaluator;
            if ( test(expl) ) {
//console.log("***",expl,"is a",expressionTypes[i].type);
                return evaluate(expl,env);
            } else {
//console.log("***",expl,"is not a",expressionTypes[i].type);
            }
        }
        // not handled
        throw("Unknown expression type -- EVAL -- "+ JSON.stringify(expl));
    };  // eval

    // for adding types of objects the evaluator can handle at runtime
    var expressionTypes = [];
    var addExpressionType = this.addExpressionType = function ( type, test, evaluator ) {
        expressionTypes.push ( { type:type, test:test, evaluator:evaluator} )
        //            console.log("ADD EXPRESSION TYPE", type, expressionTypes);
    }

    function isPrimitiveProcedure( proc ) {
        return typeof proc == 'function';
    }
    
    // compound procedures are constructed from parameters,
    // procedure bodies and environments
    function makeCompoundProcedure ( parameters, body, env )  {
        return {
            type: 'procedure',
            parameters:parameters,
            body: body,
            environment: env
        };
    }
    function isCompoundProcedure( proc ) {
        return proc && proc.type && proc.type == 'procedure';
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
}


module.exports = EWLang;

// just run tests if this is the main file
if (!module.parent) {
    console.log('Testing Enterpreter...');

    var lisper = new EWLang;

    function test (type, s) {
        function interpret(s) {
            return lisper.eval(lisper.parse(s));
        //        return lisper.parse(s);
        }
            var results = interpret(s);
        console.log("TEST",type,s,'=',results);
    }


/*
    test('number','1');
    test('bool','#t');
    test('bool','#f');
    test('string','"hello, world!"');
    test('apply','(+ 1 2)');
    test('apply recurse','(+ 1 (* 5 2))');
    test('assignment (set!)','(set! "age" 37)');
    test('assignment (set!)','(set! "weight" 135.6)');
    test('just-set value in environment (weight)','weight');
    test('set value in environment','age');
    //test('value not set in environment','height'); // triggers blocking error
    test('quote a number','(quote 1)');
    test('quote a list','(quote (1 2 3))');
    test('if expression','(if #t "GOOD" "BAD")');
    test('if expression','(if #f "BAD" "GOOD")');
    test('if expression','(if #t (+ (* 3 (+ 3000  1) 5) ) "BAD")');
    test('if expression','(if #f (+ 665 1) "GOOD" )');
    test('if expression','(if #f (+ 665 1) )');
*/
    test('lambda','(lambda (x) (+ 3 x))');
}
