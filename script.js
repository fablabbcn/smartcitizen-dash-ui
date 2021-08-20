let id, tag, city, user, kitCounter, primarySensorValue, primarySensorUnit, primarySensorDesc;
let isFirstLoad = true;

window.onload = function () {
  dashboardInit();
};

// dashboard initialization
function dashboardInit() {
  urlGetParameters();
  if (id) {
    getKit(id);
  } else if (tag) {
    getKits("tag", tag);
  } else if (city) {
    getKits("city", city);
  } else if (user) {
    getKits("user", user);
  } else {
    getKits();
  }
}

// get parameters from url
function urlGetParameters() {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  if (isFirstLoad) {
    if ((settings.filter.type) && (settings.filter.value)) {
      settings.filter.type === "tag" ? (tag = settings.filter.value) : (tag = null);
      settings.filter.type === "city" ? (city = settings.filter.value) : (city = null);
      settings.filter.type === "user" ? (user = settings.filter.value) : (user = null);
    } else {
      getFromUrl();
    }
    isFirstLoad = false;
  } else {
    getFromUrl();
  }
  function getFromUrl() {
    params.has("id") === true ? (id = params.get("id")) : (id = null);
    params.has("tag") === true ? (tag = params.get("tag")) : (tag = null);
    params.has("city") === true ? (city = params.get("city")) : (city = null);
    params.has("user") === true ? (user = params.get("user")) : (user = null);
  }
}

// add parameters to url
function urlAddParameters(parameter, value) {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  // Purge current parameter
  params.forEach(function (value, key) {
    params.delete(key);
  });
  // Add new parameter
  if (parameter != null) {
    params.set(parameter, value);
  }
  let new_url = url.toString();
  history.pushState({}, null, new_url);
}

// dashboard update
function dashboardUpdate(filterType = null, filterValue = null) {
  urlAddParameters(filterType, filterValue);
  dashboardInit();
}

// get kits from API
function getKits(filterType = null, filterValue = null) {
  const cacheName = "dashboardCache";
  const kitsUrl = "https://api.smartcitizen.me/v0/devices/world_map";
  // add to cache
  caches.open(cacheName).then(cache => {
    cache.add(kitsUrl).then(() => { });
  });
  // retrieve from cache
  caches.open(cacheName).then(cache => {
    cache.match(kitsUrl)
      .then((response) => {
        if (response.status == 429) alertUpdate(id, "tooManyRequests");
        return response.json();
      })
      .then((kits) => {
        displayKits(kits, filterType, filterValue);
      });
  });
}

