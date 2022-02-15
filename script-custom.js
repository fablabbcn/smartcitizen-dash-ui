/*
CUSTOM SCRIPTS
*/

// index gradients for moisture level
function moistureGradients(id, value) {
  let list = document.getElementById('list');
  if (list) {
    let listElem = document.getElementById(id);
    if (listElem) {
      if (value >= 95) {
        document.getElementById(id).style.background = settings.styles.colorTrue;
      } else if (value <= 5) {
        document.getElementById(id).style.background = settings.styles.colorFalse;
      } else {
        document.getElementById(id).style.background = 'linear-gradient(0deg, '+ settings.styles.colorTrue +' 0%, '+ settings.styles.colorFalse +' '+ value +'%)';  
      }
    }
  }
}

// detail additional content
function addAdditionalContent(id) {
  for (let i = 0; i < settingsCustom.sensors.length; i++) {
    if (id === settingsCustom.sensors[i].id) {
      let sensor = settingsCustom.sensors[i];
      // title
      document.querySelector("#title span:last-child").innerHTML = sensor.title;
      // subtitle
      document.querySelector("#subtitle").innerHTML = sensor.description;
      // image
      let img = document.createElement('img');
      img.src = sensor.image;
      document.querySelector("#header").appendChild(img);
      // button
      if (id != settingsCustom.globalKit.id) {
        let button = document.createElement('div');
        // button.setAttribute('href', sensor.buttonUrl);
        button.id = "buttonPump";
        button.innerHTML = sensor.buttonText;
        let insertAfterElem = document.querySelector("#sensors");
        insertAfterElem.parentNode.insertBefore(button, insertAfterElem.nextSibling);
        button.onclick = function(){
          const http = new XMLHttpRequest()
          http.open("GET", sensor.buttonUrl)
          http.send();
          console.log('Telegram message sent');
          button.classList.add('animation-start');
          button.innerHTML = sensor.buttonTextAlt;
          setTimeout(function(){
            button.classList.remove('animation-start');
            button.innerHTML = sensor.buttonText;
          }, 10000);
        };
      }
      if (settingsCustom.sensors[i].telegramChat) {
        // Telegram chat
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.onload = function(){};
        script.src = 'https://telegram.org/js/telegram-widget.js?15';
        script.setAttribute("data-telegram-discussion", sensor.telegramChat);
        script.setAttribute("data-comments-limit", "10");
        script.setAttribute("data-color", settings.styles.colorBase);
        script.setAttribute("data-dark-color", settings.styles.colorBody);
        script.async = false;
        document.getElementById("main").appendChild(script);
        break;
      }
    }
  }
}


// Isolate Global Kit
function isolateGlobalKit() {
  let globalKit = document.getElementById(settingsCustom.globalKit.id);
  if (globalKit) {
    globalKit.id = 'globalKit';
  }
}

// Global kit detail
function detailGlobalKit(id) {
  if (id === settingsCustom.globalKit.id) {
    document.body.setAttribute('isGlobal', 'true');
  } else {
    document.body.removeAttribute('isGlobal');
  }
}

window.onpopstate = function() {
  dashboardInit();
}; history.pushState({}, '');