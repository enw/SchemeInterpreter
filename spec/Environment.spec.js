// uses jasmine-node-karma
// https://npmjs.org/package/jasmine-node-karma

// environments
// http://mitpress.mit.edu/sicp/full-text/book/book-Z-H-26.html#%_sec_4.1.3

var Environment=require('../lib/Environment');
// isDefined, set, set, unset, setbang, unsetbang, get
describe('Environment Suite', function () {
    it('lokupVariableValue <var> - signals error if <var> is unbound',
       function() {
           var env = new Environment();
           env.defineVariable('name', 'bob');
           expect(env.lookupVariableValue('name')).toBe('bob');

           expect(function () {env.lookupVariableValue('age');}).toThrow(
               env.ERROR.UNBOUND_VARIABLE
           );

           env.defineVariable('age', 32);
           expect(env.lookupVariableValue('age')).toBe(32);
       });
    it('defineVariable <var> <value> - adds to the first frame in the environment <env> a new binding that associates the variable <var> with the value <value>.',
       function() {
           var env = new Environment();
           env.defineVariable('foo', 'bar');
           expect(env.lookupVariableValue('foo')).toBe('bar');
       });

    it('(extend-environment <variables> <values> <base-env>) returns new environment.  consisting of a new frame in which the symbols in the list <variables> are bound to the corresponding elements in the list <values>, where the enclosing environment is the environment <base-env>.',
       function() {
           var env = new Environment();
           env.defineVariable('age', 32);
           
           var newFrame = new Environment(env);
           expect(env.lookupVariableValue('age')).toBe(32);
       });

    it('(set-variable-value! <var> <value> <env>) changes the binding of the variable <var> in the environment <env> so that the variable is now bound to the value <value>, or signals an error if the variable is unbound.',
       function() {
           var env = new Environment();
           env.defineVariable('age', 32);
           
           var newFrame = new Environment(env);
           expect(env.lookupVariableValue('age')).toBe(32);

           newFrame.setVariableValue('age', 17);
           expect(newFrame.lookupVariableValue('age')).toBe(17);

           // should this really be set to or should the parent environment not be effected?
           expect(env.lookupVariableValue('age')).toBe(17); 
       });

});
