function geolocationTestbed() {

  var loggers = [];
  var tabs, logs, activeTabId;
  var watchId;
  var onlineStatus;

  var log = function(eName, eArgs)
  {
    var ts = new Date; ts = ts.toISOString();

    for (l in loggers)
    {
      loggers[l].log(ts, eName, eArgs);
    }
  }

  var logOnlineStatusChange = function() {
    log('onLine status changed', navigator.onLine);
    updateOnlineStatus();
  }

  var updateOnlineStatus = function() {
    var status = navigator.onLine ? 'online' : 'offline';
    onlineStatus.setAttribute('class', status);
    onlineStatus.innerHTML = status;
  }

  var successCallback = function(pos) {
    var coordsProperties = ['accuracy',
                            'altitude',
                            'altitudeAccuracy',
                            'heading',
                            'latitude',
                            'longitude',
                            'speed'];

    var coords = JSON.stringify(pos.coords, coordsProperties);
    coords = JSON.parse(coords);

    log('successCallback', {'timestamp':pos.timestamp,'coords':coords});
  }

  var errorCallback = function(error) {
    log('errorCallback', {'code':error.code,'message':error.message});
  }

  var getPosition = function() {
    var options = controlPanel.getOptions();

    log('getCurrentPosition', {'options':options})

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
  }

  var startWatching = function() {
    var options = controlPanel.getOptions();
  
    log('watchPosition', {'options':options});
    watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
  }

  var stopWatching = function()
  {
    navigator.geolocation.clearWatch(watchId);
    log('clearWatch', {'watchId':watchId});
    watchId = undefined;
  }

  var controlPanel = function(id) {
    var dom = document.getElementById(id);

    var positionButton = document.getElementById('position_button');
    var watchButton = document.getElementById('watch_button');
    var copyButton = document.getElementById('copy_button');
    var options;

    var copyPrompt = function() {
      window.prompt('Press CTRL+C or Command+C',
                    document.getElementById('log'+activeTabId).textContent);
    }

    var getValue = function(name) {
      var item = dom.elements.namedItem(name);
      if (item && (item.getAttribute('type') == 'checkbox'))
        return item.checked;

      return item.value;
    };
 
    controlPanel.getOptions = function()
    {
      var timeout = getValue('timeout') * 1000;
      var maximumAge = getValue('maximumAge') * 1000;
      var highAccuracy = getValue('highAccuracy');

      return {'enableHighAccuracy':highAccuracy,
              'timeout':timeout,
              'maximumAge':maximumAge,
              'toString':function() {
                return 'enableHighAccuracy:' + this.enableHighAccuracy + ',timeout:' + this.timeout + ',maximumAge:' + this.maximumAge;
              }};
    }

    var toggleWatch = function() {
      if (watchId !== undefined)
      {
        stopWatching();
        
        watchButton.setAttribute('value', 'Start watching');

        positionButton.removeAttribute('disabled');
      }
      else
      {
        startWatching();

        watchButton.setAttribute('value', 'Stop watching');

        positionButton.setAttribute('disabled', 'disabled');
      }
    }

    positionButton.addEventListener('click', getPosition);
    watchButton.addEventListener('click', toggleWatch);
    watchButton.setAttribute('value', 'Start watching');

    copyButton.addEventListener('click', copyPrompt);
  };

  this.init = function() {
    controlPanel('control_panel');

    tabs = document.getElementById('tabs');
    logs = document.getElementById('logs');

    for (var l in loggers)
      initLogger(l);

    showTab(0);

    var navigatorInfo = JSON.stringify(navigator, ['appName', 'appVersion', 'platform', 'userAgent']);
    navigatorInfo = {'navigator':JSON.parse(navigatorInfo)};

    log('browser info', navigatorInfo);

    onlineStatus = document.getElementById('online_status');

    document.addEventListener('online', logOnlineStatusChange);
    document.addEventListener('offline', logOnlineStatusChange);

    setInterval(updateOnlineStatus, 5000);
    updateOnlineStatus();

    log('initialization complete');
  }

  this.addLogger = function(logger, name) {
    if (!(logger instanceof geolocationTestbedLogger))
      return false;

      logger.name = name;

      loggers.push(logger);
  }

  var showTab = function(id) {
    if (loggers[id] === undefined)
      return false;

    if (activeTabId !== undefined)
    {
      var currentTab = document.getElementById('tab' + activeTabId);
      var currentLogBox = document.getElementById('log' + activeTabId);

      currentTab.setAttribute('class', '');
      currentLogBox.style.display='none';
    }

    var newTab = document.getElementById('tab' + id);
    var newLogBox = document.getElementById('log' + id);

    newTab.setAttribute('class', 'selected');
    newLogBox.style.display='block';

    activeTabId = id;
  }

  var initLogger = function(loggerId) {
    var logShowHide = function(id) { return function() {showTab(id);};};

    //add tab
    var tab = document.createElement('a');
    tab.setAttribute('href', '#');
    //TODO create prefix variable for tab id
    tab.setAttribute('id', 'tab' + loggerId);
    tab.addEventListener('click', logShowHide(loggerId));
    tab.innerHTML = loggers[loggerId].name;

    //add log container
    var logBox = document.createElement('div');
    logBox.setAttribute('id', 'log' + loggerId);
    logBox.style.display = 'none';
    
    //append tab and logBox
    tabs.appendChild(tab);
    logs.appendChild(logBox);

    //init logger object
    loggers[loggerId].init(logBox);
  }
}

