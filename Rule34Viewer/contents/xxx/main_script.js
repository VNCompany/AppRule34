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
    _loadWidget()
    {
        let widgetContent = '<div class="viewer-wrapper"><div class="viewer-navigation" id="vnc-viewer-btn-left"><svg width="32" height="78"><path fill="none" stroke-width="4" stroke="lightgray" d="M32,0L2,38L32,76"></path></svg></div><div class="vnc-viewer-container"><img style="display: none" alt="Nothing" id="vnc-viewer-image"><video style="display: none" id="vnc-viewer-video" loop controls></video></div><div class="viewer-navigation" id="vnc-viewer-btn-right"><svg width="32" height="78"><path fill="none" stroke-width="4" stroke="lightgray" d="M0,0L30,38L0,76"></path></svg></div></div><i id="vnc-viewer-btn-close">&#9587;</i>';
        let widget = document.createElement("div");
        widget.style.display = "none";
        widget.setAttribute("id", "vnc-viewer");
        widget.innerHTML = widgetContent;
        document.body.appendChild(widget);
    }

    _showBlock()
    {
        document.body.style.overflow = "hidden";
        this.viewerBlock.style.opacity = "0";
        this.viewerBlock.style.display = 'block';
        vnc_OpacityAnimation(this.viewerBlock, 200, 0, 1, null);
        this.status.active = true;
    }

    _hideBlock()
    {
        document.body.style.overflow = "auto";
        let self = this;
        vnc_OpacityAnimation(this.viewerBlock, 200, 1, 0, function() { self.viewerBlock.style.display = 'none'; });
        this.status.active = false;
    }

    _getList()
    {
        this.postsList = Array();
        let sPosts = document.querySelectorAll('.image-list > .thumb > a');
        let self = this;

        for (let i = 0; i < sPosts.length; i++)
        {
            this.postsList.push(sPosts[i].id.substring(1));
            sPosts[i].addEventListener('click', function (event) {
                self._onPostClicked.call(self, event, this.id);
            });
        }
    }

    _getImageUrlByIdAsync(id, isFull = true)
    {
        return fetch(`https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&id=${id}`, {
            method: "GET",
            credentials: "same-origin"
        }).then((response) => {
            return response.json();
        }).then((json) => {
            let filename = json[0].image;
            let type = filename.toLowerCase().endsWith('.mp4') ? "video" : "image";
            let resultUrl = undefined;
            if (type === "image" && !isFull)
                resultUrl = json[0].sample_url;
            else
                resultUrl = json[0].file_url;
            return {
                contentType: type,
                url: resultUrl
            };
        });
    }

    constructor()
    {
        let self = this;
        this._getList();

        this._loadWidget();

        this.viewerBlock = document.getElementById('vnc-viewer');
        this.viewerContainer = document.querySelector('#vnc-viewer .vnc-viewer-container');
        this.imageBlock = document.getElementById('vnc-viewer-image');
        this.videoBlock = document.getElementById('vnc-viewer-video');

        this.status = {
            active: false,
            type: undefined,
            currentUrl: undefined,
            currentPos: undefined
        };

        // Events

        let closeButton = document.getElementById('vnc-viewer-btn-close');
        closeButton.addEventListener('click', this._onCloseClicked.bind(this));

        document.addEventListener('keydown', (event) => {
            if (this.status.active)
            {
                if (event.key === "Escape")
                    this._onCloseClicked();
                else if (event.key === "ArrowRight")
                    this._onNavigationClicked("vnc-viewer-btn-right");
                else if (event.key === "ArrowLeft")
                    this._onNavigationClicked("vnc-viewer-btn-left");
            }
        });

        let navigation = document.querySelectorAll('#vnc-viewer .viewer-navigation');
        for (let i = 0; i < navigation.length; i++) {
            navigation[i].addEventListener('click', function () {
                self._onNavigationClicked.call(self, this.id);
            });
        }

        this.imageBlock.onload = () => {
            this.viewerContainer.style.opacity = '1.0';
        };
    }

    loadPost(id)
    {
        if (!this.status.active)
            this._showBlock();

        this.viewerContainer.style.opacity = '0.3';
        this._getImageUrlByIdAsync(id).then((obj) => {
            if (obj.contentType === "image")
            {
                this.imageBlock.style.display = "block";
                this.imageBlock.setAttribute("src", obj.url);
            }
        });
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
            if (this.status.currentPos + 1 < this.postsList.length)
                this.loadPost(this.postsList[++this.status.currentPos]);
            else
            {
                let paginator = document.getElementById('paginator');
                window.scrollTo(0, paginator.offsetTop);
                this._hideBlock();
            }
        }
        else if (id.endsWith("left"))
        {
            if (this.status.currentPos - 1 >= 0)
                this.loadPost(this.postsList[--this.status.currentPos]);
        }
    }

    _onPostClicked(event, block_id)
    {
        let id = block_id.substring(1);
        this.status.currentPos = this.postsList.indexOf(id);
        this.loadPost(id);
        event.preventDefault();
    }
}

let contentViewer = new VncViewer();