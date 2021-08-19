let id, tag, city, user, kitCounter;
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
  let { activeCounter, kitsFiltered } = filterKits();
  let listHtml = document.createElement('ul');
  listHtml.id = 'list';
  document.getElementById("main").appendChild(listHtml);
  const container = document.createDocumentFragment();
  kitsCounter = 0;
  for (let kit of kitsFiltered) {
    let elem = document.createElement("li");
    elem.id = kit.id;
    elem.innerHTML += '<div class="name">' + kit.name + '</div>'
    elem.innerHTML += '<div class="city">' + kit.city + '</div>'
    elem.innerHTML += '<div class="user">' + kit.owner_username + '</div>'
    elem.innerHTML += '<div class="lastUpdate">' + "last update: " + new Date(kit.last_reading_at).toLocaleString("en-GB") + '</div>';
    if (kit.user_tags.length > 0) {
      elemTags = '<div class="tags">';
      for (let i = 0; i < kit.user_tags.length; i++) {
        elemTags += '<div class="tag">' + kit.user_tags[i] + '</div>';
      }
      elem.innerHTML += elemTags;
    }
    if ((kitsCounter <= 40) && (settings.primarySensor)) {
      primarySensor(kit);
    }

    container.appendChild(elem);
    kitsCounter++;
  }

  listHtml.appendChild(container);
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

  function primarySensor(kit) {
    const kitUrl = `https://api.smartcitizen.me/v0/devices/${kit.id}`;
    https: fetch(kitUrl)
      .then((res) => {
        return res.json();
      })
      .then((kit) => {
        if (kit.data) {
          for (let key in kit.data.sensors) {
            if (kit.data.sensors[key].id === settings.primarySensor.id) {
              let primarySensorHtml = '<div class="primarySensor"><div>' + '<span class="primaryValue">' + kit.data.sensors[key].value + '</span> ' + kit.data.sensors[key].unit + '</div><div>' + kit.data.sensors[key].description + '</div></div>';
              document.getElementById(kit.id).innerHTML += primarySensorHtml;
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
      if (target !== undefined) {
        targetValue = target.getElementsByClassName("primaryValue")[0];
        if (targetValue !== undefined) {
          for (let i = 0; i < d.data.sensors.length; i++) {
            if (d.data.sensors[i].id === settings.primarySensor.id) {
              targetValue.textContent = d.data.sensors[i].value;
              target.classList.remove("updated")
              target.classList.remove("updated");
              targetUpdate = target.getElementsByClassName("lastUpdate")[0];
              if (targetUpdate !== undefined) {
                let dateNow = new Date();
                targetUpdate.textContent = "last update: " + dateNow.toLocaleString("en-GB");
              }
            }
          }
        }
      }
    });
  }
}