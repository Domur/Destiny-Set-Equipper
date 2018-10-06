
var ajaxTotal = 0;

function getResults(id){
	document.getElementById("titletext").innerHTML = "Loading. Refresh if it takes longer than 10 sec";
	$.get("chars/" + id, function(data) {
  	var msg = data;
  	var parsed = JSON.parse(msg);
  	var resp = parsed.Response.characters.data;
  	document.getElementById("titletext").innerHTML = JSON.stringify(resp);
	});
}

function sendData(){
	var encodedtok = encodeURIComponent(localStorage.getItem("access_token"));
	console.log(encodedtok);
	$.get("token/" + encodedtok, function(){
		fetchData();
	});
}

function fetchData(){
	console.log("in it");
	$.get("getequipped/", function(data) {
  		var msg = data;
  		var parsed = JSON.parse(msg);
  		console.log(parsed);
  		var element = document.getElementsByClassName("accounts")[0];
  		parsed.Response.destinyMemberships.forEach(function(obj) {
  			element.insertAdjacentHTML('beforeend','<h2 class=\"account\" id=' + obj.membershipId + ' data-membertype=' + obj.membershipType + ' onclick=\"getChar(this.id)\"><span>' + obj.displayName + '</span></h2>');
  			
  		});
	});
}

function getChar(Id){
	var account = document.getElementById(Id);
	var type = account.getAttribute("data-membertype");
	var characters = [];
	var items = [];
	var element = document.getElementsByClassName("results")[0];
	console.log(Id + " " + type);
	$.get("getchar/" + type + "/" + Id, function(data) {
  		var msg = data;
  		var parsed = JSON.parse(msg);
  		for (var chars in parsed){
  			characters.push(parsed[chars].items);
  		}
  		for(var char in characters){
  			//console.log(characters[char]);
  			for(var item in characters[char]){
  				items.push(characters[char][item].itemHash);
  			}
  		}
  		scatterAjax(items, 0, element);
	});
}

function scatterAjax(arr, index, element){
	if(index >= arr.length){
		return;
	}
	ajaxTotal = ajaxTotal + 1;
	$.ajax({
     	async: true,
     	type: 'GET',
		  url: "getitemdata/DestinyInventoryItemDefinition/" + arr[index],
     	success: function(data2) {
        var msg2 = data2;
  		var parsed2 = JSON.parse(msg2);
  		var piclink = parsed2.Response.displayProperties.icon
  		console.log(parsed2.Response.displayProperties);
  		element.insertAdjacentHTML('beforeend','<img class="gear" src="https://www.bungie.net' + piclink +  '" alt="' + parsed2.Response.displayProperties.name + '" width="75" height="75">');
  		ajaxTotal = ajaxTotal - 1;
  		if(ajaxTotal <= 10){
			scatterAjax(arr, index + 1, element);
		}
		else{
			console.log("DONE");
		return;
		}
   		}
	});

}

if(document.URL.indexOf("?code=") >= 0){ 
	var code = window.location.search.substring(6,window.location.search.length);
	console.log(code);
	localStorage.clear();
	if (localStorage.getItem("access_token") === null) {
		$.get("login/" + String(code), function(data) {
  		var msg = data;
  		var parsed = JSON.parse(msg);
  		console.log(parsed.access_token);
  		localStorage.setItem('access_token', parsed.access_token);
  		localStorage.setItem('refresh_token', parsed.refresh_token);
  		localStorage.setItem('memberId', parsed.membership_id);
  		fetchData();
  		window.location.href = "<redirect site>";
		});
		
	}
	else{
		alert("token already there: " + localStorage.getItem("memberId"));
	}
}

if (localStorage.getItem("access_token") === null) {
	console.log("u gotta sign in");
}
else{
		console.log("should now call functions to display data");
		sendData();
}
