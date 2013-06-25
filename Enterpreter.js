/*jslint node:true nomen:true */
/*
Based on (metacircular Scheme) evaluator in Structure and
Interpretation of Computer Programs (SICP) but not so meta! 
    http://mitpress.mit.edu/sicp/full-text/book/book-Z-H-26.html#%_sec_4.1.1

The model has two basic parts:

1. To evaluate a combination (a compound expression other than a special form), evaluate the subexpressions and then apply the value of the operator subexpression to the values of the operand subexpressions.

2. To apply a compound procedure to a set of arguments, evaluate the body of the procedure in a new environment. To construct this environment, extend the environment part of the procedure object by a frame in which the formal parameters of the procedure are bound to the arguments to which the procedure is applied.
*/

function EWLang() {
    "use strict";

    // helper
    function getErrorString(which, details) {
        return EWLang.prototype.ERROR[which] + (details) ? (' - ' + details) : '';
    }

    // get token value, type
    function getTokenType(tok) {return tok.type; }
    function getTokenValue(tok) {return tok.value; }
    
    // for conditionals, we accept anything to be true that is not the explicit 'false' object
    function isFalse(token) { return '#f' === getTokenValue(token); }
    function isTrue(token) { return !isFalse(token); }

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
        
        // for adding types of objects the evaluator can handle at runtime
        expressionTypes = [],
        addExpressionType = this.addExpressionType = function (type, test, evaluator) {
            expressionTypes.push({ type: type, test: test, evaluator: evaluator});
            //            console.log("ADD EXPRESSION TYPE", type, expressionTypes);
        };

        
    // built-in-functions
    // TODO: make this programmatic...?
    _env.defineVariable('+', function () {
        var sum = 0,
            i;
        for (i = 0; i < arguments.length; i += 1) {
            sum += arguments[i];
        }
        return sum;
    });
    _env.defineVariable('*', function () {
        var product = 1,
            i;
        for (i = 0; i < arguments.length; i += 1) {
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
    this.isTrue = isTrue;

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
        if (!env) {
            env = _env;
        }

        function getSelfEvaluatingValue(token) {
            var atom;
            if (isNumber(token)) {
                return getNumber(token);
            } else if (isBoolean(token)) {
                return isTrue(token);
            } else if (isString(token)) {
                return getString(token);
            }
            throw ('ERROR:getSelfEvaluatingValue' + JSON.stringify(token));
        }
        
        /*
          the core of the evaluator

          primitive expressions - self-evaluating expressions, variables in env
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
//        throw new Error(EWLang.prototype.ERROR.UNKNOWN_EXPRESSION_TYPE);
        throw new Error(EWLang.prototype.ERROR.UNKNOWN_EXPRESSION_TYPE);
    };  // evaluate

    // self-evaluating things like bools, numbers
    function isSelfEvaluating(token) {return isNumber(token) || isBoolean(token) || isString(token); }
    function evaluateSelfEvaluating(token) {
        return token;
    }

    // variables
    function isVariable(token, env) { return getTokenType(token) === 'symbol'
            && env.lookupVariableValue(getTokenValue(token)); }
    function evaluateVariable(token, env) { return env.lookupVariableValue(getTokenValue(token)); }

    // quoted -(quote <anything>)
    function isQuote(expl) { return isTaggedList(expl, 'quote'); }
    function evaluateQuote(expl, env) { return first(rest(expl)); }

    // assignment -(set! <var> <value>)
    function isAssignment(expl) {
        //            console.log("isAssignment", expl, isTaggedList(expl, 'set!'));
        return isTaggedList(expl, 'set!'); 
        
    }
    function evaluateAssignment(expl, env) {
        return env.setVariableValue(expl[1].value, expl[2]);
//        return "ok";// + JSON.stringify(env.list());
    }

    // definition -(define <var> <value>)
    function isDefinition(expl) {
        return isTaggedList(expl, 'define');
    }
    function variableDefinition(expl) {
        if (isSymbol(expl)) {
            return getTokenValue(expl);
        } else {
            return evaluate(expl);
        }
    }
    function evaluateDefinition(expl, env) {
        var name = variableDefinition(expl[1]),
            value = evaluate(expl[2], env);
        env.defineVariable(variableDefinition(expl[1]), evaluate(expl[2], env));
        return name;
    }

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

    // helper
    function evaluateSequence ( seq, env ) {
        //console.log("evaluateSequence", seq);
        if (seq.length == 1) {
            return evaluate(first(seq), env)
        } else {
            evaluate(first(seq));
            return evaluateSequence(rest(seq), env);
        }
    }

    // begin
    function isBegin(sexp) {
        return isTaggedList(sexp, 'begin');
    }
    function evaluateBegin(sexp, env) {
        // (eval-sequence (begin-actions exp) env))
        return evaluateSequence(rest(sexp), env);
    }
    
    // cond
    function isCond(sexp) {
        return isTaggedList(sexp, 'cond');
    }
    function evaluateCond(sexp, env) {
        return "TODO";
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
            return rest(rest(expl));
        }
        return makeCompoundProcedure(lambda_parameters(expl),
                               lambda_body(expl),
                               env);
    }

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

    // different than in SICP, where it's a tagged list starting with 'primitive'
    function isPrimitiveProcedure(proc) {
        return typeof proc === 'function';
    }

    // is this modifying, changing the proc and environment rather than
    // just applying it?
    function applyLambda(proc, args) {
        /*
        (eval-sequence
        (procedure-body procedure)
        (extend-environment
        (procedure-parameters procedure)
        arguments
        (procedure-environment procedure))))
            */
        // extend environment with arguments
        var env = proc.environment,
            i;
        for (i = 0; i < args.length; i += 1) {
            env.defineVariable(proc.parameters[i].value, args[i]);
        }
//        console.log("APPLY LAMBDA", proc);
        return evaluateSequence(proc.body, env);
//        return proc.environment.list();
    }

    // apply primitive and compound(multi-step) procedures
    apply = this.apply = function (procedure, args) {
        if (isPrimitiveProcedure(procedure)) {
            // just apply the procedure
            return procedure.apply({}, args);
        } else if (isCompoundProcedure(procedure)) {
            /*
             (eval-sequence
             (procedure-body procedure)
             (extend-environment
             (procedure-parameters procedure)
             arguments
             (procedure-environment procedure))))
             */
            return applyLambda(procedure, args);
        } else {
            throw ("ERROR: apply uncaught::" + JSON.stringify(procedure) + "::" + args);
        }
    };
    
    // expression types
    addExpressionType("self-evaluating", isSelfEvaluating, evaluateSelfEvaluating);
    addExpressionType("variable", isVariable, evaluateVariable);
    addExpressionType("quoted", isQuote, evaluateQuote);
    addExpressionType("assignment", isAssignment, evaluateAssignment);
    addExpressionType("definition", isDefinition, evaluateDefinition);
    addExpressionType("if", isIf, evaluateIf);
    addExpressionType('lambda', isLambda, makeLambda);
    addExpressionType('begin', isBegin, evaluateBegin);
    addExpressionType('cond', isCond, evaluateCond);
    addExpressionType("application", isApplication, evaluateApplication);

} // EWLang

// 
EWLang.prototype.ERROR = {
    UNKNOWN_EXPRESSION_TYPE: "Unknown expression type - EVAL",
    UNBOUND_VARIABLE: "Unbound Variable"
};

module.exports = EWLang;
