console.log('test of message-passing...');


function Matrix() {
    var data = [];
    for (var k in arguments) {
        data[k]=arguments[k];
    }
    return function (message) {
        switch (message) {
        case 'toString':
            return data;
        break;
        default:
            console.log('Matrix::message not handled',message);
        }
    }
}

var m = new Matrix([1, 2, 3], [4, 5, 6]);
console.log("toString",m('toString'));


