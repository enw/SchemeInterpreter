var Environment = module.exports = function (parent) {
    var entries = {};
    // returns string, number, boolean, list or symbolic expression
    function getValue(token) {
        if (token.value) {
            return token.value;
        } else {
            return token;
        }
    }
    // returns dictionary of name/value pairs
    this.list = function () {
        var ret = {};
        if (parent) {
            ret = parent.list();
        }
        for (var i in entries) {
            ret[i] = entries[i];
        }
        return ret;
    }
    this.isDefined = function( name ) {
        return entries[name] != undefined;
    }
    var set = this.set = function(name, value){
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

// just run tests if this is the main file
if (!module.parent) {
    console.log('Testing Environment...');
    var parentEnv = new Environment();
    parentEnv.set('cat', 'Samuel');

    // test environment
    var env = new Environment(parentEnv);
    console.log('new Environment based on the previous one',env.list());
    env.set('sayHello', function() {console.log('sayHello')});
    console.log('after sayHello',env.list());
    env.set('name', 'Todd Rundgren');
    env.set('age', 32);
    console.log('after name and age',env.list());
    env.set('foo', 'bar'+21);
    console.log('after foo',env.list());

    env.set('lambda', { type: 'procedure',
  parameters: [ { type: 'symbol', value: 'x' } ],
  body:
   [ { type: 'symbol', value: '+' },
     3,
     { type: 'symbol', value: 'x' } ],
  environment: {} });
    console.log('after lambda',env.list());
}
