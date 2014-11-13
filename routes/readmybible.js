var http = require('http');
var querystring = require('querystring'); 

var $ = require('jquery');
var sys = require('sys');
var fs = require('fs');
var Mustache = require('./mustache');


function fnProcessData(html) {
	var jResult = [];
	var jIndex = 1;
	console.info('\n\nProcessing data');
	var iStart  = html.indexOf('<form name=');
	var sHtml1  = html.slice(iStart);
	var iEnd    = sHtml1.indexOf('table');
	var sResult = sHtml1.slice(0,iEnd); 
	//console.info('\n\n' + sResult);
	var aOptions = sResult.split('checkbox');
	var sValueBook = "";	
	var sValueBookEnd = "";
	var sValue1 = "";
	var sValue2 = "";
	var sValue3 = "";
	var sValue4 = "";
	var sBook = "";
	var sId = "";
	var sMb = "";
	var sPe = "";
	var sEnd = "";
	var sText = "";
	var iBook = 0; 	
	var iBookEnd = 0;
	var iId = 0;
	var iMb = 0;
	var iPe = 0;
	var iEnd = 0;
	var sJson = "";
	for(var i = 0; i < aOptions.length; i++){
		sValueBook = aOptions[i];
		sValueBookEnd = aOptions[i];
		sValue1 = aOptions[i];
		sValue2 = aOptions[i];
		sValue3 = aOptions[i];
		sValue4 = aOptions[i];
		iBook = parseInt(sValueBook.indexOf('lightpurpleTitle12'));
		iBookEnd = parseInt(sValueBookEnd.indexOf('<\/span>'));
		iId = parseInt(sValue1.indexOf('value'));
		iMb = parseInt(sValue2.indexOf('title'));
		iPe = parseInt(sValue3.indexOf('&nbsp'));
		iEnd = parseInt(sValue4.indexOf('<br>'));
		
		

		if (iId > 0) {
			sId = sValue1.slice(iId + 7, iId + 10);
			sMb = sValue2.slice(iMb + 7, iMb + 11);
			sPe = sValue3.slice(iPe + 6, iEnd);
			sJson = "{ \"id\" : \"" + sId + "\", \"mb\" : \"" + sMb + "\", \"book\" : \"" + sBook + "\", \"name\" : \"" + sPe + "\"}";
			jResult.push(sJson);
			//console.info('\n\n' + sId + "=" + sMb);
			//console.info('\n\n' + sJson);
			jIndex++;
		} else {
			sBook = sValueBook.slice(iBook + 20, iBookEnd);
		}
	}



	return jResult;
}


function fnProcessMp3(html,id) {
	var jResult = [];
	var jIndex = 1;
	console.info('\n\nProcessing mp3');
	var iStart  = html.indexOf('De bijbelfragmenten downloaden');
	var sHtml1  = html.slice(iStart);
	var iEnd    = sHtml1.indexOf('\/table');
	var sResult = sHtml1.slice(0,iEnd); 
	//console.info('\n\n' + sResult);
	var aOptions = sResult.split('<a href');
	var sValue1 = "";
	var sValue2 = "";
	var sHref = "";
	var iHref = 0; 	
	var iHrefEnd = 0;
	var sJson = "";
	for(var i = 1; i < aOptions.length - 1; i++){
		sValue1 = aOptions[i];
		iHref = parseInt(sValue1.indexOf('\"'));
		sValue2 = sValue1.slice(iHref + 1);
		iHrefEnd = parseInt(sValue2.indexOf('\"'));
		sHref = sValue2.slice(0, iHrefEnd);
		sJson = "{ \"id\" : \"" + id + "\", \"url\" : \"" + sHref + "\"}";
		jResult.push(sJson);
		//console.info('\n\nmp3 url ' + id + "=" + sHref);
		//console.info('\n\n' + sJson);
		jIndex++;
	}



	return jResult;
}

