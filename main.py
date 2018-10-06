import webapp2
import requests
import requests_toolbelt.adapters.appengine
import json
import urllib
from google.appengine.api import urlfetch
urlfetch.set_default_fetch_deadline(15)
from flask import Flask, request
app = Flask(__name__)

requests_toolbelt.adapters.appengine.monkeypatch()
import platform


class MainPage(webapp2.RequestHandler):
		
	@app.route("/chars/<data>")
	def chars(data):
		headers = {"X-API-Key": "<api key>"}
		getMember = requests.get("https://www.bungie.net/Platform/User/GetMembershipsById/" + data + "/0/", headers = headers)
		memberJSON = getMember.json()
		for member in memberJSON["Response"]["destinyMemberships"]:
			if(member["membershipType"] == 4):
				membershipId = member["membershipId"]
				break
		
		getChars = requests.get("https://www.bungie.net/Platform/Destiny2/4/Profile/" + membershipId + "?components=Characters", headers = headers)
		charsJSON = json.loads(getChars.text)
		return (json.dumps(charsJSON))

	@app.route("/login/<data>")
	def login(data):
		authCode = data
		b64 = 'Basic <Base 64 encoded client_id:client_secret>'
		HEADERS = {'Content-Type': 'application/x-www-form-urlencoded;', 'Authorization': b64}
		post_data = {'grant_type': 'authorization_code', 'code': authCode}
		response = requests.post("https://www.bungie.net/Platform/App/OAuth/Token/", data=post_data, headers=HEADERS)
		loginJSON = json.loads(response.text)
		info = response.json()
		global access_token
		access_token = urllib.unquote(info["access_token"])
		print(access_token)
		global memberId
		memberId = info["membership_id"]
		return(json.dumps(loginJSON))
		
	@app.route("/getequipped/")
	def getequipped():
		global access_token
		headers = {"X-API-Key": "<api key>", 'Authorization': 'Bearer ' + access_token}
		getMember = requests.get("https://www.bungie.net/Platform/User/GetMembershipsForCurrentUser/", headers = headers)
		print(getMember)
		memberJSON = getMember.json()
		return(json.dumps(memberJSON))
		
	@app.route("/token/<path:path>")
	def token(path):
		print("IN /TOKEN")
		global access_token
		access_token = urllib.unquote(path)
		print("ACCESS 1: " + access_token)
		return "200"

    	
	@app.route("/getchar/<type>/<id>")
	def getchar(type, id):
		headers = {"X-API-Key": "<api key>", 'Authorization': 'Bearer ' + access_token}
		getCharInfo = requests.get("https://www.bungie.net/Platform/Destiny2/" + type + "/Profile/" + id + "/?components=CharacterEquipment", headers = headers)
		itemJSON = json.loads(getCharInfo.text)
		charsItems = itemJSON["Response"]["characterEquipment"]["data"]
		return json.dumps(charsItems)
		
	@app.route("/getitemdata/<type>/<hash>")
	def getitemdata(type, hash):
		headers = {"X-API-Key": "<api key>"}
		response = requests.get("http://www.bungie.net/Platform/Destiny2/Manifest/" + type + "/" + hash + "/", headers=headers)
		rJSON = response.json()
		return(json.dumps(rJSON))
							
if __name__ == "__main__":
	app.run()
