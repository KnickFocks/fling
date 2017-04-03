var swipeOptions = {
	id:'swipeContainer',
	threshold:5,
	touchStartFunction: onTouchState,
	touchMoveFunction: onTouchMove,
	touchEndFunction: onTouchEnd,
	swipeUpFunction: onSwipeUp,
	swipeDownFunction: null,
	swipeLeftFunction: null,
	swipeRightFunction: null,
	noSwipeFunction:onSwipeTap
};

var offsetLeft;
var currentView = 0;

function load() {

  setupSecurity()

  return Promise.resolve()
  .then(getExperience)
  .then(renderListView)
}

function getExperience () {
  var experienceParamUuid = exp.player.params.experience || '78f15a25-bf7c-43e4-8524-a3565945e2ae';
  var apiCall = ( experienceParamUuid !== null ) ? exp.getExperience( experienceParamUuid ) : exp.getCurrentExperience();
  return apiCall;
}

function renderListView (res) {
  window.experience = res;
  var apps = res.document.apps;
  var playlist = apps.find( function (app) {
      console.log('App Key', app.key);
      console.log('Config Content Key', exp.app.config.content.key);
      return app.key === exp.app.config.content.key
  });
  var content = playlist.config.slides;

  var html = html2 = '';
  content.forEach(function(child, i){

    child = apps.find( function (app) { return app.key === child.key });
    // this is our "slide" app, the one that is a conatiner for a single slide,
    // if it matches that appTemplate.uuid, we want to pull our image content uuid
    // from it's stored place `child.config.thumb.uuid`
    if ( child.appTemplate.uuid === 'ea600629-0721-475b-afb7-9098f7122203' ) {
      child.url = 'https://api.goexp.io/api/content/' + child.config.thumb.uuid + '/data?_rt='+ JSON.parse( localStorage._authentication ).restrictedToken;
    } else {
      child.url = 'https://api.goexp.io/api/delivery' + encodeUrl( child.path ) + '?_rt='+ JSON.parse( localStorage._authentication ).restrictedToken +'&variant=320.png';
    }
    console.log(child.config);

    html +=  '<div class="container">';
	html +=     '<div class="fling" style="background-image:url(' + getImageSource(exp.app.config.module_flingImage.key) + ');"></div>';
    html +=     '<div class="block swipeAnimation blockScale" style="background-color:' + exp.app.config.module_backgroundColor + '">';
    html +=         '<img class="splash" src="' + getImageSource(child.config.splash.uuid) + '"/>';
	html +=         '<div class="title" style="color:' + exp.app.config.module_titleTextColor + '">' + child.config.title + '</div>';
	html +=         '<div class="subtitle" style="color:' + exp.app.config.module_subtitleTextColor + '">' + child.config.subtitle + '</div>';
	html +=         '<div class="ctaContainer"><div class="ctabutton" onclick=playItem("' + child.key + '") style="color:' + exp.app.config.module_buttonTextColor + '; background-color:' + exp.app.config.module_buttonBackgroundColor + '">' + exp.app.config.module_buttonText + '</div></div>';
    html +=      '</div>';
    html +=  '</div>';

	html2 += '<div class="bubble"></div>';
  });

  document.getElementById('content_bubble_container').innerHTML += html2;
  document.getElementById('swipeContainer').innerHTML = html;
  updateBubbles(currentView);
}

function updateBubbles(index){
    var el = document.getElementsByClassName('bubble');
    var length = el.length;
    for(var i = 0; i < length; i++){
        el[i].style.backgroundColor = exp.app.config.view_bubbleInactive;
    }
    el[index].style.backgroundColor = exp.app.config.view_bubbleActive;
}

function displayExperiences(){
    document.getElementById('instructions').style.left = '-100%';
    document.getElementById('instructions').classList.remove('shadow');
    document.getElementById('content').style.left = '0%';
}

function dismissExperiences(){
	document.getElementById('instructions').style.left = '0%';
    document.getElementById('instructions').classList.add('shadow');
    document.getElementById('content').style.left = '40%';
}

