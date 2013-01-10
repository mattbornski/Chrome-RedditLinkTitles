var redditTabs = {};
var redirectTabs = {};

var isRedditUrl = function(url) {
  return (/[a-z]+:\/\/([a-z\-0-9]+\.)?reddit\.com\//i.test(url) === true);
};

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  var responded = false;
  var senderTabId = sender['tab']['id'];
  var parentTabId = sender['tab']['openerTabId'] || sender['tab']['id'];
  if (request['action'] === 'register') {
    console.log('Tab #' + senderTabId + ' has loaded ' + sender['tab']['url'] + ', source was tab #' + parentTabId);
    if (isRedditUrl(sender['tab']['url'])) {
      redditTabs[senderTabId] = {};
      // Let the tab know that it should do reddit things.
      sendResponse({'type': 'reddit'});
      responded = true;
    } else if (redditTabs[parentTabId] !== undefined) {
      if (redditTabs[parentTabId][sender['tab']['url']] !== undefined) {
        sendResponse({'type': 'linked', 'title': redditTabs[parentTabId][sender['tab']['url']]});
        responded = true;
      } else {
        var originalUrl = sender['tab']['url'];
        var redirects = redirectTabs[senderTabId] || {};
        while (redirects[originalUrl] !== undefined) {
          originalUrl = redirects[originalUrl];
        }
        if (redditTabs[parentTabId][originalUrl] !== undefined) {
          sendResponse({'type': 'linked', 'title': redditTabs[parentTabId][originalUrl]});
          responded = true;
        } else {
          console.log('No title found for ' + sender['tab']['url'])
          console.log(redditTabs[parentTabId]);
        }
      }
    }
  } else if (redditTabs[senderTabId] !== undefined && request['link'] !== undefined && request['title'] !== undefined && !isRedditUrl(request['link'])) {
    redditTabs[senderTabId][request['link']] = request['title'];
  }
  
  if (request['message'] !== undefined) {
    console.log(request['message']);
  }
  
  if (!responded) {
    sendResponse({'type': 'none'});
    responded = true;
  }
});

chrome.tabs.onRemoved.addListener(function(tabId) {
  delete redditTabs[tabId];
  delete redirectTabs[tabId];
});

chrome.webRequest.onBeforeRedirect.addListener(function(details) {
  if (details['redirectUrl'] !== 'undefined') {
    console.log('Tab #' + details['tabId'] + ' has been redirected from ' + details['url'] + ' to ' + details['redirectUrl'])
    if (redirectTabs[details['tabId']] === undefined) {
      redirectTabs[details['tabId']] = {};
    }
    redirectTabs[details['tabId']][details['redirectUrl']] = details['url'];
  }
}, {
  'urls': [
    '<all_urls>'
  ],
  'types': [
    'main_frame'
  ]
}, [
  'responseHeaders'
]);