
var Data = yasl.accessor.data

return function (key) {
  var pass = Data.lock(key)
  return $("<input>")
    .addClass("string-setter")
    .prop("type", "text")
    .val(Data.get(key))
    .change(function () { Data.set(key, $(this).val(), pass) })
    .on("remove", pass)
}
