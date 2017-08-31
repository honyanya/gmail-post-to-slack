var config = {
  postUrl     : "slack webhook url",
  postChannel : "#test_channel",
  username    : "webhook-bot",
  iconUrl     : "http://example.com/images/example.png"
//iconEmoji   : ":ghost:",
  linkNames   : 1,
  mention     : "@user_name ",
  color       : {
    red    : "ff0000",
    green  : "00ff00",
    blue   : "0000ff",
    yellow : "ffff00"
  },
  searchGmail : "is:unread label:label-test",
  testMessage : "テストメッセージ"
};

function gmailPostToSlack() {
  // 未読 かつ 指定ラベル を検索
  var threads = GmailApp.search(config.searchGmail);
  Logger.log("threads : " + threads)
  
  var threadCount = threads.length;
  Logger.log("対象件数 : " + threadCount); 

  for (var i = 0; i < threadCount; i++) {
    var datetime = formatDateTime(threads[i].getLastMessageDate());
    Logger.log(datetime + " 件名　：　" + threads[i].getFirstMessageSubject());
    
    var messages = threads[i].getMessages()
    Logger.log("messages : " + messages)
    
    var messagesCount = messages.length;
    Logger.log("対象件数 : " + messagesCount); 
    
    for (var j = 0; j < messagesCount; j++) {
      var pretext = 
        config.mention + "\n" +
        config.testMessage + "\n" + 
        "Subject : " + messages[j].getSubject()     
      var message = 
        "--------------------------------------------------------------------------------" + "\n" + 
        "From : "    + messages[j].getFrom()                 + "\n" + 
        //"To : "      + messages[j].getReplyTo()              + "\n" + 
        "Date : "    + formatDateTime(messages[j].getDate()) + "\n" + 
        "Subject : " + messages[j].getSubject()              + "\n" + 
        "Body : "                                            + "\n" + 
          messages[j].getPlainBody()                         + "\n" + 
        "--------------------------------------------------------------------------------" + "\n"
      Logger.log(message)
      
      // slack 通知              
      sendHttpPost(pretext, message);
    }
    // thread 既読
    threads[i].markRead();
  }
}

function sendHttpPost(pretext, message) {
  var jsonData = {
    channel    : config.postChannel,
    username   : config.username,
    icon_url   : config.iconUrl
//  icon_emoji : config.iconEmoji,
    attachments : [
      {
        color   : config.color.yellow,
        pretext : pretext,
        text    : message
      }
    ],
    link_names : config.linkNames
  };
  var options = {
    method      : "post",
    contentType : "application/json",
    payload     : JSON.stringify(jsonData)
  };

  UrlFetchApp.fetch(config.postUrl, options);
}

function formatDateTime(date) {
  return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + 
    date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
}

