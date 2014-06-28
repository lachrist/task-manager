
var StringSetter   = yasl.accessor.setter.string
var IntegerSetter  = yasl.accessor.setter.integer
var KeySetter      = yasl.accessor.setter.key
var ColorSetter    = yasl.accessor.setter.color
var ProgressSetter = yasl.accessor.setter.progress
var Sorter         = yasl.accessor.sorter
var Getter         = yasl.accessor.getter
var Data           = yasl.data

$(function () {

  var topic_div = null

  var topic_sorter = Sorter(Data.all("topic", "position"), function (key) {
    var index = Data.index(key)
    return $("<div>")
      .data("index", index)
      .append(StringSetter(Data.key("topic", index, "title")))
      .append(ColorSetter(Data.key("topic", index, "color")))
      .click(function () {
        topic_div ? topic_div.removeClass("selected") : create_task_button.prop("disabled", false)
        topic_div = $(this).addClass("selected")
      })
  })

  var create_topic_button = $("<button>")
    .html("Create topic")
    .click(function () {
      Data.add("topic", {
        title:"New topic",
        color:"#FFFFFF",
        position:999
      })
    })

  var task_sorter = Sorter(Data.all("task", "priority"), function (key) {
    var index = Data.index(key)
    return $("<div>")
      .append(Getter(Data.key("task", index, "topic"), function (topic) {
        return Getter(Data.key("topic", Data.index(topic), "color"), function (color) {
          return Getter(Data.key("task", index, "title"), function (title) {
            return $("<div>").addClass("task-topic").css("background-color", color).html(title)
          })
        })
      }))
      .append(ProgressSetter(Data.key("task", index, "done"), Data.key("task", index, "todo")))
  })

  var create_task_button = $("<button>")
    .html("Create task")
    .prop("disabled", true)
    .click(function () {
        var index = Data.add("task", {
        title:"New task",
        todo:6,
        done:0,
        topic:Data.key("topic", topic_div.data("index"), "title"),
        priority:Data.max("task")
      })
      task_editor
        .empty()
        .append($("<label>")
          .append($("<span>").html("Title:"))
          .append(StringSetter(Data.key("task", index, "title"))))
        .append($("<label>")
          .append($("<span>").html("Topic:"))
          .append(KeySetter(Data.key("task", index, "topic"), Data.all("topic", "title"))))
        .append($("<label>")
          .append($("<span>").html("To-Do:"))
          .append(IntegerSetter(Data.key("task", index, "todo"), 1, 24)))
    })

  var task_editor = $("<div>").addClass("task-editor")

  $("body")
    .append($("<div>")
      .addClass("topic")
      .append(create_topic_button)
      .append(topic_sorter))
    .append($("<div>")
      .addClass("task")
      .append(create_task_button)
      .append(task_editor)
      .append(task_sorter))

})
