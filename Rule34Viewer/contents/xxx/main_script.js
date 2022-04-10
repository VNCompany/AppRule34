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

class VncViewer
{
    _showBlock()
    {
        this.viewerBlock.style.opacity = 0;
        this.viewerBlock.style.display = 'block';
        vnc_OpacityAnimation(this.viewerBlock, 200, 0, 1, null);
    }

    _hideBlock()
    {
        let self = this;
        vnc_OpacityAnimation(this.viewerBlock, 200, 1, 0, function() { self.viewerBlock.style.display = 'none'; });
    }

    constructor()
    {
        /* Append html function */
        this.viewerBlock = document.getElementById('vnc-viewer');
        this.imageBlock = document.getElementById('vnc-viewer-image');
        this.videoBlock = document.getElementById('vnc-viewer-video');

        let closeButton = document.getElementById('vnc-viewer-btn-close');
        closeButton.addEventListener('click', this._onCloseClicked.bind(this));
    }

    showImage(url)
    {
        
    }


    // Event Listeners

    _onCloseClicked(event)
    {
        this._hideBlock();
    }
}


let contentViewer = new VncViewer();

document.getElementById('test-button').addEventListener('click', function(event)
{
    contentViewer._showBlock();
});