/*                  Получение контента из поста                    */

var contentContainer = null;
var contentVideoElement = null;
var contentImageElement = null;
var postsContainer = null;
var postsAList = Array();

var contentStatus = {
    contentType: null,
    contentPost: null,
    contentHref: null,
    listPosition: -1
};

// Показать картинку
function BuildImage(src)
{
    if (contentStatus.contentType == "video" || contentStatus.contentType === null)
    {
        contentVideoElement.style.display = "none";
        contentImageElement.style.display = "block";
    }

    contentStatus.contentType = "image";
    contentStatus.contentHref = src;

    contentImageElement.setAttribute("src", src);
}

// Показать видео
function BuildVideo(src)
{
    if (contentStatus.contentType == "image" || contentStatus.contentType === null)
    {
        contentImageElement.style.display = "none";
        contentVideoElement.style.display = "block";
    }

    contentStatus.contentType = "video";
    contentStatus.contentHref = src;

    contentVideoElement.setAttribute("src", src);
}

// Проверяет тип контента (картинка или видео)
// input - контейнер app-post-image с контентом
function CheckType(input)
{
    if (/<img/.test(input) === true)
        return 'image';
    else if (/<video/.test(input) === true)
        return 'video';
    else
        return null;
}

// Парсит контент из input
// input - контейнер app-post-image с контентом
function GetContent(input)
{
    let inputType = CheckType(input);
    if (inputType == 'image')
        BuildImage(/<img.*?src="([^"]+)"/.exec(input)[1]);
    else if (inputType == 'video')
        BuildVideo(/<video.*?src="([^"]+)"/.exec(input)[1]);
}

// Загружает контент из поста
// postLink - ссылка на пост
function LoadPostImage(postLink)
{
    console.log(postLink);

    if (contentContainer.style.display == "none")
        contentContainer.style.display = "flex";
    if (contentImageElement === null || contentVideoElement === null)
    {
        contentVideoElement = document.querySelector('#vnc-contentVideo');
        contentImageElement = document.querySelector('#vnc-contentImage');
    }

    let request = new XMLHttpRequest();
    request.open('GET', postLink);
    request.send();
    request.onload = function()
    {
        contentStatus.contentPost = postLink;
        GetContent(/<app-post-image[^>]*>(.*?)<\/app-post-image>/.exec(request.response)[1]);
    }
}

function ClosePostWindow()
{
    contentContainer.style.display = "none";
    if (contentVideoElement !== null && contentVideoElement.paused === false)
        contentVideoElement.pause();
}



/*                  Функции работы со списком ссылок              */

function PostAClicked(eventArgs)
{
    for (let i = 0; i < postsAList.length; i++)
    {
        if (postsAList[i].dataset.postLink === this.dataset.postLink)
        {
            contentStatus.listPosition = i;
            break;
        }
    }
    LoadPostImage(this.dataset.postLink);
}

function LoadPostList()
{
    let postPreviewLinks = document.querySelectorAll('app-post-preview.ng-star-inserted a');

    // if (postPreviewLinks.length < postsAList.length)
    //     postsAList[postPreviewLinks.length] = null;

    for (let i = 0; i < postPreviewLinks.length; i++)
    {
        if (('postLink' in postPreviewLinks[i].dataset) === false)
        {
            let new_a = postPreviewLinks[i].cloneNode();
            new_a.dataset.postLink = postPreviewLinks[i].href;
            new_a.innerHTML = postPreviewLinks[i].innerHTML;
            new_a.removeAttribute('href');
            postPreviewLinks[i].parentNode.replaceChild(new_a, postPreviewLinks[i]);

            postsAList[i] = new_a;
            postsAList[i].addEventListener('click', PostAClicked);
        }
    }
}



/*                  Функции работы с событиями                    */

document.addEventListener("keydown", function(event){
    if (event.key == "Escape")
    {
        ClosePostWindow();
    }
    else if (event.key == "ArrowRight")
    {
        if (contentStatus.listPosition + 1 < postsAList.length)
        {
            LoadPostImage(postsAList[++contentStatus.listPosition].dataset.postLink);
        }
        else
        {
            ClosePostWindow();
            window.scrollTo(0, document.body.scrollHeight);
        }
    }
    else if (event.key == "ArrowLeft")
    {
        if (contentStatus.listPosition - 1 >= 0)
            LoadPostImage(postsAList[--contentStatus.listPosition].dataset.postLink);
    }
});

function OnContentChangedCallback(mutationRecords)
{
    console.log('contentChanged');
    LoadPostList();
}


/*                  Загрузка просмотрщика                    */

let observer = new MutationObserver(OnContentChangedCallback);

function LoadPlugin()
{
    let container = document.createElement('div');
    container.setAttribute('id', "vnc-content");
    container.style.display = "none";

    container.innerHTML = '<video id="vnc-contentVideo" style="display: block" controls loop></video>\
                           <img id="vnc-contentImage" style="display: none">\
                           <i id="vnc-contentClose">╳</i>';

    document.body.insertBefore(container, document.body.firstChild);
    contentContainer = container;

    postsContainer = document.querySelector('.box-grid');

    if (postsContainer !== null)
    {
        observer.observe(postsContainer, { childList: true});
        LoadPostList();
        console.log("Content loaded");
    }
    else
    {
        console.log("Content is empty");
    }

    contentImage = document.getElementById('vnc-contentImage');
    contentImage.addEventListener('click', function (event) {
        window.open(contentStatus.contentPost, "_target");
    });

    contentCloseButton = document.getElementById('vnc-contentClose');
    contentCloseButton.addEventListener('click', function (event) {
        ClosePostWindow();
    });
}

// ТОЧКА ВХОДА
LoadPlugin();