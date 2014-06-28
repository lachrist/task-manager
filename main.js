// Generated with Yasl
// See: https://github.com/lachrist/yasl
window.yasl = {}




yasl.accessor = {}
yasl.accessor.data = (function () {

var locks = {}
var keys = {}
var regexes = {}
 // yasl.accessor.data@5
// Problem (reading a stringified regex is not the identity):
// RegExp(/abc/.toString()).toString()
// > '//abc//'
function regex_to_string (regex) {
  var str = regex.toString(); // yasl.accessor.data@10
  return str.substring(1, str.length-1);
}

return {
  lock: function (key) { // yasl.accessor.data@15
    if (localStorage.getItem(key) === null) { throw new Error("The ressource "+key+" does not exist" ) }
    if (locks[key]) { throw new Error("Lock already taken for "+key) }
    function pass () { if (locks[key] === pass) { delete locks[key] } }
    return locks[key] = pass
  }, // yasl.accessor.data@20
  set: function (key, value, pass) {
    if (locks[key] !== pass) { throw new Error("Lock taken for "+key) }
    var old_value = JSON.parse(localStorage.getItem(key))
    localStorage.setItem(key, JSON.stringify(value))
    if (keys[key]) { keys[key].forEach(function (handler) { handler(key, old_value, value) }) } // yasl.accessor.data@25
    for (var regex in regexes) {
      if (RegExp(regex).test(key)) {
        regexes[regex].forEach(function (handler) { handler(key, old_value, value) })
      }
    } // yasl.accessor.data@30
  },
  get: function (key1, callback) {
    if (!(key1 instanceof RegExp)) { return JSON.parse(localStorage.getItem(key1)) }
    for (var i=0; i<localStorage.length; i++) {
      var key2 = localStorage.key(i) // yasl.accessor.data@35
      if (key1.test(key2)) {
        callback(key2, JSON.parse(localStorage.getItem(key2)))
      }
    }
  }, // yasl.accessor.data@40
  on: function (key, handler) {
    if (key instanceof RegExp) {
      var regex = regex_to_string(key)
      if (!regexes.hasOwnProperty(regex)) { regexes[regex] = [] }
      regexes[regex].push(handler) // yasl.accessor.data@45
    } else {
      if (!keys.hasOwnProperty(key)) { keys[key] = [] }
      keys[key].push(handler)
    }
  }, // yasl.accessor.data@50
  off: function (key, handler) {
    if (key instanceof RegExp) {
      var regex = regex_to_string(key)
      regexes[regex].splice(regexes[regex].indexOf(handler), 1)
    } else { // yasl.accessor.data@55
      keys[key].splice(keys[key].indexOf(handler), 1)
    }
  }
}
 // yasl.accessor.data@60
}())




yasl.accessor.setter = {}
yasl.accessor.setter.integer = (function () {
var Data = yasl.accessor.data

return function (key, min, max) {
  var pass = Data.lock(key)
  return $("<input>") // yasl.accessor.setter.integer@5
    .addClass("integer-setter")
    .prop("type", "number")
    .prop("min", min)
    .prop("max", max)
    .val(Data.get(key)) // yasl.accessor.setter.integer@10
    .change(function () { Data.set(key, $(this).val(), pass) })
    .on("remove", pass)
}

}())




yasl.data = (function () {

var Data = yasl.accessor.data

return {
  table: function (key) { return key.split(".")[0] }, // yasl.data@5
  index: function (key) { return key.split(".")[1] },
  column: function (key) { return key.split(".")[2] },
  key: function (table, index, column) { return table+"."+index+"."+column },
  all: function (table, column) { return RegExp("^"+table+"\\.[0-9]\\."+column+"$") },
  add: function (table, obj) { // yasl.data@10
    var max = Data.get(table+".max")
    if (max === null) { max = 0 }
    var index = max+1
    Data.set(table+".max", index)
    for (var column in obj) { // yasl.data@15
      Data.set(table+"."+index+"."+column, obj[column])
    }
    return index
  },
  max: function (table) { // yasl.data@20
    return Data.get(table+".max")
  }
}

}())




