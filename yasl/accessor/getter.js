
var Data = yasl.accessor.data

return function (key, constructor) {
  if (!constructor) { constructor = function (val) { return val} }
  var jqo = $("<div>")
    .addClass("getter")
    .append(constructor(Data.get(key)))
    .on("remove", function () { Data.off(key, update) })
  function update (key, old_val, val) { jqo.empty().append(constructor(val)) }
  Data.on(key, update)
  return jqo
}
