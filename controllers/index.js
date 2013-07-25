var sms1_check = false;
var sms2_check = false;
var fav_check = false;

$.fav_bottom_right.addEventListener("click", function() {
	$.favourite_win.close();
	$.sms1_win.open();
});

$.right_bottom.addEventListener("click", function(e) {
	$.fav_scroll.removeAllChildren();
	$.sms1_win.close();
	var rows = getFavs();
	while (rows.isValidRow()) {
		var msg_view = Ti.UI.createView({
			width : "80%",
			backgroundColor : "#FFE9C9",
			borderWidth : 2,
			borderColor : "blue",
			top : "5dp",
			opacity : 0.8,
			height : Ti.UI.SIZE
		});

		var msg = Ti.UI.createLabel({
			text : rows.fieldByName("sms"),
			width : "70%",
			top : "5dp",
			bottom : "20dp",
			msgid : rows.fieldByName("msgid"),
			font : {
				fontSize : "20dp",
			},
			color : "black",
			borderColor : "black",
			borderWidth : "1dp",
			height : Ti.UI.SIZE
		});

		var msg_bot = Ti.UI.createView({
			borderColor : "red",
			borderWidth : "1dp",
			bottom : 0,
			width : Ti.UI.FILL,
			height : "20dp"
		});

		var msg_send = Ti.UI.createView({
			borderColor : "#fff",
			borderWidth : "1dp",
			left : 0,
			width : "20dp",
			height : "20dp",
			backgroundColor : "#fff",
			msg : rows.fieldByName("sms")
		});

		var msg_del_fav = Ti.UI.createView({
			borderColor : "#000",
			borderWidth : "1dp",
			left : "30dp",
			width : "20dp",
			height : "20dp",
			backgroundColor : "#000",
			msgid : rows.fieldByName("msgid")
		});

		msg_del_fav.addEventListener("click", function(e) {
			delFav(e.source.msgid);
			e.source.getParent().getParent().hide();
		});

		msg_send.addEventListener("click", function(e) {
			Ti.Platform.openURL("sms:" + e.source.msg);
		});

		msg_bot.add(msg_send);
		msg_bot.add(msg_del_fav);

		msg_view.add(msg);
		msg_view.add(msg_bot);
		$.fav_scroll.add(msg_view);
		rows.next();
	}
	$.favourite_win.open();
});

$.left_bottom1.addEventListener("click", function() {
	var db = Ti.Database.open('smsDB');
	var num = db.execute("SELECT COUNT(*) AS count FROM sms");
	alert(num.fieldByName("count"));
	/*var row = db.execute("SELECT * FROM sms;");
	 while (row.isValidRow()) {
	 alert("groupt= " + row.fieldByName("subid") + " text= " + row.fieldByName("sms"));
	 row.next();
	 }*/
	db.close();
});
$.sms_1_but.addEventListener("click", function() {

});
/*
var activityIndicator = Ti.UI.createActivityIndicator({
message : '  Loading...',
color : "white"
});
*/
//$.loading_view.add(activityIndicator);

/*
 $.sms1_win.addEventListener("open", function() {
 if (!sms1_loaded || !sms2_loaded) {
 $.loading_view.show();
 activityIndicator.show();
 } else {
 $.loading_view.hide();
 activityIndicator.hide();
 }
 });
 */
var db = Ti.Database.open('smsDB');
//db.execute('CREATE TABLE IF NOT EXISTS favouritesms (id INTEGER PRIMARY KEY, sms TEXT, msgid INTEGER);');
db.execute('CREATE TABLE IF NOT EXISTS sms (id INTEGER PRIMARY key, sms TEXT, msgid INTEGER, subid INTEGER, fav INTEGER);');
db.close();

function addFav(msgid) {
	var db = Ti.Database.open('smsDB');
	db.execute('UPDATE sms SET fav=1 WHERE msgid=?', msgid);
	db.close();
}

function delFav(msgid) {
	var db = Ti.Database.open('smsDB');
	db.execute('UPDATE sms SET fav=0 WHERE msgid=?', msgid);
	db.close();
}

function getFavs() {
	var db = Ti.Database.open('smsDB');
	var row = db.execute("SELECT * FROM sms WHERE fav=1");
	return row;
	db.close();
};

