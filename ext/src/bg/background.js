// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });


function toQueryString(obj) {      
  var parts = [];      
  for(var each in obj) if (obj.hasOwnProperty(each)) {  
    parts.push(encodeURIComponent(each) + '=' + encodeURIComponent(obj[each]));      
  }      
  return parts.join('&');    
};

JCC = {
    config:{// Base URI for Web service
        yql_base_uri : "http://query.yahooapis.com/v1/yql",

        // Create a variable to make results available
        // in the global namespace
        yql_results : "",

        // Create a YQL query to get geo data for the
        // San Francisco International Airport
        yql_query : "select * from yahoo.finance.xchange where pair in (\"EURCNY\",\"GBPCNY\",\"USDCNY\",\"HKDCNY\",\"JPYCNY\")"

     },

    initialize: function(){
        $.getJSON(JCC.config.yql_base_uri+"?"+encodeURIComponent(JCC.config.yql_query)+'&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=').done(function(a) {
            console.log(a);
        }).fail(function() {}).always(function() {});
    }

};

document.addEventListener("DOMContentLoaded", function() {
    chrome.power.requestKeepAwake("system");
    JCC.initialize();
});