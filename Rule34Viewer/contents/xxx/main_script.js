'use strict';

function vnc_OpacityAnimation(element, duration, from, to, callback = null)
{
    let counter = 0;
    let ticks = Math.round(duration / 20);
    let append = Math.abs(from - to) / ticks;
    
    if (from > to) append = -append;

    if (ticks > 1)
    {
        let opacityCounter = from;
        let animationInterval = setInterval(function () {
            if (counter == ticks)
            {
                clearInterval(animationInterval);
                element.style.opacity = to;
                if (callback !== null)
                    callback();
            }
            else
            {
                opacityCounter += append;
                element.style.opacity = opacityCounter;
            }
            counter++;
        }, 20);
    }
    else
    {
        element.style.opacity = to;
        if (callback !== null)
            callback();
    }
}

function startup()
{
    let container = document.getElementById('vnc-viewer');
}

document.addEventListener('DOMContentLoaded', function (event) {
    startup();
});

var test_button = document.getElementById('test-button');

test_button.addEventListener('click', function (event) {
    let element = document.getElementById('vnc-viewer');

    vnc_OpacityAnimation(element, 200, 0.0, 1.0);
});

var btn_close = document.getElementById('vnc-viewer-btn-close');
btn_close.addEventListener('click', function (event) {
    let element = document.getElementById('vnc-viewer');

    vnc_OpacityAnimation(element, 200, 1, 0, () => console.log('ok'));
});