const BigNumber = require('bignumber.js');

module.exports = {
    "+": function (a, b) {
        a = a.toString();
        b = b.toString();
        return BigNumber(a).plus(b).toFixed();
    },
    "/": function (a, b) {
        a = a.toString();
        b = b.toString();
        return BigNumber(a).dividedBy(b).toFixed();
    },
    "*": function (a, b) {
        a = a.toString();
        b = b.toString();
        return BigNumber(a).multipliedBy(b).toFixed();
    },
    "-": function (a, b) {
        a = a.toString();
        b = b.toString();
        return BigNumber(a).minus(b).toFixed();
    },
    ">": function (a, b) {
        a = a.toString();
        b = b.toString();
        return BigNumber(a).gt(b);
    },
    '<': function (a, b) {
        a = a.toString();
        b = b.toString();
        return BigNumber(a).lt(b);
    },
    '=': function (a, b) {
        a = a.toString();
        b = b.toString();
        return BigNumber(a).isEqualTo(b);
    },
    '<=': function (a, b) {
        a = a.toString();
        b = b.toString();
        return BigNumber(a).lt(b) || BigNumber(a).isEqualTo(b);
    },
    '>=': function (a, b) {
        a = a.toString();
        b = b.toString();
        return BigNumber(a).gt(b) || BigNumber(a).isEqualTo(b);
    },
    "^": function (a, b) {
        a = a.toString();
        b = b.toString();
        return BigNumber(a).pow(b).toFixed();
    },
}