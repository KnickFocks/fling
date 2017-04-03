'use strict';

var activeApp;
var fallbackApp;

function load (){
  console.log('App is now loading.');

  if ( isMobile() ) return Promise.resolve();

  getExperiencePromise()
  .then( function (data) {
    window.experience = data;

    var channel = window.experience.getChannel({ consumer: true });
    channel.listen('content', function(payload) {
      console.log('switching content, payload',payload);
      switchApps(payload);
    });

    var apps = data.document.apps;
    var playlist = apps.find( function (app) { return app.key === exp.app.config.playlist.key });
    var content = playlist.config.slides;
    var contentToFetch = [];

    // iterate over the items in the stored playlist app and push those that are
    // type: 'content' to an array to fetch from the content API
    content.forEach(function(child, i) {
      child = apps.find( function (app) { return app.key === child.key });
      if ( child.type === 'content' && child.content.uuid ) {
        contentToFetch.push( child.content.uuid );
      }
    });

    // fetch the content metadata for all apps that are of type: 'content'
    return exp.get('/api/content' + '?uuid=' + contentToFetch.join('&uuid=') )
    .then( function (contentRes) {
      var apps = data.document.apps;
      // find the app that is our parent playlist app (holds the child app content)
      var playlist = apps.find( function (app) {
        return app.key === exp.app.config.playlist.key
      });
      // store reference to the `slides` array in the one scheduled playlist app
      // **NOTE** this app will not work if the app stored at
      // `exp.app.config.playlist.key` is not a playlist app
      var content = playlist.config.slides;
      var list = document.getElementById('list');
      list.innerHTML = '';
      var contentToFetch = [];
      content.forEach(function(child, i) {
        child = apps.find( function (app) { return app.key === child.key });
        if ( child.type === 'content' ) {
          var matchedItem = contentRes.results.find( function (item) { return item.uuid === child.content.uuid });
          child.name = matchedItem.name;
        }
        var li = document.createElement('li');
        li.setAttribute('id', child.key);
        li.setAttribute('onclick', 'vote(this.id)');
        li.textContent = child.config.title;
        list.appendChild(li);
      });
    });
  });

}

function play () {
  if ( exp.app.config.enableOnscreenCode && exp.app.config.validDisplayUrl && !isMobile() ) {
    document.getElementById('urlContainer').classList.remove('hidden');
    document.getElementById('url').innerHTML = '<span style="font-size:40;">Control this screen at:<br></span>' + exp.app.config.validDisplayUrl.replace(/^https?\:\/\//i, "");;
  } else {
    document.getElementById('url').classList.add('hidden');
  }

  var options = {
    key: exp.app.config.mobileApp.key, // this is the key of the mobile app
    container: document.getElementById('main'),
    duration: 86400000
  };

  if ( isMobile() ) {
    if ( !exp.app.config.mobileApp.key ) throw new Error('Mobile App Not Configured');
    options.key = exp.app.config.mobileApp.key;
    console.log('mobile client detected, serving mobile app')
    return exp.player.play(options);
  }

  console.log('App is now playing.');
  // options.key = exp.app.config.defaultItem.key;
  playFallbackContent();

  return new Promise( function() {});
}

function vote(key) {
  var payload = { key: key };

  var channel = window.experience.getChannel({ consumer: true });
  channel.broadcast('content', payload);
  console.log('update on controller channel', payload)

}

function switchApps(payload) {

  // used to prevent playback collision with multiple calls, in this case, we
  // simply ignore additional calls while a newly started app is loading
  if (window.switching === true) return;
  window.switching = true;
  cleanupPlayingApps();

  payload.container = document.getElementById('main');
  payload.duration = 1000 * exp.app.config.flingInterruptDuration || 30; // should be 30 seconds

  return exp.player.load(payload).then(function(app) {
    activeApp = app;
    document.getElementById('urlContainer').classList.add('hidden');
    app.play().then( playFallbackContent );
    window.switching = false;
  })
  .catch( function () {
    window.switching = false;
    setTimeout( function () {
      switchApps(payload);
    }, 5000);
  });
}

function playFallbackContent () {
  if (window.switching === true) return;
  window.switching = true;
  cleanupPlayingApps();
  var payload = {
    key: exp.app.config.defaultItem.key,
    container: document.getElementById('main'),
    duration: 86400000
  };
  return exp.player.load(payload).then( function (app) {
    fallbackApp = app;
    document.getElementById('urlContainer').classList.remove('hidden');
    app.play();
    window.switching = false;
  })
  .catch( function () {
    window.switching = false;
    setTimeout( playFallbackContent, 5000);
  });
}

function getExperiencePromise () {
  var experienceParamUuid = exp.player.params.experience;
  var apiCall = ( experienceParamUuid !== undefined ) ? exp.getExperience( experienceParamUuid ) : exp.getCurrentExperience();

  return apiCall;
}

function cleanupPlayingApps () {
  try {
    console.log('activeApp.abort()');
    activeApp.abort();
  } catch (e) {
    console.log('could not abort activeApp', e);
  }

  try {
    console.log('fallbackApp.abort()');
    fallbackApp.abort();
  } catch (e) {
    console.log('could not abort fallbackApp', e);
  }

}

function isMobile () {
  // return true;
  if (!md) var md = new MobileDetect(window.navigator.userAgent);
  return md.phone() !== null || md.tablet() !== null;
}

function unload () {
  // clean up any mess we made
}
