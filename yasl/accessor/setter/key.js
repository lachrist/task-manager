
var Data = yasl.accessor.data
var Getter = yasl.accessor.getter

function pick (select, value) {
  select.children().each(function () {
    if ($(this).prop("value") === value) { $(this).prop("selected", true) }
  })
}

return function (key, regex, constructor) {

  var pass = Data.lock(key)

  var jqo = $("<select>")
    .addClass("key-setter")
    .change(function () { Data.set(key, $("option:selected", jqo).prop("value"), pass) })
    .on("remove", pass)
    .on("remove", function () { Data.off(regex, update) })

  function option (for_key) {
    options.push($("<option>")
      .prop("value", for_key)
      .append(Getter(for_key, constructor))
      .appendTo(jqo))
  }
  var options = []
  Data.get(regex, option)
  pick(jqo, Data.get(key))

  function update (for_key, old_val, val) { if (old_val === null) { option(for_key) } }
  Data.on(regex, update)

  return jqo

}