yasl.accessor.setter.color = (function () {

var Data = yasl.accessor.data

return function (key) {
  var pass = Data.lock(key) // yasl.accessor.setter.color@5
  return $("<input>")
    .addClass("color-setter")
    .prop("type", "color")
    .val(Data.get(key))
    .change(function () { Data.set(key, $(this).val(), pass) }) // yasl.accessor.setter.color@10
    .on("remove", pass)
}

}())




yasl.accessor.sorter = (function () {

var Data = yasl.accessor.data


function order (regex) { // yasl.accessor.sorter@5
  var xs = []
  Data.get(regex, function (key, val) { xs.push({key:key, val:val}) })
  xs.sort(function (x1, x2) {
    if (x1.val < x2.val) { return -1 }
    if (x1.val > x2.val) { return +1 } // yasl.accessor.sorter@10
    return 0
  })
  return xs.map(function (x) { return x.key })
}
 // yasl.accessor.sorter@15
return function (regex, constructor) {

  var passes = {}

  function append (key) { // yasl.accessor.sorter@20
    passes[key] = Data.lock(key)
    jqo.append($("<li>")
      .append(constructor(key))
      .data("key", key))
  } // yasl.accessor.sorter@25

  function update (key, old_val, val) {
    if (!passes[key]) { append(key) }
  }
  Data.on(regex, update) // yasl.accessor.sorter@30
  
  var jqo = $("<ul>")
    .addClass("sorter")
    .sortable({
      "stop": function () { // yasl.accessor.sorter@35
        jqo.children().each(function (index) {
          var key = $(this).data("key")
          Data.set(key, index, passes[key])
        })
      } // yasl.accessor.sorter@40
    })
    .on("remove", function () { Data.off(regex, update) })
    .on("remove", function () { for (var key in passes) { passes[key]() } })

  order(regex).forEach(append) // yasl.accessor.sorter@45

  return jqo

}
 // yasl.accessor.sorter@50
}())




yasl.accessor.setter.string = (function () {

var Data = yasl.accessor.data

return function (key) {
  var pass = Data.lock(key) // yasl.accessor.setter.string@5
  return $("<input>")
    .addClass("string-setter")
    .prop("type", "text")
    .val(Data.get(key))
    .change(function () { Data.set(key, $(this).val(), pass) }) // yasl.accessor.setter.string@10
    .on("remove", pass)
}

}())




yasl.accessor.getter = (function () {

var Data = yasl.accessor.data

return function (key, constructor) {
  if (!constructor) { constructor = function (val) { return val} } // yasl.accessor.getter@5
  var jqo = $("<div>")
    .addClass("getter")
    .append(constructor(Data.get(key)))
    .on("remove", function () { Data.off(key, update) })
  function update (key, old_val, val) { jqo.empty().append(constructor(val)) } // yasl.accessor.getter@10
  Data.on(key, update)
  return jqo
}

}())




yasl.accessor.setter.key = (function () {

var Data = yasl.accessor.data
var Getter = yasl.accessor.getter

function pick (select, value) { // yasl.accessor.setter.key@5
  select.children().each(function () {
    if ($(this).prop("value") === value) { $(this).prop("selected", true) }
  })
}
 // yasl.accessor.setter.key@10
return function (key, regex, constructor) {

  var pass = Data.lock(key)

  var jqo = $("<select>") // yasl.accessor.setter.key@15
    .addClass("key-setter")
    .change(function () { Data.set(key, $("option:selected", jqo).prop("value"), pass) })
    .on("remove", pass)
    .on("remove", function () { Data.off(regex, update) })
 // yasl.accessor.setter.key@20
  function option (for_key) {
    options.push($("<option>")
      .prop("value", for_key)
      .append(Getter(for_key, constructor))
      .appendTo(jqo)) // yasl.accessor.setter.key@25
  }
  var options = []
  Data.get(regex, option)
  pick(jqo, Data.get(key))
 // yasl.accessor.setter.key@30
  function update (for_key, old_val, val) { if (old_val === null) { option(for_key) } }
  Data.on(regex, update)

  return jqo
 // yasl.accessor.setter.key@35
}

}())