exports.findById = function(req, res) {

	/**
	 * Get bijbelboeken -> selectie_perikopen[] contains number of biblebook (1..77)
	 */
	
	// declare output
	var jOutput = [];
	var jsonResult = "";
	var oResult = {};


	// do a POST request
	// create the JSON object
	jInput ={
	    "selectie_perikopen[]" : req.params.id,
	    "verder" : "Verder >"
	};

	// Build the post string from an object
	var post_data = querystring.stringify(jInput);

 
	// prepare the header
	var postheaders = {
	        'Content-Type': 'application/x-www-form-urlencoded',
	        'Content-Length': post_data.length,
	    	'Accept' : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	    	'Accept-Language' : 'nl,en-us;q=0.7,en;q=0.3',
	    	'Connection' : 'keep-alive',
	    	'User-Agent' : 'Mozilla/5.0 (Windows NT 5.1; rv:27.0) Gecko/20100101 Firefox/27.0'
	}; 
 
	// the post options
	var optionspost = {
    		host : 'www.voorleesbijbel.nl',
    		port : '80',
		path : '/download/toon_perikopen.php',
	    	method : 'POST',
 	    	headers : postheaders
	};
 
	console.info('Options prepared:');
	console.info(optionspost);
	console.info('data prepared:');
	console.info(post_data);
	console.info('Do the POST call');
 
	// do the POST call
	var reqPost = http.request(optionspost, function(response) {
	   var sResponse = "";
 	   console.log("statusCode: ", response.statusCode);
 	   // uncomment it for header details
 	   console.log("headers: ", response.headers);
 
	    response.on('data', function(datapart) {
	        //console.info('POST result:\n');
 	        //process.stdout.write(datapart);
		if(datapart != null && datapart != "") {
            		sResponse += datapart; 
        	} 

	    });
	    response.on('end', function() {
		jOutput = fnProcessData(sResponse);
 	        console.info('\n\nPOST completed');
		console.info('\n\nResponse...' + jOutput.length);
		jsonResult = "[";
		for(var i = 0; i < jOutput.length; i++){
			//console.info('\n\nDisplay response ' + i);
			if (i>0) {
		  		jsonResult += ", " + jOutput[i];
			} else {
				jsonResult += jOutput[i].toString();	
			}
		}
		jsonResult += "]";
		//console.info('\n\nJSON response 1=' + jsonResult);
		oResult = JSON.parse(jsonResult);
		//res.send(jsonResult);
		res.send(oResult);
	    })

	});
 
	// write the json data
	reqPost.write(post_data);
	reqPost.end();
	reqPost.on('error', function(e) {
    		console.error(e);
	});


};
 



exports.findMp3ById = function(req, res) {

	/**
	 * Get Mp3 -> perikopen_downloaden[] contains id of the perikoop (1..77)
	 */
	
	// declare output
	var jOutput = [];
	var jsonResult = "";
	var oResult = {};
	var id = "";

	//support for query params
	if (req.query.id > 0) {
		console.info('query ID found:' + id);
		id = req.query.id;
	} else {
		console.info('param ID found:' + id);
		id = req.params.id;
	}
	

	// do a POST request
	// create the JSON object
	jInput ={
	    "perikopen_downloaden[]" : id,
	    "hiddentotal" : "0",
	    "totaal_alles" : req.params.mb,
	    "download" : "Download >"	
	};

	// Build the post string from an object
	var post_data = querystring.stringify(jInput);

 
	// prepare the header
	var postheaders = {
	        'Content-Type': 'application/x-www-form-urlencoded',
	        'Content-Length': post_data.length,
	    	'Accept' : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	    	'Accept-Language' : 'nl,en-us;q=0.7,en;q=0.3',
	    	'Connection' : 'keep-alive',
	    	'User-Agent' : 'Mozilla/5.0 (Windows NT 5.1; rv:27.0) Gecko/20100101 Firefox/27.0'
	}; 
 
	// the post options
	var optionspost = {
    		host : 'www.voorleesbijbel.nl',
    		port : '80',
		path : '/download/downloaden.php',
	    	method : 'POST',
 	    	headers : postheaders
	};
 
	console.info('Options prepared:');
	console.info(optionspost);
	console.info('data prepared:');
	console.info(post_data);
	console.info('Do the POST call');
 
	// do the POST call
	var reqPost = http.request(optionspost, function(response) {
	   var sResponse = "";
 	   console.log("statusCode: ", response.statusCode);
 	   // uncomment it for header details
 	   console.log("headers: ", response.headers);
 
	    response.on('data', function(datapart) {
	        console.info('POST result:\n');
 	        //process.stdout.write(datapart);
		if(datapart != null && datapart != "") {
            		sResponse += datapart; 
        	} 

	    });
	    response.on('end', function() {
		jOutput = fnProcessMp3(sResponse, id);
 	        console.info('\n\nPOST completed');
		console.info('\n\nResponse...' + jOutput.length);
		jsonResult = "[";
		for(var i = 0; i < jOutput.length; i++){
			//console.info('\n\nDisplay response ' + i);
			if (i>0) {
		  		jsonResult += ", " + jOutput[i];
			} else {
				jsonResult += jOutput[i].toString();	
			}
		}
		jsonResult += "]";
		//console.info('\n\nJSON response 1=' + jsonResult);
		oResult = JSON.parse(jsonResult);
		//res.send(jsonResult);
		res.send(oResult);
	    })

	});
 
	// write the json data
	reqPost.write(post_data);
	reqPost.end();
	reqPost.on('error', function(e) {
    		console.error(e);
	});


};

