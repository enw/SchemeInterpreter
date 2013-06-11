/*jslint node:true nomen:true */
/*
Based on (metacircular Scheme) evaluateuator in Structure and
Interpretation of Computer Programs (SICP) but not so meta! 
    http://mitpress.mit.edu/sicp/full-text/book/book-Z-H-26.html#%_sec_4.1.1

The model has two basic parts:

1. To evaluateuate a combination (a compound expression other than a special form), evaluateuate the subexpressions and then apply the value of the operator subexpression to the values of the operand subexpressions.

2. To apply a compound procedure to a set of arguments, evaluateuate the body of the procedure in a new environment. To construct this environment, extend the environment part of the procedure object by a frame in which the formal parameters of the procedure are bound to the arguments to which the procedure is applied.
*/

function EWLang() {
    "use strict";
    
    // get token value, type
    function getTokenType(tok) {return tok.type; }
    function getTokenValue(tok) {return tok.value; }

    // returns parse tree
    this.parse = require('./lib/parser');

        
    // helper function()
    function first(list) { return list[0]; }
    function rest(list) { return list.slice(1); }
    function isTaggedList(expl, tag) {
        return Array.isArray(expl) && getTokenValue(expl[0]) === tag;
    }
        
    // set up the 'global' environment
    var Environment = require('./lib/Environment'),
        _env = new Environment(),
        evaluate,
        apply,
        
        // for adding types of objects the evaluateuator can handle at runtime
        expressionTypes = [],
        addExpressionType = this.addExpressionType = function (type, test, evaluator) {
            expressionTypes.push({ type: type, test: test, evaluator: evaluator});
            //            console.log("ADD EXPRESSION TYPE", type, expressionTypes);
        };

        
    // built-in-functions
    // TODO: make this programmatic...?
    _env.set("+", function () {
        var sum = 0,
            i;
        for (i = 0; i < arguments.length; i += 1) {
            sum += arguments[i];
        }
        return sum;
    });
    _env.set("*", function () {
        var product = 1,
            i;
        for (i = 0; i < arguments; i += 1) {
            product *= arguments[i];
        }
        return product;
    });
        
    function isString(token) { return typeof token === 'string'; }
    function isSymbol(token) { return getTokenType(token) === 'symbol'; }
    function isNumber(token) { return typeof token === 'number'; }
    function makeSymbol(value) {
        return { type: 'symbol', value: value };
    }
    function makeBooleanSymbol(jsBool) {
        return makeSymbol((jsBool) ? '#t' : '#f');
    }
    function isBoolean(token) {
        return isSymbol(token)
            && (getTokenValue(token) === '#t'
                || getTokenValue(token) === '#f');
    }
    function getNumber(token) { return getTokenValue(token); }
    function getString(token) { return getTokenValue(token); }
    
    // returns javascript boolean
    function isTrue(token) { return '#t' === getTokenValue(token); }

    function getOperator(app) {
        return app[0];
    }

    function getOperands(app) {
        return app.slice(1);
    }

    // create parse tree from expression
    // @expl : list of tokens
    // returns : one expression or value
    // example expl input - [{"type":"symbol","value":"+"},1,[{"type":"symbol","value":"*"},5,2]]
    evaluate = this.evaluate = function (expl, env) {
//console.log("evaluate this",expl);
        if (!env) {
            env = _env;
        }

        function getSelfEvaluateuatingValue(token) {
            var atom;
            if (isNumber(token)) {
                return getNumber(token);
            } else if (isBoolean(token)) {
                return isTrue(token);
            } else if (isString(token)) {
                return getString(token);
            }
            throw ('ERROR:getSelfEvaluateuatingValue' + JSON.stringify(token));
        }
        
        /*
          the core of the evaluateuator

          primitive expressions - self-evaluateuating expressions, variables in env
          special forms -
              - quoted expressions 
              - assignment - computes value, updates environment
              - if expression
              - lambda
              - begin(NOT YET HANDLED)
              - cond(NOT YET HANDLED)
        */
        var handled = false,
            test,
            evaluator,
            i;
        for (i = 0; i < expressionTypes.length; i += 1) {
            test = expressionTypes[i].test;
            evaluator = expressionTypes[i].evaluator;
            if (test(expl, env)) {
                handled = true;
                return evaluator(expl, env);
            }
        }

        // not handled
        throw ("Unknown expression type -- EVALUATE -- " + JSON.stringify(expl));
    };  // evaluate

    // self-evaluateuating things like bools, numbers
    function isSelfEvaluateuating(token) {return isNumber(token) || isBoolean(token) || isString(token); }
    function evaluateSelfEvaluateuating(token) {
        return token;
    }
    addExpressionType("self-evaluateuating", isSelfEvaluateuating, evaluateSelfEvaluateuating);

    // variables
    function isVariable(token, env) { return getTokenType(token) === 'symbol'
            && env.isDefined(getTokenValue(token)); }
    function evaluateVariable(token, env) { return env.get(getTokenValue(token)); }
    addExpressionType("variable", isVariable, evaluateVariable);

    // quoted -(quote <anything>)
    function isQuote(expl) { return isTaggedList(expl, 'quote'); }
    function evaluateQuote(expl, env) { return first(rest(expl)); }
    addExpressionType("quote", isQuote, evaluateQuote);

    // assignment -(set! <var> <value>)
    function isAssignment(expl) {
        //            console.log("isAssignment", expl, isTaggedList(expl, 'set!'));
        return isTaggedList(expl, 'set!');
    }
    function evaluateAssignment(expl, env) {
        env.set(expl[1], expl[2]);
        return "ok";// + JSON.stringify(env.list());
    }
    addExpressionType("assignment", isAssignment, evaluateAssignment);

    // if 
    function isIf(expl) {
        //console.log('isIf', expl);
        return isTaggedList(expl, 'if');
    }

    // helper
    function makeIf(predicate, consequent, alternative) {
        return [ makeSymbol('if'), consequent, alternative ];
    }

    function evaluateIf(expl, env) {
        function predicate(expl) {
            return first(rest(expl));
        }
        function consequent(expl) {
            return first(rest(rest(expl)));
        }
        function alternative(expl) {
            var alt = first(rest(rest(rest(expl))));
            return alt || makeBooleanSymbol(false);
        }

        if (isTrue(evaluate(predicate(expl)))) {
            return evaluate(consequent(expl), env);
        } else {
            return evaluate(alternative(expl), env);
        }
    }
    addExpressionType("if", isIf, evaluateIf);

    // compound procedures are constructed from parameters,
    // procedure bodies and environments
    function makeCompoundProcedure(parameters, body, env) {
        return {
            type: 'procedure',
            parameters: parameters,
            body: body,
            environment: env
        };
    }
    function isCompoundProcedure(proc) {
        return proc && proc.type && proc.type === 'procedure';
    }

    // lambda
    function isLambda(sexp) {
        return isTaggedList(sexp, 'lambda');
    }
    function makeLambda(expl, env) {
        function lambda_parameters(expl) {
            return first(rest(expl));
        }
        function lambda_body(expl) {
            return first(rest(rest(expl)));
        }
        return makeCompoundProcedure(lambda_parameters(expl),
                               lambda_body(expl),
                               env);
    }
    addExpressionType('lambda', isLambda, makeLambda);

    function evaluateListOfValues(list, env) {
        if (list.length === 0) {
            return [];
        } else {
            return [ evaluate(list[0], env) ].concat(
                evaluateListOfValues(list.slice(1), env)
            );
        }
    }
    
    // applications
    function isApplication(sexp) { return Array.isArray(sexp); }
    function evaluateApplication(expl, env) {
        return apply(evaluate(getOperator(expl), env),
                      evaluateListOfValues(getOperands(expl), env));
    }
    addExpressionType("application", isApplication, evaluateApplication);

    function isPrimitiveProcedure(proc) {
        return typeof proc === 'function';
    }
    
    // is this modifying, changing the proc and environment rather than
    // just applying it?
    function applyLambda(proc, args) {
        // extend environment with arguments
        var env = proc.environment,
            i;
        for (i = 0; i < args.length; i += 1) {
            env.set(proc.parameters[i].value, args[i]);
        }
        return evaluate(proc.body, env);
//        return proc.environment.list();
    }

    // apply primitive and compound(multi-step) procedures
    apply = this.apply = function (procedure, args) {
        if (isPrimitiveProcedure(procedure)) {
            // just apply the procedure
            return procedure.apply({}, args);
        } else if (isCompoundProcedure(procedure)) {
            console.log("TODO:replace applyLambda with evaluateSequence!");
            return applyLambda(procedure, args);
        } else {
            throw ("ERROR: apply uncaught::" + JSON.stringify(procedure) + "::" + args);
        }
    };
}