function play(){

	var mySwipe = new Swipe(swipeOptions);
    mySwipe.init();

	window.addEventListener('resize', checkOrientation);
	checkOrientation();

    document.getElementById('swipeContainer').addEventListener('transitionend', removeTransitions);
	document.getElementById('dismiss').addEventListener('click', displayExperiences);
	document.getElementById('instructions_btn').addEventListener('click', dismissExperiences);
    document.getElementsByClassName('block')[0].classList.remove('blockScale');

    var options = exp.app.config;
	// Set Intro Stage
	document.getElementById('instructions').style.backgroundColor = options.intro_backgroundColor;
	document.getElementById('instructions_url').innerHTML = options.intro_url;
	document.getElementsByClassName('instructions_bubble')[0].style.backgroundColor = options.intro_bubbleBackgroundColor;
	document.getElementsByClassName('instructions_bubble')[1].style.backgroundColor = options.intro_bubbleBackgroundColor;
	document.getElementsByClassName('instructions_bubble')[0].style.color = options.intro_bubbleTextColor;
	document.getElementsByClassName('instructions_bubble')[1].style.color = options.intro_bubbleTextColor;
	document.getElementsByClassName('st0')[0].style.fill = options.intro_backgroundColor;
	document.getElementById('dismiss').style.backgroundColor = options.intro_buttonBackgroundColor;
	document.getElementById('dismiss').style.color = options.intro_buttonTextColor;

	// Set Content Stage
    document.getElementById('main').style.backgroundColor = options.view_backgroundColor;
	document.getElementById('main').style.backgroundImage = 'url(' + getImageSource(options.view_backgroundImage.key) + ')';
    document.getElementById('logo').src = getImageSource(options.header_logoImage.key);
	document.getElementById('instructions_btn').src = getImageSource(options.header_instructionsImage.key);
    document.getElementById('header').style.backgroundColor = options.header_backgroundColor;
    document.getElementById('footer').style.backgroundColor = options.footer_backgroundColor;
    document.getElementById('footerCopy').innerHTML = options.footer_text;
    document.getElementById('footerCopy').style.color = options.footer_textColor;
}

function checkOrientation(){
	if(window.innerWidth > window.innerHeight && window.innerWidth < 1024){
		document.getElementById('rotate').style.display = 'block';
	}else{
		document.getElementById('rotate').style.display = 'none';
	}
}

function getImageSource(uuid){
	return 'https://api.goexp.io/api/content/' + uuid + '/data?_rt='+ JSON.parse( localStorage._authentication ).restrictedToken
}

function setupSecurity () {

  window.security = {
    fingerprint: window.localStorage.getItem('expFingerprint') || generateUUID(),
    interactions: ( window.security && window.security.interactions ) ? window.security.interactions : 0
  };
  window.localStorage.setItem('expFingerprint', window.security.fingerprint );

  var security = window.security;

  // immediately load the data we use to track user abuse
  exp.getData('security', security.fingerprint )
  .then(function(data) {
    if (data) {
      var count = data.document.value[security.fingerprint];
      window.security.interactions = count;
    }
    console.log('setupSecurity() security',security)
    return security;
  })


  var securityChannel = exp.getChannel({ consumer: true });
  securityChannel.listen('security', function(data) {
    console.log( 'got update from security channel', security.fingerprint, 'with new count', data[security.fingerprint] )
    var count = data[window.security.fingerprint];
    security.interactions = count;
  });

  return Promise.resolve();
}

function generateUUID () {
  let d = new Date().getTime();
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c === 'x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
}

function encodeUrl (value) {
  return encodeURI(value)
    .replace('!', '%21')
    .replace('#', '%23')
    .replace('$', '%24')
    .replace('&', '%26')
    .replace('\'', '%27')
    .replace('(', '%28')
    .replace(')', '%29')
    .replace(',', '%2C')
    .replace(':', '%3A')
    .replace(';', '%3B')
    .replace('=', '%3D')
    .replace('?', '%3F')
    .replace('~', '%7E');
}

