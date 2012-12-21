function initTestbed()
{
  gtb = new geolocationTestbed;
  gtb.addLogger(new textLogger, 'Text');
  gtb.addLogger(new jsonLogger, 'JSON');
  gtb.addLogger(new tableLogger, 'Table');
  gtb.addLogger(new gpxLogger, 'GPX');
  gtb.init();
}

window.addEventListener('load', initTestbed);
