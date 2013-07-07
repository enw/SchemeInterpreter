/*jslint node:true nomen:true */

// support running as a commonJS module or in a browser
if (typeof module === 'undefined') { var module = {exports: {}}; }

var Environment = module.exports.Environment = function (parent) {
    "use strict";

    // helper
    function getErrorString(which, details) {
// this is how it *should* work once jasmine is updated to search for substrings in Errors
//        return Environment.prototype.ERROR[which] + " - " + details;
        return Environment.prototype.ERROR[which];
    }
    
    var entries = {};
    // returns string, number, boolean, list or symbolic expression
    function getValue(token) {
        if (token.value) {
            return token.value;
        } else {
            return token;
        }
    }
    // set locally
    this.defineVariable = function (name, value) {
//console.log("DEFINE", name, value);
        entries[name] = value;
    };

    // set wherever possible or throw undefined error
    this.setVariableValue = function (name, value) {
        var currentValue = this.lookupVariableValue(name); // throws error if not defined
        if (entries[name]) {
            entries[name] = value;
        } else {
            parent.setVariableValue(name, value);
        }
        return value;
    };

    // name is 
    this.lookupVariableValue = function (name) {
        // should this be so fancy...?
        if (entries[name]) {
            return getValue(entries[name]);
        } else {
            if (parent) {
                return parent.lookupVariableValue(name);
            } else {
                throw new Error(getErrorString("UNBOUND_VARIABLE", name));
            }
        }
    };

    this.data = function () {
        return entries;
    };
    
};
Environment.prototype.ERROR = {
    UNBOUND_VARIABLE: "Unbound Variable"
};

// just run tests if this is the main file
/*
if (!module.parent) {
    console.log('Testing Environment...');

    var greatgrandparent = new Environment();
    greatgrandparent.set('hair', 'brown');

    var grandparent = new Environment(greatgrandparent);
    grandparent.set('lastname', 'Winardsky');
    grandparent.set('home', 'Brooklyn');
    grandparent.set('name', 'Harold');
    grandparent.set('wife', 'Pearl');

    var parent = new Environment(grandparent);
    parent.set('name', 'Steve');
    parent.set('pet', 'Blackjack the dog');
    parent.set('home', 'LA');
    parent.unsetbang('wife');

    var child = new Environment(parent);
    child.set('name', 'Elliot');
    child.set('home', 'Brooklyn');
    child.set('pet', 'Samuel the cat');
    child.set('wife', 'Jenelle');
    child.setbang('lastname', 'Winard');

    console.log('grandparent', grandparent.list());
    console.log('parent', parent.list());
    console.log('child', child.list());

    grandparent.unset('wife');
    console.log('wifeless grandparent', grandparent.list());

    // test environment
    var env = new Environment(parent);
    console.log('new Environment based on the previous one', env.list());
    env.set('sayHello', function () {
        "use strict";
        console.log('sayHello');
    });
    console.log('after sayHello', env.list());
    env.set('name', 'Todd Rundgren');
    env.set('age', 32);
    console.log('after name and age', env.list());
    env.set('foo', 'bar' + 21);
    console.log('after foo', env.list());

    env.set('lambda', { type: 'procedure',
        parameters: [ { type: 'symbol', value: 'x' } ],
                       body:
        [ { type: 'symbol', value: '+' },
            3,
            { type: 'symbol', value: 'x' } ],
        environment: {} });
    console.log('after lambda', env.list());
}

*/
