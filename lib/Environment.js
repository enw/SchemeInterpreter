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
    // set locally
    var set = this.set = function(name, value){
        entries[name]=value;
    };

    // unset locally
    var unset = this.unset = function (name) {
        delete entries[name];
    };
    
    // set wherever possible
    var setbang = this.setbang = function (name, value) {
        if (entries[name]) {
            set(name, value);
        } else if (parent) {
            parent.setbang(name, value);
        }
    };

    // unset the first one
    var unsetbang = this.unsetbang = function (name) {
        if (entries[name]) {
            unset(name);
        } else if (parent) {
            parent.unsetbang(name);
        }
    };

    this.get = function (name) {
        // should this be so fancy...?
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
    this.inspect = function () {
        return this.list();
    }
}

// just run tests if this is the main file
if (!module.parent) {
    console.log('Testing Environment...');

    var greatgrandparent = new Environment();
    greatgrandparent.set('hair', 'brown');

    var grandparent = new Environment(greatgrandparent);
    grandparent.set ('lastname', 'Winardsky');
    grandparent.set ('home', 'Brooklyn');
    grandparent.set ('name', 'Harold');
    grandparent.set ('wife', 'Pearl');

    var parent = new Environment(grandparent);
    parent.set ('name', 'Steve');
    parent.set('pet', 'Blackjack the dog');
    parent.set('home', 'LA');
    parent.unsetbang('wife');

    var child = new Environment(parent);
    child.set ('name', 'Elliot');
    child.set ('home', 'Brooklyn');
    child.set('pet', 'Samuel the cat');
    child.set('wife', 'Jenelle');
    child.setbang('lastname', 'Winard');

    console.log('grandparent',grandparent.list());
    console.log('parent',parent.list());
    console.log('child',child.list());

    grandparent.unset('wife');
    console.log('wifeless grandparent', grandparent.list());

    // test environment
    var env = new Environment(parent);
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
