// uses jasmine-node-karma
// https://npmjs.org/package/jasmine-node-karma

// environments
// http://mitpress.mit.edu/sicp/full-text/book/book-Z-H-26.html#%_sec_4.1.3

var Environment=require('../lib/Environment');
var env = new Environment();
env.set('name', 'bob');

// isDefined, set, set, unset, setbang, unsetbang, get
describe('Environment Suite', function () {
    it('(get <var> <env>), signals error if <var> is unbound (lookup-variable-value)',
       function() {
           expect(env.get('name')).toBe('bob');
           expect(function () {env.get('age');}).toThrow(
               env.ERROR.UNBOUND_VARIABLE
           );

           expect(env.get('age')).toBe(32);
       });
/*
    it('(extend-environment <variables> <values> <base-env>) returns new environment.  consisting of a new frame in which the symbols in the list <variables> are bound to the corresponding elements in the list <values>, where the enclosing environment is the environment <base-env>.',
       function() {
           expect(true).toBe('TODO');
       });
    it('extend-environment <variables> <values> <base-env>) returns new environment.  consisting of a new frame in which the symbols in the list <variables> are bound to the corresponding elements in the list <values>, where the enclosing environment is the environment <base-env>.',
       function() {
           expect(true).toBe('TODO');
       });
    it('(set-variable-value! <var> <value> <env>) changes the binding of the variable <var> in the environment <env> so that the variable is now bound to the value <value>, or signals an error if the variable is unbound.',
       function() {
           expect(true).toBe('TODO');
       });
*/
});
