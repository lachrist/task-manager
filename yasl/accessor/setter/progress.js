
var Data = yasl.accessor.data

return function (key, max_key) {

  var pass = Data.lock(key)
  var cur = Data.get(key)
  var max = Data.get(max_key)

  var jqo = $("<div>")
    .addClass("progress-setter")
    .click(function () { if (cur < max) { Data.set(key, ++cur, pass); update() } })
    .on("remove", pass)
    .on("remove", function () { Data.off(max_key, update_max) })

  function update_max (key, old_val, val) {
    max = val
    if (val < cur) { cur = val }
    update()
  }
  Data.on(max_key, update_max)

  function update () {
    jqo.empty()
    for (var i=0; i<max; i++) {
      var name = (i < cur) ? "done" : "todo"
      jqo.append($("<div>").addClass(name))
    }
  }
  update()

  return jqo

}
