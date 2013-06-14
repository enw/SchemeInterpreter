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
       });
});
