var express = require('express')
  , home = require('./routes/home')  
  ,reports = require('./routes/reports')
  , alerts = require('./routes/alerts')
  //, login = require('./routes/login') 
 // , login = require('./routes/login') 
 // , building = require('./routes/building')
 // , client = require('./routes/client')
 // , guard = require('./routes/guard')
  , http = require('http')    
  , path = require('path');
  //, con = require('./routes/mysql_connpool');


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.cookieParser());
app.use(express.session({ secret: 'i study', cookie: { maxAge: 6000000 }}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//user
app.get('/', home.index);
app.post('/', home.login);
app.get('/logout', home.logout);
app.get('/dashboard', home.dashboard);
app.get('/profile', home.profile);

//display
app.get('/displayGuard/:guardId', home.displayGuard);
app.get('/displayClient/:clientId', home.displayClient);
app.get('/displayReport', home.displayReport);
app.get('/displayBuilding', home.displayBuilding);
app.get('/showReport', home.showReport);

//getDetails
app.post('/getGuardDetails', home.getGuardDetails);
app.get('/getAllGuards', home.getAllGuards);
app.post('/getBuildingsForGuards',home.getBuildingsForGuards);

//create
app.post('/createNewGuard', home.createNewGuard);
app.get('/createReport', home.createReport);
app.post('/creatingReport',home.creatingReport);

//edit
app.put('/updateGuardDetails', home.updateGuardDetails);
app.put('/updateCheckpointGuard', home.updateCheckpointGuard);
app.put('/unassignGuard', home.unassignGuard);
app.put('/updateClient', home.updateClient);

//delete
app.put('/deleteGuard', home.deleteGuard);
app.delete('/deleteClient/:clientId', home.deleteClient);

//search
app.get('/searchClients', home.searchClients);
app.get('/searchBuildings', home.searchBuildings);
app.get('/searchGuards', home.searchGuard);
app.get('/searchReports', home.searchReports);
app.get('/searchAlerts', home.searchAlerts);
app.get('/getBuildings', home.getBuildings);
app.get('/getBuildingsForClient/:clientId', home.getBuildingsForClient);
app.post('/searchReportsresult', reports.searchReports);
app.get('/clientcriteria', reports.clientcriteria);
app.post('/buildingcriteria', reports.buildingcriteria);
app.post('/alertcriteria', alerts.alertcriteria);
app.post('/searchAlertsResults', alerts.searchAlerts);
app.post('/searchingGuard',home.searchingGuard);



//searchBySearchString
app.get('/searchBuildingByName/:searchString', home.searchBuildingByName);
app.get('/searchClientByName/:searchString', home.searchClientByName);
app.get('/getAllClients', home.getAllClients);
app.get('/getCheckpointsByBuilding/:buildingId', home.getCheckpointsByBuilding);
app.get('/getAllAlerts',home.getAllAlerts);
app.get('/getCheckpoints/:buildingId',home.getCheckpoints); //praveen - filter on building and guard

//app.get('/getClientAndGuardDetails',home.getClientAndGuardDetails);
//app.get('/getBuldingAndAlertsDetails',home.getBuldingAndAlertsDetails);

//displayBuilding and dashboard
app.post('/deleteBuilding', home.deleteBuilding);
app.post('/deleteCP', home.deleteCP);
app.post('/buildingDetails', home.buildingDetails);
app.post('/createCP', home.createCP);
app.post('/updateCP', home.updateCP);
app.post('/updateBuilding', home.updateBuilding);
app.post('/dashboardMap', home.dashboardMap);
app.post('/createBuilding', home.createBuilding);

//create
app.get('/createGuard', home.createGuard);
app.post('/createClient', home.createClient);
app.get('/createReport', home.createReport);
app.get('/createAlertType', home.createAlertType);
app.get('/checkIn',home.checkIn);
app.post('/checkIn',home.checkedIn);

app.post('/saveAlertType', home.saveAlertType);
app.post('/saveAlert', home.saveAlert);

app.get('/checkIn',home.checkIn);
app.get('/submitAlert',home.submitAlert);

app.get('/promis', home.promis);

http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});
