window.onload = () => {
    var postTag = document.getElementsByClassName("all-posts-tag") 
    var tagTag = document.getElementsByClassName("all-tags-tag")

    if (postTag.length == 0) return

    // 文章页
    if (window.location.href.indexOf("tag") < 0) {
        postTag[0].style.color = "black"
    }
    // 标签页
    else {
        tagTag[0].style.color = "black"
    }
}