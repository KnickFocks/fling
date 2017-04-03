
function play(){
    // Set Title

    document.getElementById('header').setAttribute('onclick', 'callfallbackExp()');
    document.getElementById('title').innerHTML = exp.app.config.title;

    // Set Bullets
    var bullets = exp.app.config.bullets.split(' || ');
    var html ='';
    for(var i = 0; i < bullets.length; i++){
        html += '<div class="bullet">' + bullets[i] + '</div>';
    }
    document.getElementById('bullets').innerHTML = html;

    // Set Left App
    loadLeftApp();

    // Set Right App
    var appRight = {};
    appRight.key = exp.app.config.rightApp[0].key;
    appRight.container = document.getElementById('videoEXP2');
    appRight.duration = 86400000;
    // every load you need to pass it a key
    exp.player.load(appRight).then(function(appRight){
      return appRight.play()
        .then(function(){
            // do something
        });
    });

    // var appLeft = {};
    // appLeft.key = exp.app.config.leftApp;
    // appLeft.container = document.getElementById('videoEXP1');
    // appLeft.duration = 86400000;
    // console.log(appLeft);
    // // every load you need to pass it a key
    // var promises = []
    // promises.push( exp.player.load(appLeft).then(function(app){
    //   return app.play()
    //     .then( function () {
    //       // app.content = exp.app.config.defaultItem
    //       // app.duration = 86400000;
    //       // exp.player.load(app);
    //     });
    // }) )
    //
    // // Set Right App
    // var appRight = {};
    // appRight.key = exp.app.config.rightApp[0].key;
    // appRight.container = document.getElementById('videoEXP2');
    // appRight.duration = 86400000;
    // console.log(appRight);
    // // every load you need to pass it a key
    // promises.push( exp.player.load(appRight).then(function(appRight){
    //   return appRight.play()
    //     .then( function () {
    //       // app.content = exp.app.config.defaultItem
    //       // app.duration = 86400000;
    //       // exp.player.load(app);
    //     });
    // }) )
    //
    // return Promise.all(promises).then( function (promises () {
    //     promises[0] // app left resolution
    //     promises[1] // app right resolutoin
    // }))
}

function loadLeftApp(){
    document.getElementById('videoEXP1').style.pointerEvents = 'none';
    document.getElementById('videoPoster').style.opacity = .0;
    var appLeft = {};
    appLeft.key = exp.app.config.leftApp.key;
    appLeft.container = document.getElementById('videoEXP1');
    //appLeft.duration = 5000; //86400000;
    appLeft.forceDuration = false;
    //appLeft.looping = false;

    document.getElementById('videoEXP1').setAttribute('data', appLeft.key);
    document.getElementById('videoEXP1').setAttribute('onclick', 'loadLeftApp()');

    exp.player.load(appLeft).then(function(app){
      return app.play()
        .then(function(app){
            console.log('---------------COMPLETE');
            document.getElementById('videoEXP1').style.pointerEvents = 'auto';
            document.getElementById('videoPoster').style.opacity = .8;
            // do something
        });
    });
}

function callfallbackExp() {
    window.parent.playFallbackContent.call(window.parent);
}
