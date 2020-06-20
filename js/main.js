function fold(){
  var box = document.getElementById("menu-btn");
  if (box.checked == true) {
    box.checked = false;
  }
}

function language(){
  var urlParam = location.search.substring(1);
  if(urlParam) {
    var paramItem = urlParam.split('=');
    if(paramItem[0] == "lang"){
      if(paramItem[1] == "jp"){
        window.location.href = location.href.split("?")[0] + "?lang=en"
      }else if (paramItem[1] == "en") {
        window.location.href = location.href.split("?")[0] + "?lang=jp"
      }
    }
  }else{
    window.location.href = location.href.split("?")[0] + "?lang=en"
  }
}
$(".en").hide();
window.onload = function(){
  if(location.pathname == "/" || location.pathname == "/index.html"){
    start();
  }else{
    luminescence_load();
  }
  var lan = "jp"
  var urlParam = location.search.substring(1);
  if(urlParam) {
    var paramItem = urlParam.split('=');
    if(paramItem[0] == "lang"){
      if(paramItem[1] == "jp"){
        $(".en").hide();
        $("#lang").text("Language")
        lan = "jp"
      }else if (paramItem[1] == "en") {
        $(".jp").hide();
        $("#lang").text("言語")
        lan = "en"
      }
    }
  }else{
    $(".en").hide();
    $("#lang").text("Language")
    lan = "jp"
  }
  $("a").on('click',function(event){
    event.preventDefault();
    var linkUrl = $(this).attr('href');
    if(linkUrl.search("#") != -1){
      linkUrl = linkUrl.split("#")[0] + "?lang=" + lan + "#" + linkUrl.split("#")[1]
    }else{
      linkUrl = linkUrl + "?lang=" + lan
    }

    function action() {
      location.href = linkUrl;
    }
    setTimeout(action,100);
  });
}
