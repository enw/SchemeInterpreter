/*jslint node:true nomen:true */
/*global it, expect, describe */
// uses jasmine-node-karma
// https://npmjs.org/package/jasmine-node-karma
"use strict";

var Enterpreter = require('../Enterpreter');
var e = new Enterpreter();
function evaluate(s) {
    return e.evaluate(e.parse(s));
}
describe('Enterpreter Suite', function () {
    it('evaluates numbers',
        function () {
            expect(evaluate('1')).toBe(1);
        });
    it('evaluates booleans',
        function () {
            var t = evaluate('#t'),
                f = evaluate('#f');

            expect(e.isTrue(t)).toBe(true);
            expect(e.isTrue(f)).toBe(false);
        });
    it('evaluates strings',
         function () {
           // wrap string in single-quotes
            function wrapString(s) {
                return "'" + s + "'";
            }
            var s = 'Hello, World!';
            expect(evaluate(wrapString(s))).toBe(s);

            s = 'chicken fish soup';
            expect(evaluate(wrapString(s))).toBe(s);
        });
    it('evaluates application of primitive procedures',
        function () {
            expect(evaluate('(+ 1 2)')).toBe(3);
            expect(evaluate('(* 1 2)')).toBe(2);
        });
    it('recursively evaluates primitive procedures',
        function () {
            expect(evaluate('(+ 1 (* 5 2))')).toBe(11);
            expect(evaluate('(+ (* 5 2) 1)')).toBe(11);
        });
    it('allows defining and getting of variables in the environment',
        function () {
            expect(evaluate('( define age 32 )')).toBe('age');
            expect(evaluate('( define weight 135.6)')).toBe('weight');
            expect(evaluate('age')).toBe(32);
            expect(evaluate('weight')).toBe(135.6);
        });
    it('allows setting and getting of variables in the environment',
        function () {
            expect(evaluate('( define age 32 )')).toBe('age');
            expect(evaluate('( define weight 135.6)')).toBe('weight');
            expect(evaluate('( set! age 88 )')).toBe(88);
            expect(evaluate('( set! weight 240.9)')).toBe(240.9);
            expect(evaluate('age')).toBe(88);
            expect(evaluate('weight')).toBe(240.9);
        });
    it('does not allow setting of undefined variables',
        function () {
            expect(function () {evaluate('( set! undefinedThing 32 )'); }).toThrow(
                e.ERROR.UNBOUND_VARIABLE
            );
        });
    it('throws an error if you evaluate something not defined in the environment',
        function () {
            expect(function () {evaluate('notdefined'); }).toThrow(
                e.ERROR.UNBOUND_VARIABLE
            );
        });
    it('handles quoted numbers and lists',
        function () {
            expect(evaluate('(quote 1)')).toBe(1);
            expect(evaluate('(quote (1 2 3))')).toMatch([1, 2, 3]);
        });

    it('evaluates if expressions',
        function () {
            expect(evaluate('( if #t "YES" "NO" )')).toBe("YES");
            expect(evaluate('( if #f "YES" "NO" )')).toBe("NO");
            expect(evaluate('( if #t ( + 3 ( * 2 9 ) ) "NO" )')).toBe(21);
        });

    it('lambda expression is a procedure',
        function () {
            expect((function () {
                var ret = evaluate('( lambda ( x ) ( + x 3 ) )');
                return ret.type === 'procedure';
            }())).toBe(true); // add 3
        });
    it('executes lambda expressions',
        function () {
            expect(evaluate('(( lambda ( x ) ( + x 3 )) 3)')).toBe(6); // add 3
        });
    it('executes lambda expressions with sequences',
        function () {
            expect(evaluate('(( lambda ( x ) (define y 3) ( + y 3 )) 3)')).toBe(6); // add 3
        });
    it('executes begin expressions',
        function () {
            expect(evaluate('(begin (define x 7) (define y 32) (+ x y))')).toBe(39);
        });
    // the first derived expression...
    // this is somewhat complex
    // i.e. there are a number of cases for cond
    it('executes cond expressions',
        function () {
            // empty cond is false
            var emptyCond = evaluate('(cond)');
            expect(e.isTrue(emptyCond)).toBe(false);

            

            // else should be last
            expect(evaluate('(cond (else 369))')).toBe(369);

            // evaluate sequence
            expect(evaluate('(cond (else (+ 3 2) (+ 366 3)))')).toBe(369);

            // handle a sequence of clauses
            expect(evaluate('(cond (#f 222) (else 123 555 369))')).toBe(369);
            expect(evaluate('(cond (#t 222) (else 369))')).toBe(222);
            expect(evaluate('(cond (#f 222) (#t 595) (else 369))')).toBe(595);

            // this should fail...
            expect(function () {evaluate('( cond (else 369) (#t 3))'); }).
                toThrow(e.ERROR.COND_EARLY_ELSE);
        });
    it('supports defining of lambdas',
        function () {
            // define function 
            expect(evaluate(
                "(define cons (lambda (x y) (lambda (m) (m x y))))"
            )).toBe("cons");

            expect(evaluate(
                "(define car (lambda (z) (z (lambda (p q) p))))"
            )).toBe("car");

            expect(evaluate(
                "(define cdr (lambda (z) (z (lambda (p q) q))))"
            )).toBe("cdr");

            // function is defined
            expect((function () {
                var ret = evaluate("cons");
                return ret.type === 'procedure';
            }())).toBe(true);
        });

    it('supports execution of user-defined lambdas',
        function () {
            var dottedPair = evaluate("(cons 1 2)"),
                environmentValues = dottedPair.environment.data(),
                car = evaluate("(car (cons 1 2))"),
                cdr = evaluate("(cdr (cons 1 2))");

            // function can be called
            expect(environmentValues.x).toBe(1);
            expect(environmentValues.y).toBe(2);
            expect(car).toBe(1);
            expect(cdr).toBe(2);
        });
});
