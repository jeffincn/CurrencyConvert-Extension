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
        yql_base_uri : "http://query.yahooapis.com/v1/public/yql",

        // Create a YQL query to get geo data for the
        // San Francisco International Airport
        yql_query : "select * from yahoo.finance.xchange where pair in (\"EURCNY\",\"GBPCNY\",\"USDCNY\",\"HKDCNY\",\"JPYCNY\")"

     },

    initialize: function(){
        JCC.webdb.open();
        JCC.webdb.createTable();
        $.ajax({
          url:JCC.config.yql_base_uri,
          type: 'POST',
          data:'q='+encodeURIComponent(JCC.config.yql_query)+'&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=',
          dataType:'json'
        }).done(function(a) {
            for (var i = a.query.count - 1; i >= 0; i--) {
              var rateInfo = a.query.results.rate[i];
              JCC.webdb.insertTable(rateInfo);
            };
            JCC.webdb.fetchAll(JCC.renderData);
        }).fail(function() {}).always(function() {});
    }

};

JCC.webdb = {
  db:null,
  open:function(){
    var dbSize = 5 * 1024 * 1024; // 5MB
    JCC.webdb.db = openDatabase("CurrencyDB", "1.0.0", "Store Currency Data", dbSize);
    
  },
  onError:function(tx, e){
    alert("There has been an error: " + e.message);
  },
  onSuccess:function(tx, e){
    // JCC.webdb.getAllItems(loadTodoItems);
  },
  createTable:function(){
    var db = JCC.webdb.db;
    db.transaction(function(tx) {
      tx.executeSql("CREATE TABLE IF NOT EXISTS " +
                    "rate(ID INTEGER PRIMARY KEY ASC, Ask TEXT, Bid TEXT, Date TEXT, Name TEXT, Rate TEXT, Time TEXT, idx TEXT)", []);
    });
  },
  insertTable:function(rateInfo){
    var db = JCC.webdb.db;
    db.transaction(function(tx) {
      tx.executeSql("INSERT INTO " +
                    "rate(Ask, Bid, Date, Name, Rate, Time, idx) VALUES(?,?,?,?,?,?,?)", 
                    [rateInfo.Ask,rateInfo.Bid,rateInfo.Date,rateInfo.Name,rateInfo.Rate,rateInfo.Time,rateInfo.id],
                    JCC.webdb.onSuccess,
                    JCC.webdb.onError);
    });
  },
  fetchAll:function(callback){
    var db = JCC.webdb.db;
    db.transaction(function(tx) {
      tx.executeSql("SELECT * FROM rate ORDER BY ID DESC", [], callback,
        JCC.webdb.onError);
    });
  },
  deleteOneByID:function(id, callback){
    var db = JCC.webdb.db;
    db.transaction(function(tx) {
      tx.executeSql("DELETE FROM rate WHERE ID="+id, [], callback,
        JCC.webdb.onError);
    });
  },
  deleteOneByIdx:function(idx, callback){
    var db = JCC.webdb.db;
    db.transaction(function(tx) {
      tx.executeSql("DELETE FROM rate WHERE idx='"+idx+"'", [], callback,
        JCC.webdb.onError);
    });
  },
  dropTable:function(callback){
    var db = JCC.webdb.db;
    db.transaction(function(tx) {
      tx.executeSql("DROP TABLE rate", [], callback,
        JCC.webdb.onError);
    });
  },
  getLastOne:function(idx, callback){
    var db = JCC.webdb.db;
    db.transaction(function(tx) {
      tx.executeSql("SELECT * FROM rate WHERE idx='"+idx+"' ORDER BY ID DESC LIMIT 1", [], callback,
        JCC.webdb.onError);
    });
  }
};

JCC.renderData=function(tx, rs){
  for (var i=0; i < rs.rows.length; i++) {
    console.log(rs.rows.item(i));
  }
};

document.addEventListener("DOMContentLoaded", function() {
    chrome.power.requestKeepAwake("system");
    JCC.initialize();
});