function addSms(sms, msgid, subid) {
	var db = Ti.Database.open('smsDB');
	db.execute('INSERT INTO sms (sms,msgid,subid,fav) VALUES (?,?,?,?)', sms, msgid, subid, 0);
	db.close();
}

function dbSms1() {
	var db = Ti.Database.open('smsDB');
	var row = db.execute("SELECT * FROM sms WHERE subid='17';");
	return row;
	db.close();
}

function dbSms2() {
	var db = Ti.Database.open('smsDB');
	var row = db.execute("SELECT * FROM sms WHERE subid='36';");
	return row;
	db.close();
}

function checkDatabase() {
	var db = Ti.Database.open("smsDB");
	var num17 = db.execute("SELECT COUNT(*) AS count FROM sms WHERE subid='17'");
	var num36 = db.execute("SELECT COUNT(*) AS count FROM sms WHERE subid='36'");

	//alert("'17'="+num17.fieldByName("count"));
	//alert("'36'="+num36.fieldByName("count"));
	if (num17.fieldByName("count") == 0) {
		var xhr1 = Titanium.Network.createHTTPClient();

		//open post request to get ready messages (Ramadan) from 4jawaly.net.
		xhr1.open("POST", "http://www.4jawaly.net/apiSjawaly/getreadymsg.php");

		//send data to choose ramadan messages.
		xhr1.send({
			"username" : "marwanzak",
			"password" : "01123581321",
			"maxperone" : "10",
			"gsubid" : "17",
			"return" : "json"
		});

		xhr1.onload = function() {

			var messages = JSON.parse(this.responseText);
			if (messages.Code == "118") {
				alert(messages.MessageIs);
				return false;
			}
			for (var i = 0; i < messages.Numbers.length; i++) {
				var db = Ti.Database.open("smsDB");
				db.execute('INSERT INTO sms (sms,msgid,subid,fav) VALUES (?,?,?,?)', messages.Numbers[i].SMS, messages.Numbers[i].SMSID, messages.Numbers[i].subgroupID, 0);
				//alert(messages.Numbers[i].SMSID+"dsfdf"+messages.Numbers[i].subgroupID);
				//addSms(messages.Numbers[i].SMS, messages.Numbers[i].SMSID, messages.Numbers[i].subgroupID);
			}
		}
	}

	if (num36.fieldByName("count") == 0) {

		//get messages using ajax.
		var xhr2 = Titanium.Network.createHTTPClient();

		//open post request to get ready messages (Ramadan) from 4jawaly.net.
		xhr2.open("POST", "http://www.4jawaly.net/apiSjawaly/getreadymsg.php");

		//send data to choose ramadan messages.
		xhr2.send({
			"username" : "marwanzak",
			"password" : "01123581321",
			"maxperone" : "10",
			"gsubid" : "36",
			"return" : "json"
		});

		xhr2.onload = function() {
			var messages = JSON.parse(this.responseText);

			if (messages.Code == "118") {
				alert(messages.MessageIs);
				return false;
			}

			for (var i = 0; i < messages.Numbers.length; i++) {
				var db = Ti.Database.open("smsDB");
				db.execute('INSERT INTO sms (sms,msgid,subid,fav) VALUES (?,?,?,?)', messages.Numbers[i].SMS, messages.Numbers[i].SMSID, messages.Numbers[i].subgroupID, 0);
				//addSms(messages.Numbers[i].SMS, messages.Numbers[i].SMSID, messages.Numbers[i].subgroupID);
			}
		}
	}
	db.close();
}

checkDatabase();

$.sms1_win.addEventListener("open", function() {
	sms1Get();
	sms2Get();
});

$.sms1_but.addEventListener("click", function(e) {
	$.scroll_container2.hide();
	$.scroll_container1.show();
	$.sms1_win.open();
});

$.sms2_but.addEventListener("click", function(e) {
	$.scroll_container1.hide();
	$.scroll_container2.show();
	$.sms1_win.open();
});

$.sms_2_but.addEventListener("click", function() {
	$.scroll_container1.hide();
	$.scroll_container2.show();
});

$.sms_1_but.addEventListener("click", function() {
	$.scroll_container2.hide();
	$.scroll_container1.show();
});