yasl.accessor.setter.progress = (function () {

var Data = yasl.accessor.data

return function (key, max_key) {
 // yasl.accessor.setter.progress@5
  var pass = Data.lock(key)
  var cur = Data.get(key)
  var max = Data.get(max_key)

  var jqo = $("<div>") // yasl.accessor.setter.progress@10
    .addClass("progress-setter")
    .click(function () { if (cur < max) { Data.set(key, ++cur, pass); update() } })
    .on("remove", pass)
    .on("remove", function () { Data.off(max_key, update_max) })
 // yasl.accessor.setter.progress@15
  function update_max (key, old_val, val) {
    max = val
    if (val < cur) { cur = val }
    update()
  } // yasl.accessor.setter.progress@20
  Data.on(max_key, update_max)

  function update () {
    jqo.empty()
    for (var i=0; i<max; i++) { // yasl.accessor.setter.progress@25
      var name = (i < cur) ? "done" : "todo"
      jqo.append($("<div>").addClass(name))
    }
  }
  update() // yasl.accessor.setter.progress@30

  return jqo

}
 // yasl.accessor.setter.progress@35
}())




yasl.main = (function () {

var StringSetter   = yasl.accessor.setter.string
var IntegerSetter  = yasl.accessor.setter.integer
var KeySetter      = yasl.accessor.setter.key
var ColorSetter    = yasl.accessor.setter.color // yasl.main@5
var ProgressSetter = yasl.accessor.setter.progress
var Sorter         = yasl.accessor.sorter
var Getter         = yasl.accessor.getter
var Data           = yasl.data
 // yasl.main@10
$(function () {

  var topic_div = null

  var topic_sorter = Sorter(Data.all("topic", "position"), function (key) { // yasl.main@15
    var index = Data.index(key)
    return $("<div>")
      .data("index", index)
      .append(StringSetter(Data.key("topic", index, "title")))
      .append(ColorSetter(Data.key("topic", index, "color"))) // yasl.main@20
      .click(function () {
        topic_div ? topic_div.removeClass("selected") : create_task_button.prop("disabled", false)
        topic_div = $(this).addClass("selected")
      })
  }) // yasl.main@25

  var create_topic_button = $("<button>")
    .html("Create topic")
    .click(function () {
      Data.add("topic", { // yasl.main@30
        title:"New topic",
        color:"#FFFFFF",
        position:999
      })
    }) // yasl.main@35

  var task_sorter = Sorter(Data.all("task", "priority"), function (key) {
    var index = Data.index(key)
    return $("<div>")
      .append(Getter(Data.key("task", index, "topic"), function (topic) { // yasl.main@40
        return Getter(Data.key("topic", Data.index(topic), "color"), function (color) {
          return Getter(Data.key("task", index, "title"), function (title) {
            return $("<div>").addClass("task-topic").css("background-color", color).html(title)
          })
        }) // yasl.main@45
      }))
      .append(ProgressSetter(Data.key("task", index, "done"), Data.key("task", index, "todo")))
  })

  var create_task_button = $("<button>") // yasl.main@50
    .html("Create task")
    .prop("disabled", true)
    .click(function () {
        var index = Data.add("task", {
        title:"New task", // yasl.main@55
        todo:6,
        done:0,
        topic:Data.key("topic", topic_div.data("index"), "title"),
        priority:Data.max("task")
      }) // yasl.main@60
      task_editor
        .empty()
        .append($("<label>")
          .append($("<span>").html("Title:"))
          .append(StringSetter(Data.key("task", index, "title")))) // yasl.main@65
        .append($("<label>")
          .append($("<span>").html("Topic:"))
          .append(KeySetter(Data.key("task", index, "topic"), Data.all("topic", "title"))))
        .append($("<label>")
          .append($("<span>").html("To-Do:")) // yasl.main@70
          .append(IntegerSetter(Data.key("task", index, "todo"), 1, 24)))
    })

  var task_editor = $("<div>").addClass("task-editor")
 // yasl.main@75
  $("body")
    .append($("<div>")
      .addClass("topic")
      .append(create_topic_button)
      .append(topic_sorter)) // yasl.main@80
    .append($("<div>")
      .addClass("task")
      .append(create_task_button)
      .append(task_editor)
      .append(task_sorter)) // yasl.main@85

})

}())




