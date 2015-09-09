(function() {

  $(document).ready(function() {

    AP.require("dialog", function(dialog) {
      dialog.setHint({
        key: "alias.dialog",
        hint: "You can also use @mention to quickly groups by typing @alias"
      })
    });

    AP.register({
      "participants-fetched": function (data, callback) {
        var participants = data.participants;

        var data = _.map(participants, function(participant) {
          return {
            id: participant.jid,
            text: "@" + participant.mention_name
          }
        });

        $(".user-selector").select2({
          data: data
        })
      }
    });

    AP.require("user", function(user) {
      user.getParticipants();

    });



    var baseUrl = $("meta[name=base-url]").attr("content");

    var $spinner = $(".spinner-container");
    $spinner.spin("medium");

    $.ajax({
      url: baseUrl + "/aliases_view",
      type: "GET",
      dataType: "html"
    }).done(function(html) {
      $spinner.data().spinner.stop();
      $(".aliases").append(html);
    });

    $(document).on("click", ".delete", function(e) {
      var alias = $(this).parents(".alias");
      var aliasName = alias.attr("data-alias");

      $.ajax({
        url: baseUrl + "/alias/" + aliasName,
        type: "DELETE"
      }).done(function() {
        alias.remove();
      });

      e.stopPropagation();
    });

    $(document).on("click", ".alias", function() {
      var aliasName = $(this).attr("data-alias");

      var mentionsText = aliasName + " (";
      $(this).find(".mentions .hc-mention").each(function() {
        mentionsText += $(this).text() + " ";
      });
      mentionsText += ")";

      AP.require(["chat", "dialog"], function(chat, dialog) {
        chat.appendMessage(mentionsText);
        dialog.close({
          key: "alias.dialog"
        });
      });
    });

    $(document).on("click", ".edit", function() {

    });

  });

})();