function fnInitBooks(parent, iBookNumber) {

	console.info("fnInitBooks");
	var sReturn = "";
	//var http = require('http');

	var options = {
	  host: 'readmybible.herokuapp.com',
	  path: '/books/' + iBookNumber,
	  port: port,
	  headers: {'custom': 'ReadMyBible v2'}
	};

	callback = function(response) {
		console.info("callback fnInitBooks");
  		var str = ''
  		response.on('data', function (chunk) {
    			str += chunk;
  		});

  		response.on('end', function () {
    			console.log('on end');
			sReturn = "done";
			parent.write('<h2>' + sReturn + '</h2>');
			console.log('done');

			console.info(str);	

			var allbooks = JSON.parse(str);
			
			
			console.log("Books found");
			//console.log(allbooks[1].id);
	

			// process data en show data
			console.info("Show biblebooks");
/*
	       		var mybooks = { books: [
        			    { 'book': 'Genesis', 'id': '5' },
		            	    { 'book': 'Exodus', 'id': '6' },
		            	    { 'book': 'Leviticus', 'id': '7' }
        			]};
*/

	       		var mybooks = { books: allbooks};
			//console.log(mybooks.books[3].id);

			// show data
       			var template = "<FORM NAME='selectbook' METHOD='get' ACTION='books/mp3/id'><SELECT NAME='id'>{{#books}}<OPTION VALUE='{{id}}'>{{book}} - {{name}} - {{mb}}</OPTION>{{/books}}</SELECT><INPUT TYPE='submit' VALUE='Selecteer boek'></FORM>";
			parent.write(Mustache.render(template, mybooks));
			
			parent.end();
			return sReturn;
  		});
	};

	var req = http.request(options, callback);
	req.end();

	return sReturn;


}

exports.home = function(req, res) {

	var actions = [];
	actions.push({
  		path: "",
  		template: "index.html",
  		view: {
  		  title: "John",
  		  age: function() { return 20 + 4; }
  		}
	});
		
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write('<script>function getBook(id) { alert(id); }</script>');
	res.write('<h2>ReadMyBible v0.0.1</h2>');
	
       	console.info("Read biblebooks");
	// prepare get call
	res.write('<h2>Initializing..</h2>');
	var myBooks = fnInitBooks(res, '19');
	console.info("returned to main routine");
	
	res.write('<h2>Kies een bijbelboek</h2>');
	

	//fs.readFile(actions[0].template,function(err,template) {

		// perform get call
	

   	//})


	


	//res.writeHead(200, {'Content-Type': 'text/html'});
    	//res.send('<html><head><title>Readmybible</title></head><body><h1>ReadMyBible v2</h1></body></html>');
};

