
var Data = yasl.accessor.data

return {
  table: function (key) { return key.split(".")[0] },
  index: function (key) { return key.split(".")[1] },
  column: function (key) { return key.split(".")[2] },
  key: function (table, index, column) { return table+"."+index+"."+column },
  all: function (table, column) { return RegExp("^"+table+"\\.[0-9]\\."+column+"$") },
  add: function (table, obj) {
    var max = Data.get(table+".max")
    if (max === null) { max = 0 }
    var index = max+1
    Data.set(table+".max", index)
    for (var column in obj) {
      Data.set(table+"."+index+"."+column, obj[column])
    }
    return index
  },
  max: function (table) {
    return Data.get(table+".max")
  }
}
