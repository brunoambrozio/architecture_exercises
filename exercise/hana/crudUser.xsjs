var conn = null;
var pstmt = null;
var rs = null;

var body = '';
var record = {};
var output = {
	results: []
};

var rowsAffected = 0;
var statusProc = null;
var statusMsg = '';
	
var schema = "USERSCHEMA";
var table  = "ZTBHR_USER";
	
	/**
	 * GetConnection
	 */    
	function getConnection(){
		
		conn   = $.db.getConnection();
		
		//Seta o schema
		conn.prepareStatement("SET SCHEMA \""+schema+"\"").execute();
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
	 * Read users
	 */
	function read(){
		
		var userid = $.request.parameters.get('userid');
		
		try {
			
			var query = 'SELECT \"USERID\", \"FIRSTNAME\", \"LASTNAME\", \"GENDER\" FROM \"'+table+'\"';    

			if (userid !== null && userid !== '' && userid !== undefined) {
				query += " WHERE USERID = " + userid;   
			}
			
			statusProc = true;
			pstmt = conn.prepareStatement(query);
			rs = pstmt.executeQuery();
			
			while (rs.next()) {
				record = {};
				record.Usrid     = rs.getNString(1);
				record.Firstname = rs.getNString(2);
				record.Lastname  = rs.getNString(3);
				record.Gender    = rs.getNString(4);
				output.results.push(record);
			}

		} 
		catch (e) {
			statusProc = false;
			record.Status = false;
			record.Message = e.message;
			output.results.push(record);
		} 
		finally {
			closeConnection();
		}
		
		return statusProc;
	}

	/*
	 * Create user
	 */    
	function createProcess(){
		
		var userid    = $.request.parameters.get('userid');
		var firstname = $.request.parameters.get('firstname');
		var lastname  = $.request.parameters.get('lastname');
		var gender    = $.request.parameters.get('gender');
		
		try
		{			
            statusProc = true;
			statusMsg = 'User ' + userid + ' created with success!';

			//Create
			pstmt = conn.prepareStatement('INSERT INTO \"' + table + '\" VALUES (?, ?, ?, ?)');
			pstmt.setString(1, userid);
			pstmt.setString(2, firstname);
			pstmt.setString(3, lastname);
			pstmt.setString(4, gender);

			rowsAffected = pstmt.executeUpdate();

			if (rowsAffected === 0) {
				statusProc = false;
				statusMsg = 'User could not be created!';
			}

			// JSON return
			record.Usrid   = userid;
			record.Status  = statusProc;
			record.Message = statusMsg;

		} 
		catch (e) {
			statusProc     = false;
			record.Status  = false;
			record.Message = e.message;
		} 
		finally {
			conn.commit();
			closeConnection();
		} 
		
		output.results.push(record);
		return statusProc;
	}

	/*
	 * Update user
	 */    
	function updateProcess(){

		var userid    = $.request.parameters.get('userid');
		var firstname = $.request.parameters.get('firstname');
		var lastname  = $.request.parameters.get('lastname');
		var gender    = $.request.parameters.get('gender');
		
		try {
			
			statusProc = true;
			statusMsg  = 'User ' + userid + ' updated with success!';
			
			// Update
			var query = "UPDATE " + table + 
						" SET FIRSTNAME = '" + firstname + "'," +
						"     LASTNAME  = '" + lastname  + "'," +
						"     GENDER    = '" + gender    + "'"  +
						" WHERE USERID  = '" + userid    + "'";

			// Execute
			pstmt = conn.prepareStatement(query);
			rowsAffected = pstmt.executeUpdate();

			if (rowsAffected === 0) {
				statusProc = false;
				statusMsg = 'User could not be created!';
			}

			// JSON return
			record.Userid  = userid;
			record.Status  = statusProc;
			record.Message = statusMsg;


		} 
		catch (e) {
			statusProc     = false;
			record.Status  = false;
			record.Message = e.message;
		} 
		finally {
			conn.commit();
			closeConnection();
		} 
		
		output.results.push(record);
		return statusProc;
	}

	/*
	 * Delete user
	 */    
	function deleteProcess(){

		var userid = $.request.parameters.get('userid');
		
		try {
			
			// Default            
			statusProc = true;
			statusMsg  = 'User ' + userid + ' deleted with success!';

			// Query
			var query = "DELETE FROM " + table +
						" WHERE USERID  = '" + userid    + "'";

			// Execute
			pstmt = conn.prepareStatement(query);
			rowsAffected = pstmt.executeUpdate();

			if (rowsAffected === 0) {
				statusMsg = 'User could not be excluded!';
				statusProc = false;
			}

			// JSON return
			record.Codigo  = userid;
			record.Status  = statusProc;
			record.Message = statusMsg;
			
		} 
		catch (e) {
			statusProc     = false;
			record.Status  = false;
			record.Message = e.message;
		} 
		finally {
			conn.commit();
			closeConnection();
		} 
		
		output.results.push(record);
		return statusProc;
	}

	/*
	 * Validate form
	 */    
	function validateForm(pCmd) {
			
		var status = true;
		var msg = '';

		var userid    = $.request.parameters.get('userid');
		var firstname = $.request.parameters.get('firstname');
		var lastname  = $.request.parameters.get('lastname');
		var gender    = $.request.parameters.get('gender');
		
		if (pCmd === 'create' || pCmd === 'update') {
			
			if (userid    === null || userid    === '' || userid    === undefined) {
				status = false;
				msg    = 'Field userid is mandatory.';
			}
			
			if (firstname === null || firstname === '' || firstname === undefined) {
				status = false;
				msg    = 'Field firstname is mandatory.';
			}
			
			if (lastname  === null || lastname  === '' || lastname  === undefined) {
				status = false;
				msg    = 'Field lastname is mandatory.';
			}
			
			if (gender    === null || gender    === '' || gender    === undefined) {
				status = false;
				msg    = 'Field gender is mandatory.';
			}			
		} 
		
		if (pCmd === 'delete') {
			if (userid    === null || userid    === '' || userid    === undefined) {
				status = false;
				msg    = 'Field userid is mandatory.';
			}
		}		
				
		if (status === false) {
			record.Status  = status;
			record.Message = msg;
			output.results.push(record);
		}

		return status;
		
	}

	/* 
		--------------------------------------------
	 	Receive the request and redirects to the right method
		-------------------------------------------- 
	*/
	statusProc = false;
	var aCmd = $.request.parameters.get('cmd');
	var msg = '';

	if (aCmd    === null || aCmd    === '' || aCmd    === undefined) {
	    record.Status  = false;
		record.Message = 'Field cmd is mandatory.';
		output.results.push(record);	    
	} else {
	    statusProc = true;
	}

	if (statusProc === true && validateForm(aCmd) === true) {

		getConnection();

		switch (aCmd) {
			case "read":
				statusProc = read();
				break;
			case "create":
				statusProc = createProcess();
				break;
			case "update":
				statusProc = updateProcess();
				break;
			case "delete":
				statusProc = deleteProcess();
				break;
			default:
		}
	}

	 // Process Return
	body = JSON.stringify(output);
	$.response.setBody(body);
	$.response.contentType = 'application/json';

	if (statusProc === true) {
		$.response.status = $.net.http.OK;
	} else {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	}