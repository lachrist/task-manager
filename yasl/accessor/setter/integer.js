var Data = yasl.accessor.data

return function (key, min, max) {
  var pass = Data.lock(key)
  return $("<input>")
    .addClass("integer-setter")
    .prop("type", "number")
    .prop("min", min)
    .prop("max", max)
    .val(Data.get(key))
    .change(function () { Data.set(key, $(this).val(), pass) })
    .on("remove", pass)
}
