
var Data = yasl.accessor.data


function order (regex) {
  var xs = []
  Data.get(regex, function (key, val) { xs.push({key:key, val:val}) })
  xs.sort(function (x1, x2) {
    if (x1.val < x2.val) { return -1 }
    if (x1.val > x2.val) { return +1 }
    return 0
  })
  return xs.map(function (x) { return x.key })
}

return function (regex, constructor) {

  var passes = {}

  function append (key) {
    passes[key] = Data.lock(key)
    jqo.append($("<li>")
      .append(constructor(key))
      .data("key", key))
  }

  function update (key, old_val, val) {
    if (!passes[key]) { append(key) }
  }
  Data.on(regex, update)
  
  var jqo = $("<ul>")
    .addClass("sorter")
    .sortable({
      "stop": function () {
        jqo.children().each(function (index) {
          var key = $(this).data("key")
          Data.set(key, index, passes[key])
        })
      }
    })
    .on("remove", function () { Data.off(regex, update) })
    .on("remove", function () { for (var key in passes) { passes[key]() } })

  order(regex).forEach(append)

  return jqo

}
