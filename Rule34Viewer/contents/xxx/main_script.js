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
            if (counter === ticks)
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

    _getList()
    {
        this.imageList = Array();
        let sPosts = document.querySelectorAll('.image-list > .thumb > a');
        let self = this;

        for (let i = 0; i < sPosts.length; i++)
        {
            this.imageList.push(sPosts[i].id.substring(1));
            sPosts[i].addEventListener('click', function (event) {
                self._onPostClicked.call(self, event, this.id);
            });
        }
    }

    _getImageUrlById(id, isFull)
    {
        // Next: Add load image/video
    }

    constructor()
    {
        let self = this;
        this.xhr = new XMLHttpRequest();

        this._getList();


        /* Append html function */
        this.viewerBlock = document.getElementById('vnc-viewer');
        this.imageBlock = document.getElementById('vnc-viewer-image');
        this.videoBlock = document.getElementById('vnc-viewer-video');

        this.status = {
            type: undefined,
            current_url: undefined
        };

        // Events

        let closeButton = document.getElementById('vnc-viewer-btn-close');
        closeButton.addEventListener('click', this._onCloseClicked.bind(this));

        document.addEventListener('keydown', (event) => {
            if (event.key === "Escape")
                this._onCloseClicked();
            else if (event.key === "ArrowRight")
                this._onNavigationClicked("vnc-viewer-btn-right");
            else if (event.key === "ArrowLeft")
                this._onNavigationClicked("vnc-viewer-btn-left");
        });

        let navigation = document.querySelectorAll('#vnc-viewer .viewer-navigation');
        for (let i = 0; i < navigation.length; i++) {
            navigation[i].addEventListener('click', function () {
                self._onNavigationClicked.call(self, this.id);
            });
        }
    }

    showImage(url)
    {

    }


    // Event Listeners

    _onCloseClicked()
    {
        if (this.status.type === "video")
        {
            if (!this.videoBlock.paused)
                this.videoBlock.pause();
        }
        this._hideBlock();
    }

    _onNavigationClicked(id)
    {
        if (id.endsWith("right"))
        {
            console.log("next");
        }
        else if (id.endsWith("left"))
        {
            console.log("back");
        }
    }

    _onPostClicked(event, block_id)
    {
        console.log(block_id);
        event.preventDefault();
    }
}



let contentViewer = new VncViewer();

document.getElementById('test-button').addEventListener('click', function()
{
    contentViewer._showBlock();
});