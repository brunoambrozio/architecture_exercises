//Database variables
var conn  = null;
var pstmt = null;
var rs    = null;

var schema = "USERSCHEMA"; //your HANA SCHEMA
var table  = "ZTBHR_USER" //your HANA table

var destinationPath = 'com.exercise.hana'; //your HANA package
var destinationName = 'sfsf'; 

//Destination variables
var mdf             = 'cust_BBA_USER' //your SF MDF
var urlSFSF         = 'https://api19.sapsf.com'; //your SF API URL
var uriSFSF         = urlSFSF + '/odata/v2/' + mdf; 
var typeSFSF        = 'SFOData.' + mdf;


//Generic variables
var body   = '';
var record = {};
var output = {
	results: []
};

/**
 * GetConnection
 */    
function getConnection(){
	
	conn   = $.db.getConnection();
	conn.prepareStatement("SET SCHEMA \"" + schema + "\"").execute();
}

/**
 * Close Connection
 */    
function closeConnection(){
	
	if (rs !== null) {
		rs.close();
	}
	
	if (pstmt !== null) {
		pstmt.close();
	}
	
	if (conn !== null) {
		conn.close(); 
	}
}

/*
 * Users integration - read users from HANA Table and integrate on SF through API
 */
function integrateUsers(){
  
    var userid             = '';
    var firstName          = '';
    var lastName           = '';
    var gender             = '';

    var key                   = '';
    var returnAPISFStatus     = '';
    
    var query                 = '';
    var destination           = '';
    var client                = '';
    var request               = '';
    var response              = '';
    var users                 = '';
    
    var outputUsers = {
    	results: []
    };
    
	try {

	    getConnection();
        
        /**
         * 
         * 1 - Search the users
         * 
         */
        query += ' SELECT * FROM ' + table;

		pstmt = conn.prepareStatement(query);
		rs = pstmt.executeQuery();
        
        while (rs.next()) {
            
            record = {};
		    record.USERID		    = rs.getNString(1);
		    record.FIRSTNAME        = rs.getNString(2);
		    record.LASTNAME	        = rs.getNString(3);
		    record.GENDER	        = rs.getNString(4);

		    outputUsers.results.push(record);
        }

		users = outputUsers;

        /**
         * 
         * 3 - Integration on SF
         * 
         */
        destination = $.net.http.readDestination(destinationPath,destinationName);
        client      = new $.net.http.Client();
        request     = new $.web.WebRequest($.net.http.POST, "/upsert");
        request.headers.set("Content-Type","application/json");
        request.headers.set("X-Requested-With","XMLHttpRequest");
         
        for(var row in users.results){

            userid		        = users.results[row]["USERID"];
		    firstName           = users.results[row]["FIRSTNAME"];
		    lastName            = users.results[row]["LASTNAME"];
		    gender              = users.results[row]["GENDER"];

            request.setBody(JSON.stringify(
            {
            "__metadata": {
                "uri": uriSFSF,
                "type":typeSFSF
            },
                "externalCode": userid,
                "cust_firstName": firstName,
                "cust_lastName": lastName,
                "cust_gender": gender
            })); 
            
            //Send requisition to SF
            client.request(request,destination);
            
            //Process response
            response = client.getResponse();
            body = response.body.asString();
            
            record = {};
            record.Message = body;         
            output.results.push(record);
        }   

	} catch (e) {
	    record         = {};
		record.Status  = false;
		record.Message = e.message;
		output.results.push(record);
	} finally {
		closeConnection();
	}
}

    /**
     * This piece of code is used for standalone test.
     * When the job runs, it will call integrateUsers function
     * automatically, because it is set on jobUsersSFSF.xsjob
    
    integrateUsers();
    
	//Retorno
	body = JSON.stringify(output);
	$.response.setBody(body);
	$.response.contentType = 'application/json';
    
    $.response.status = $.net.http.OK;
    */