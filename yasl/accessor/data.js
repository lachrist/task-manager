
var locks = {}
var keys = {}
var regexes = {}

// Problem (reading a stringified regex is not the identity):
// RegExp(/abc/.toString()).toString()
// > '//abc//'
function regex_to_string (regex) {
  var str = regex.toString();
  return str.substring(1, str.length-1);
}

return {
  lock: function (key) {
    if (localStorage.getItem(key) === null) { throw new Error("The ressource "+key+" does not exist" ) }
    if (locks[key]) { throw new Error("Lock already taken for "+key) }
    function pass () { if (locks[key] === pass) { delete locks[key] } }
    return locks[key] = pass
  },
  set: function (key, value, pass) {
    if (locks[key] !== pass) { throw new Error("Lock taken for "+key) }
    var old_value = JSON.parse(localStorage.getItem(key))
    localStorage.setItem(key, JSON.stringify(value))
    if (keys[key]) { keys[key].forEach(function (handler) { handler(key, old_value, value) }) }
    for (var regex in regexes) {
      if (RegExp(regex).test(key)) {
        regexes[regex].forEach(function (handler) { handler(key, old_value, value) })
      }
    }
  },
  get: function (key1, callback) {
    if (!(key1 instanceof RegExp)) { return JSON.parse(localStorage.getItem(key1)) }
    for (var i=0; i<localStorage.length; i++) {
      var key2 = localStorage.key(i)
      if (key1.test(key2)) {
        callback(key2, JSON.parse(localStorage.getItem(key2)))
      }
    }
  },
  on: function (key, handler) {
    if (key instanceof RegExp) {
      var regex = regex_to_string(key)
      if (!regexes.hasOwnProperty(regex)) { regexes[regex] = [] }
      regexes[regex].push(handler)
    } else {
      if (!keys.hasOwnProperty(key)) { keys[key] = [] }
      keys[key].push(handler)
    }
  },
  off: function (key, handler) {
    if (key instanceof RegExp) {
      var regex = regex_to_string(key)
      regexes[regex].splice(regexes[regex].indexOf(handler), 1)
    } else {
      keys[key].splice(keys[key].indexOf(handler), 1)
    }
  }
}
