// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var audioCtx = new window.AudioContext();
var panner = audioCtx.createPanner();
var gainNode = audioCtx.createGain();

// PeerJS object
var peer = new Peer({ key: '78dd2be1-6a65-4676-b36c-d6f519a478de', debug: 1});

peer.on('open', function(){
    $('#my-id').text(peer.id);
});

// Receiving a call
peer.on('call', function(call){
    // Answer the call automatically (instead of prompting user) for demo purposes
    call.answer(window.localStream);
    step3(call);
});
peer.on('error', function(err){
    alert(err.message);
    // Return to step 2 if error occurs
    step2();
});

// Click handlers setup
$(function(){
    $('#make-call').click(function(){
    // Initiate a call!
    var call = peer.call($('#callto-id').val(), window.localStream);

    step3(call);
    });

    $('#end-call').click(function(){
    window.existingCall.close();
    step2();
    });

    // Retry if getUserMedia fails
    $('#step1-retry').click(function(){
    $('#step1-error').hide();
    step1();
    });

    // Get things started
    step1();
});

function step1 () {
    // Get audio/video stream
    navigator.getUserMedia({audio: true, video: true}, function(stream){
    // Set your video displays
    $('#my-video').prop('src', URL.createObjectURL(stream));

    window.localStream = stream;
    step2();
    }, function(){ $('#step1-error').show(); });
}

function step2 () {
    $('#step1, #step3').hide();
    $('#step2').show();
}

function step3 (call) {
    // Hang up on an existing call if present
    if (window.existingCall) {
    window.existingCall.close();
    }

    // Wait for stream on the call, then set peer video display
    call.on('stream', function(stream){
        var source = audioCtx.createMediaStreamSource(stream);   
        source.connect(gainNode);
        
        panner.setPosition(2, 0,-1);

        gainNode.connect(panner);
        panner.connect(audioCtx.destination);

        $('#their-video').prop('src', URL.createObjectURL(stream));
    });

    // UI stuff
    window.existingCall = call;
    $('#their-id').text(call.peer);
    call.on('close', step2);
    $('#step1, #step2').hide();
    $('#step3').show();
}


$(window).ready(function(){
    $("#their-range").on('input', function(){
        changeDirection($(this));
    }).change(function(){
        changeDirection($(this));
    })
    $("#their-gain").on('input', function(){
        changeGain($(this));
    }).change(function(){
        changeGain($(this));
    })
})

function changeDirection(elem){
    panner.setPosition(elem.val()*2, 0, -1);
}

function changeGain(elem){
    gainNode.gain.value = elem.val();
}