// display kits (index)
function displayKits(kits, filterType = null, filterValue = null) {
  document.getElementById("main").innerHTML = "";
  kitsCounter = 0;
  let { activeCounter, kitsFiltered } = filterKits();
  let listHtml = document.createElement('ul');
  listHtml.id = 'list';
  document.getElementById("main").appendChild(listHtml);
  for (let kit of kitsFiltered) {
    listHtml.appendChild(elemHtml(kit));
    kitsCounter++;
  }
  webSocketUpdate();


  function filterKits() {
    let kitsFiltered = [];
    let activeCounter = 0;
    let dateNow = new Date();
    for (let kit of kits) {
      // Add 'is active' value
      let lastReading = new Date(kit.last_reading_at);
      let dateDifferenceMinutes = Math.abs(Math.round((dateNow.getTime() - lastReading.getTime()) / 1000 / 60));
      if (dateDifferenceMinutes < 30) {
        kit.isActive = true;
      } else {
        kit.isActive = false;
      }
      if (filterType != null) {
        if (filterType === "tag" && kit.user_tags.includes(filterValue)) {
          kitsFiltered.push(kit);
          if (kit.isActive) { activeCounter++; }
        } else if (filterType === "city" && kit.city === filterValue) {
          kitsFiltered.push(kit);
          if (kit.isActive) { activeCounter++; }
        } else if (filterType === "user" && kit.owner_username === filterValue) {
          kitsFiltered.push(kit);
          if (kit.isActive) { activeCounter++; }
        }
      } else {
        kitsFiltered.push(kit);
        if (kit.isActive) { activeCounter++; }
      }
    }
    // Sort kits by date
    kitsFiltered.sort(function (a, b) {
      return new Date(b.last_reading_at) - new Date(a.last_reading_at);
    });
    return { activeCounter, kitsFiltered }
  }

  function elemHtml(kit) {
    let elem = document.createElement("li");
    elem.id = kit.id;
    kit.isActive ? elem.classList.add("active") : elem.classList.add("inactive");

    for (let i = 0; i < settings.indexView.length; i++) {
      switch (settings.indexView[i]) {
        case "name":
          elem.innerHTML += `<div class="name" onclick="dashboardUpdate('id','` + kit.id + `')">` + kit.name + '</div>'
          break;
        case "id":
            elem.innerHTML += `<div class="id" onclick="dashboardUpdate('id','` + kit.id + `')">` + kit.id + '</div>';
          break;
        case "city":
          elem.innerHTML += `<div class="city" onclick="dashboardUpdate('city','` + kit.city + `')">` + kit.city + '</div>';
          break;
        case "user":
          elem.innerHTML += `<div class="user" onclick="dashboardUpdate('user','` + kit.owner_username + `')">` + kit.owner_username + '</div>';
          break;
        case "last_update":
          elem.innerHTML += '<div class="lastUpdate">' + "last update: " + new Date(kit.last_reading_at).toLocaleString("en-GB") + '</div>';
          break;
        case "tags":
          if (kit.user_tags.length > 0) {
            elemTags = '<div class="tags">';
            for (let i = 0; i < kit.user_tags.length; i++) {
              elemTags += `<div class="tag" onclick="dashboardUpdate('tag','` + kit.user_tags[i] + `')">` + kit.user_tags[i] + '</div>';
            }
            elem.innerHTML += elemTags;
          }
          break;
        default:
          console.log("This element does not exist");
          break;
      }
    }
    if ((kitsCounter <= 20) && (settings.primarySensor)) {
      primarySensor(kit);
    }
    return elem;
  }

  function primarySensor(kit) {
    const kitUrl = `https://api.smartcitizen.me/v0/devices/${kit.id}`;
    https: fetch(kitUrl)
      .then((res) => {
        return res.json();
      })
      .then((kitPrimary) => {
        if (kitPrimary.data && kit.isActive) {
          for (let key in kitPrimary.data.sensors) {
            if (kitPrimary.data.sensors[key].id === settings.primarySensor.id) {
              primarySensorValue = kitPrimary.data.sensors[key].value;
              primarySensorUnit = kitPrimary.data.sensors[key].unit;
              primarySensorDesc = kitPrimary.data.sensors[key].description;
              let primarySensorHtml = '<div class="primarySensor"><div>' + '<span class="primaryValue">' + primarySensorValue + '</span> ' + primarySensorUnit + '</div><div>' + primarySensorDesc + '</div></div>';
              target = document.getElementById(kitPrimary.id);
              if (target != null) {
                target.classList.add(primarySensorCheck(primarySensorValue));
                target.innerHTML += primarySensorHtml;
              }
              break;
            }
          }
        }
      });
  }

  function webSocketUpdate() {
    const socket = io.connect("wss://ws.smartcitizen.me", { reconnect: true });
    socket.on("data-received", d => {
      target = document.getElementById(d.id);
      if (target !== null) {
        for (let i = 0; i < d.data.sensors.length; i++) {
          if (d.data.sensors[i].id === settings.primarySensor.id) {
            targetValue = target.getElementsByClassName("primaryValue")[0];
            if (targetValue === undefined) {
              let primarySensorHtml = '<div class="primarySensor"><div><span class="primaryValue"></span> ' + primarySensorUnit + '</div><div>' + primarySensorDesc + '</div></div>';
              target.innerHTML += primarySensorHtml;
              targetValue = target.getElementsByClassName("primaryValue")[0];
            }
            targetValue.textContent = d.data.sensors[i].value;
            targetUpdate = target.getElementsByClassName("lastUpdate")[0];
            if (targetUpdate !== undefined) {
              let dateNow = new Date();
              targetUpdate.textContent = "last update: " + dateNow.toLocaleString("en-GB");
              console.log(d.name + ': updated!');
            }
            target.classList.remove("updated", "inRange", "outRange");
            target.classList.add("updated", primarySensorCheck(d.data.sensors[i].value));
            break;
          }
        }
      }
    });
  }

  function primarySensorCheck(value) {
    let sensorStatus;
    if ((settings.primarySensor.threshold[0] < value) && (value < settings.primarySensor.threshold[1])) {
      sensorStatus = 'inRange'
    } else {
      sensorStatus = 'outRange'
    }
    return sensorStatus;
  }
}

// get kit from API
function getKit() {
  console.log("get kit");
}

