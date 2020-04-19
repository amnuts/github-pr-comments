let applyCommentIcon = (file) => {
    let commentNode = file.getElementsByClassName('comment-count')[0];
    if (commentNode) {
        commentNode.parentNode.removeChild(commentNode);
    }
    if (file.classList.contains('has-inline-notes')) {
        let comments = file.querySelectorAll('tr.inline-comments').length;
        let insertNode = file.querySelector('div.file-actions > div');
        insertNode.innerHTML = `
            <span class="comment-count ml-1 mr-2 text-normal d-flex flex-items-center" title="Comments on this file: ${comments}">
                <svg viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 1h-24v16.981h4v5.019l7-5.019h13z" fill="grey"></path>
                    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="white">${comments}</text>
                </svg>
            </span>
        ` + insertNode.innerHTML;
    }
};

let mutateCallback = (mutationsList, observer) => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // get any changed nodes
            let changedNodes = [...mutation.addedNodes].concat([...mutation.removedNodes]);
            // if loading progressive files list
            let newFiles = changedNodes.filter(node => {
                return node.nodeName === 'DIV' && node.classList.contains('file');
            });
            newFiles.forEach(file => {
                applyCommentIcon(file);
            });
            // this is to work around the SPA loading portions of the file
            // list again but this plugin not really picking up well on the
            // pre-rendered files
            if (newFiles.length) {
                initApply(document.getElementById('files'));
            }
            // if adding or removing an inline comment in a single file
            // or loading a diff that was too large to initially load
            if (changedNodes.some(node => {
                return (
                    (node.nodeName === 'TR' && node.classList.contains('inline-comments'))
                    || (node.nodeName === 'DIV' && node.classList.contains('highlight') && node.classList.contains('js-blob-wrapper'))
                );
            })) {
                let closestFile = mutation.target.closest('div.file');
                applyCommentIcon(closestFile);
            }
        }
    }
};

let initApply = (filesList) => {
    if (filesList) {
        let files = filesList.querySelectorAll('.js-diff-progressive-container:first-of-type > div.file');
        if (files) {
            [...files].forEach(file => {
                applyCommentIcon(file);
            });
        }
    }
};

let pageContent = document.getElementsByTagName('body')[0];
initApply(document.getElementById('files'));

let observer = new MutationObserver(mutateCallback);
observer.observe(
    pageContent,
    { attributes: false, childList: true, subtree: true }
);
