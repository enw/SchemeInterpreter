function Factory() {
    // @bool Boolean - initial value, MS between emission
    function TogglingBooleanEmitter (initObj) {
        var value = (initObj.value)?initObj.value:false; // defaults to false
        var ms = (initObj.ms)?initObj.ms:60000; // once a minute
        var iid; // from setInterval
        var id=0; // monotonically increasing
        var listeners = [];
        // returns ID of eventlistener
        this.addEventListener = function (listener) {
            listeners[id]=listener;
            return id++;
        }
        function emit() {
            for (var i=0;i<listeners.length;i++) {
                listeners[i](value);
            }
        }
        function tick() {
            value = !value;
            emit(value);
        }
        this.start = function () {
            var iid = setInterval(tick, ms);
        }
        
    }
    this.makeObject = function(type, initObj) {
        var obj;
        switch(type) {
        case "TogglingBooleanEmitter":
            obj = new TogglingBooleanEmitter(initObj);
            break;
        }

        // try registered types
        if (typeMap[type]) {
            obj = new typeMap[type](initObj);
        }

        if (obj) {
            obj.type=type;
            return obj;
        } else {
            throw ("ERROR::makeObject::"+JSON.stringify(arguments));
        }
    }
    var typeMap = {};
    this.registerType = function(type, constructor) {
        typeMap[type]=constructor;
    }
    this.getTypes = function () {
        var types = [];
        for (var k in typeMap) { types.push(k) }
        return types;
    }
}
module.exports = Factory;
/*
var myFactory = new Factory();
var tbe = myFactory.makeObject("TogglingBooleanEmitter", {ms:10000});
console.log("TogglingBooleanEmitter", tbe);
var cid = tbe.addEventListener(function(val) {console.log('ping',val)});
console.log("cid", cid);
tbe.start();

function Person(initObj) {
    this.getName = function () {
        return (initObj&&initObj.name)?initObj.name:"no name";
    }
}

// registration of type in factory
myFactory.registerType("Person", Person);
var p = myFactory.makeObject("Person", {name:"Bob Roberts"});
console.log("p",p);
console.log("p",p.getName());
var p2 = myFactory.makeObject("Person");
console.log("p2",p2);
console.log("p2",p2.getName());
*/