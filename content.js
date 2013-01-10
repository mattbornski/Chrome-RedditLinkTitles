var applyClickCatcherToLinks = function () {
  $('a').each(function() {
    var href = $(this).attr('href');
    var title = $(this).text();
    chrome.extension.sendMessage({'link': href, 'title': title});
    $(this).addClass("outgoingRedditLink");
  });
};

$(document).ready(function() {
  chrome.extension.sendMessage({'action': 'register'}, function(response) {
    if (response['type'] == 'reddit') {
      // This is a Reddit tab.  Inventory all the links.
      
      document.addEventListener('DOMNodeInserted', applyClickCatcherToLinks, true, true);
      
      applyClickCatcherToLinks();
      
    } else if (response['type'] == 'linked') {
      // This is not a Reddit tab but it was a Reddit link
      if (response['title'] !== undefined) {
        var iconUrl = chrome.extension.getURL("icon.png");
        /*$('body').html('<iframe id="redditLinkTitle" style="height:60px;width:100%;position:absolute;top:0px;left:0px;" scrolling="no" frameborder="0px"></iframe><div style="position:absolute;left:0;right:0;top:45px;bottom:0;overflow:auto;">' + $('body').html() + '</div>');
        $('body', $('#redditLinkTitle')[0].contentDocument).css('background-color', '#000000');
        $('body', $('#redditLinkTitle')[0].contentDocument).html('<img src="' + iconUrl + '" height="48px" style="float:left"></img><h2 style="color:#FF4500">' + response['title'] + '</h2>');*/
        $('body').prepend('<div id="redditLinkTitle" style="background-color:#000000;min-height:4em;width:100%;margin:0"><img src="' + iconUrl + '" style="float:left;width:3em;height:3em"></img><div style="width:100%;margin:0;padding-top:0.5em;padding-bottom:0;padding-left:0.5em;padding-right:0"><font style="font-family:verdana,arial,helvetica,sans-serif;color:#FF4500;font-size:2em;vertical-align:middle">' + response['title'] + '</font></div></div>');
      }
    }
  });
});