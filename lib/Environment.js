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

// just run tests if this is the main file
if (!module.parent) {
    console.log('Testing Environment...');
    var parentEnv = new Environment();
    parentEnv.set('cat', 'Samuel');

    // test environment
    var env = new Environment(parentEnv);
    console.log('Environment',env);
    env.set('sayHello', function() {console.log('sayHello')});
    env.set('name', 'Todd Rundgren');
    env.set('age', 32);
    console.log('Environment',env.list());
}
