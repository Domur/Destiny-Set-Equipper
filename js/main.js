var ajaxTotal = 0;
var membertype;
var charId;
var gIndex = 0;

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
	$.get("token/" + encodedtok, function(){
		fetchData();
	});
}

function fetchData(){
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
	membertype = account.getAttribute("data-membertype");
	var characters = [];
	var characters2 = [];
	var items = [];
	var element = document.getElementsByClassName("results")[0];
	$.get("getchar/" + membertype + "/" + Id, function(data) {
  		var msg = data;
  		var parsed = JSON.parse(msg);
  		console.log(parsed);
  		for (var chars in parsed.characterEquipment.data){
  			charId = Object.keys(parsed.characterEquipment.data)[0];
  			characters.push(parsed.characterEquipment.data[chars].items);
  		}
  	
  		for(var char in characters){
  			for(var item in characters[char]){
  				items.push(characters[char][item]);
  			}
  		}
  		for (var chars2 in parsed.characterInventories.data){
  			characters2.push(parsed.characterInventories.data[chars2].items);
  		}
  	
  		for(var char2 in characters2){
  			for(var item2 in characters2[char2]){
  				items.push(characters2[char2][item2]);
  			}
  		}
  		scatterAjax(items, 0, element);
	});
}

function scatterAjax(arr, index, element){
	if(index >= arr.length){
		return;
	}
	console.log(arr[0]);
	ajaxTotal = ajaxTotal + 1;
	gIndex = gIndex + 1;
	$.ajax({
     	async: true,
     	type: 'GET',
		url: "getitemdata/DestinyInventoryItemDefinition/" + arr[gIndex].itemHash,
     	success: function(data2) {
	        var msg2 = data2;
	  		var parsed2 = JSON.parse(msg2);
	  		var piclink = parsed2.Response.displayProperties.icon
	  		console.log(parsed2.Response.displayProperties);
	  		element.insertAdjacentHTML('beforeend','<img class="gear" id=' + arr[index].itemInstanceId + ' src="https://www.bungie.net' + piclink +  '" alt="' + parsed2.Response.displayProperties.name + '" width="75" height="75" onclick="equipItem(this.id)">');
	  		ajaxTotal = ajaxTotal - 1;
	  		if(ajaxTotal < 10){
				scatterAjax(arr, gIndex, element);
			}
	   	},
   		error: function(){
   			ajaxTotal = ajaxTotal - 1;
   			scatterAjax(arr, index, element);
   		}
	});
	if(ajaxTotal < 20){
		scatterAjax(arr, index + 1, element);
	}

}

function equipItem(itemId){
	$.get("equipitem/" + itemId + "/" + charId + "/" + membertype, function(data){
		var equipData = JSON.parse(data);
		console.log(equipData);
	});
}

if(document.URL.indexOf("?code=") >= 0){ 
	var code = window.location.search.substring(6,window.location.search.length);
	localStorage.clear();
	if (localStorage.getItem("access_token") === null) {
		$.get("login/" + String(code), function(data) {
  		var msg = data;
  		var parsed = JSON.parse(msg);
  		//console.log(parsed.access_token);
  		localStorage.setItem('access_token', parsed.access_token);
  		localStorage.setItem('refresh_token', parsed.refresh_token);
  		localStorage.setItem('memberId', parsed.membership_id);
  		fetchData();
  		window.location.href = "https://www.drewblu.com/";
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
	//console.log("should now call functions to display data");
	sendData();
}