function sms1Get() {
	$.scroll_view1.removeAllChildren();
	var rows = dbSms1();

	while (rows.isValidRow()) {

		var msg_view = Ti.UI.createView({
			width : "80%",
			backgroundColor : "#FFE9C9",
			borderWidth : 2,
			borderColor : "blue",
			top : "5dp",
			opacity : 0.8,
			height : Ti.UI.SIZE
		});

		var msg = Ti.UI.createLabel({
			text : rows.fieldByName("sms"),
			width : "70%",
			top : "5dp",
			bottom : "20dp",
			msgid : rows.fieldByName("msgid"),
			font : {
				fontSize : "20dp",
			},
			color : "black",
			borderColor : "black",
			borderWidth : "1dp",
			height : Ti.UI.SIZE
		});

		var msg_bot = Ti.UI.createView({
			borderColor : "red",
			borderWidth : "1dp",
			bottom : 0,
			width : Ti.UI.FILL,
			height : "20dp"
		});

		var msg_send = Ti.UI.createView({
			borderColor : "#fff",
			borderWidth : "1dp",
			left : 0,
			width : "20dp",
			height : "20dp",
			backgroundColor : "#fff",
			msg : rows.fieldByName("sms")
		});

		var msg_fav = Ti.UI.createView({
			borderColor : "#000",
			borderWidth : "1dp",
			left : "30dp",
			width : "20dp",
			height : "20dp",
			backgroundColor : "#000",
			msgid : rows.fieldByName("msgid"),
			fav : rows.fieldByName("fav")

		});

		if (rows.fieldByName("fav") == "1") {
			msg_fav.setBackgroundColor("#f10");
		}

		msg_fav.addEventListener("click", function(e) {
			if (e.source.fav == "0") {
				addFav(e.source.msgid);
				e.source.setBackgroundColor("#f10");
			}
		});

		msg_send.addEventListener("click", function(e) {
			Ti.Platform.openURL("sms:" + e.source.msg);
		});

		msg_bot.add(msg_send);
		msg_bot.add(msg_fav);

		msg_view.add(msg);
		msg_view.add(msg_bot);
		$.scroll_view1.add(msg_view);
		rows.next();
	}
}

function sms2Get() {
	$.scroll_view2.removeAllChildren();
	var rows = dbSms2();

	while (rows.isValidRow()) {

		var msg_view = Ti.UI.createView({
			width : "80%",
			backgroundColor : "#FFE9C9",
			borderWidth : 2,
			borderColor : "blue",
			top : "5dp",
			opacity : 0.8,
			height : Ti.UI.SIZE
		});

		var msg = Ti.UI.createLabel({
			text : rows.fieldByName("sms"),
			width : "70%",
			top : "5dp",
			bottom : "20dp",
			msgid : rows.fieldByName("msgid"),
			font : {
				fontSize : "20dp",
			},
			color : "black",
			borderColor : "black",
			borderWidth : "1dp",
			height : Ti.UI.SIZE
		});

		var msg_bot = Ti.UI.createView({
			borderColor : "red",
			borderWidth : "1dp",
			bottom : 0,
			width : Ti.UI.FILL,
			height : "20dp"
		});

		var msg_send = Ti.UI.createView({
			borderColor : "#fff",
			borderWidth : "1dp",
			left : 0,
			width : "20dp",
			height : "20dp",
			backgroundColor : "#fff",
			msg : rows.fieldByName("sms")
		});

		var msg_fav = Ti.UI.createView({
			borderColor : "#000",
			borderWidth : "1dp",
			left : "30dp",
			width : "20dp",
			height : "20dp",
			backgroundColor : "#000",
			msgid : rows.fieldByName("msgid"),
			fav : rows.fieldByName("fav")
		});

		if (rows.fieldByName("fav") == "1") {
			msg_fav.setBackgroundColor("#f10");
		}

		msg_fav.addEventListener("click", function(e) {
			if (e.source.fav == "0") {
				addFav(e.source.msgid);
				e.source.setBackgroundColor("#f10");
			}
		});
		msg_send.addEventListener("click", function(e) {
			alert(e.source.msg);
			Ti.Platform.openURL("sms:" + e.source.msg);
		});

		msg_bot.add(msg_send);
		msg_bot.add(msg_fav);

		msg_view.add(msg);
		msg_view.add(msg_bot);
		$.scroll_view2.add(msg_view);
		rows.next();
	}
}

$.index.open();
var db = Ti.Database.open('smsDB');
var num = db.execute("SELECT COUNT(*) AS count FROM sms WHERE fav=1");
alert(num.fieldByName("count"));
db.close();
