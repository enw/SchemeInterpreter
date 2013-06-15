// uses jasmine-node-karma
// https://npmjs.org/package/jasmine-node-karma
var Enterpreter=require('../Enterpreter');
var e = new Enterpreter();
function evaluate(s) {
    return e.evaluate(e.parse(s));
};
describe('Enterpreter Suite', function () {
    it('evaluates numbers',
       function() {
           expect(evaluate('1')).toBe(1);
       });
    it('evaluates booleans',
       function() {
           var t=evaluate('#t'),
               f=evaluate('#f');

           expect(e.isTrue(t)).toBe(true);
           expect(e.isTrue(f)).toBe(false);
       });
    it('evaluates strings',
       function() {
           // wrap string in single-quotes
           function wrapString(s) {
               return "'" + s + "'";
           };
           var s = 'Hello, World!';
           expect(evaluate(wrapString(s))).toBe(s);

           s = 'chicken fish soup';
           expect(evaluate(wrapString(s))).toBe(s);
       });
    it('evaluates application of primitive procedures',
       function() {
           expect(evaluate('(+ 1 2)')).toBe(3);
           expect(evaluate('(* 1 2)')).toBe(2);
       });
    it('recursively evaluates primitive procedures',
       function() {
           expect(evaluate('(+ 1 (* 5 2))')).toBe(11);
           expect(evaluate('(+ (* 5 2) 1)')).toBe(11);
       });
    it('allows setting and getting of variables in the environment',
       function() {
           expect(evaluate('( set! "age" 32)')).toBe('ok');
           expect(evaluate('( set! "weight" 135.6)')).toBe('ok');
           expect(evaluate('age')).toBe(32);
           expect(evaluate('weight')).toBe(135.6);
       });
    it('allows setting and getting of variables in the environment',
       function() {
           expect(evaluate('( set! "age" 32)')).toBe('ok');
           expect(evaluate('( set! "weight" 135.6)')).toBe('ok');
           expect(evaluate('age')).toBe(32);
           expect(evaluate('weight')).toBe(135.6);
       });
    it('throws an error if you evaluate something not defined in the environment',
       function() {
           expect(function () {evaluate('notdefined');}).toThrow(e.ERROR.UNKNOWN_EXPRESSION_TYPE);
       });
    it('handles quoted numbers and lists',
       function() {
           expect(evaluate('(quote 1)')).toBe(1);
           expect(evaluate('(quote (1 2 3))')).toMatch([1, 2, 3]);
       });
});