module.exports = EWLang;

// tests
var lisper = new EWLang();
function test(type, s) {
    "use strict";

    function interpret(s) {
        return lisper.evaluate(lisper.parse(s));
        //             return lisper.parse(s);
    }
    var results = interpret(s);
    console.log("TEST", type, s, '=', results);
}

// just run tests if this is the main file
if (!module.parent) {
    console.log('Testing Enterpreter...');


    test('number', '1');
    test('bool', '#t');
    test('bool', '#f');
    test('string', '"hello, world!"');
    test('apply', '(+ 1 2)');
    test('apply recurse', '(+1(*5 2))');
    test('assignment(set!)', '(set! "age" 37)');
    test('assignment(set!)', '(set! "weight" 135.6)');
    test('just-set value in environment(weight)', 'weight');
    test('set value in environment', 'age');
    //test('value not set in environment', 'height'); // triggers blocking error
    test('quote a number', '(quote 1)');
    test('quote a list', '(quote(1 2 3))');
    test('if expression', '(if #t "GOOD" "BAD")');
    test('if expression', '(if #f "BAD" "GOOD")');
    test('if expression', '(if #t(+(* 3(+ 3000  1) 5)) "BAD")');
    test('if expression', '(if #f(+ 665 1) "GOOD")');
    test('if expression', '(if #f(+ 665 1))');

    test('lambda', '(lambda(x)(+ 3 x))');
    test('evaluate lambda - should return 6', '((lambda(x)(+ 3 x)) 3)');
}