function playItem(key) {

  onSwipeUp();

  var superAdminCode = exp.app.parent.config.superAdminCode;
  var validCodes = [
    exp.app.parent.config.validDisplayUrl.split('?t=')[1],
    exp.app.parent.config.validBeaconCode,
    exp.app.parent.config.superAdminCode
  ];

  //
  // if no valid code, disallow use altogether
  //
  if ( validCodes.indexOf( exp.player.params.t ) === -1 ) {
    console.log('sorry, your code isn\'t valid');
    return;
  }

  var security =  window.security;

  var count = security.interactions;
  security.interactions = ( security.interactions > 0 ) ? security.interactions += 1 : 1;

  console.log('playItem() security',security)

  if ( exp.player.params.t !== superAdminCode && !exp.app.config.limitDisabled && security.interactions > exp.app.config.interactionLimit ) {
    console.log('please stop spamming us, you scum!')
  } else {
    var experience = window.experience;
    var channel = experience.getChannel({ consumer: true });

    var payload = {}
    payload[ security.fingerprint ] = security.interactions;
    exp.createData('security', security.fingerprint, payload)
    .then( function(data) {
      console.log('pushed spam security data', payload);
      channel.broadcast('security', payload);
    }).catch(function(err) { console.log(err); });

    // this is somewhat parallel call is intentionally not synchronous
    // to prevent a 3-call chain & inherent latency
    channel.broadcast('content', { key: key });
    console.log('broadcasted new active item', key);
  }

}

function getUuuidByIndex (index) {
  return document.getElementById('list').children[index].id;
}


// swiping model
function onTouchState(obj){
    offsetLeft = document.getElementById('swipeContainer').offsetLeft;
}

function onTouchMove(obj){
    document.getElementById('swipeContainer').style.left = offsetLeft + obj.touchMoveX - obj.touchStartX + 'px';
}

function onTouchEnd(obj){

    var value;
    var container = document.getElementsByClassName('container');
    var containerOffsetLeft = container[0].offsetLeft;
    var swipeContainer = document.getElementById('swipeContainer');
    var galleryTotal = container.length;
    var swipeContainerLeft = swipeContainer.offsetLeft;
    var element_left = (container[currentView].offsetLeft + ((container[currentView].offsetWidth / 2) - containerOffsetLeft)) * -1;

    if(swipeContainerLeft < element_left && currentView != galleryTotal -1){
        currentView++;
        value = -1 * container[currentView].offsetLeft + containerOffsetLeft;
    }else if(swipeContainerLeft > element_left + container[currentView].offsetWidth && !currentView == 0){
        currentView--;
        value = -1 * container[currentView + 1].offsetLeft + container[currentView + 1].offsetWidth + containerOffsetLeft;
    }else{
        value = -1 * container[currentView].offsetLeft + containerOffsetLeft;
    }

    focus(value);
}

function focus(value){
    document.getElementById('swipeContainer').addEventListener('transitionend', removeTransitions);
    document.getElementById('swipeContainer').classList.add('swipeAnimation');
    document.getElementById('swipeContainer').style.left = value + 'px';

    var length = document.getElementsByClassName('block').length;
    for(var i = 0; i < length; i++){
        document.getElementsByClassName('block')[i].classList.add('blockScale');
    }
    document.getElementsByClassName('block')[currentView].classList.remove('blockScale');

	updateBubbles(currentView);
}

function removeTransitions(){
    document.getElementById('swipeContainer').classList.remove('swipeAnimation');
}

function onSwipeTap(){
    console.log('Tap');
}

function onSwipeUp(){
    var length = document.getElementsByClassName('block').length;
    for(var i = 0; i < length; i++){
        document.getElementsByClassName('block')[i].style.top = null;
    }
    document.getElementsByClassName('block')[currentView].style.top = -window.innerHeight + 'px';
}
