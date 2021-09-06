let id, tag, city, user, kitCounter, primarySensorValue, primarySensorUnit, primarySensorDesc;
let isFirstLoad = true;

window.onload = function () {
  dashboardInit();
};

// dashboard initialization
function dashboardInit() {
  loading(true);
  urlGetParameters();
  globalInterface();
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
  if (filterType == null) {
    document.body.classList.remove("filtered")
  } else {
    document.body.classList.add("filtered")
  }
  kitsCounter = 0;
  let { activeCounter, kitsFiltered } = filterKits();
  let listHtml = document.createElement('ul');
  listHtml.id = 'list';
  listHtml.classList.add('list');
  document.getElementById("main").appendChild(listHtml);
  indexInterface();
  loading(false);
  for (let kit of kitsFiltered) {
    listHtml.appendChild(elemHtml(kit));
    kitsCounter++;
  }
  searchBar();
  webSocketIndexUpdate();

  function indexInterface() {
    let header = document.getElementById('header');
    // title
    if (filterType) {
      header.insertAdjacentHTML('beforeend', '<div id="title">' + settings.title + ': <span>' + filterValue + '</span></div>');
    } else {
      header.insertAdjacentHTML('beforeend', '<div id="title">' + settings.title + '</div>');
    }
    // subtitle
    header.insertAdjacentHTML('beforeend', '<div id="subtitle">' + activeCounter + ' active kits today, of a total of ' + kitsFiltered.length + '</div>');
    // reset
    header.insertAdjacentHTML('beforeend', '<div id="reset">Reset filter</div>');
    document.getElementById("reset").onclick = function () {
      resetFilters();
    };
  }

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
    elem.innerHTML += `<div class="name" onclick="dashboardUpdate('id','` + kit.id + `')">` + kit.name + '</div>'
    for (let i = 0; i < settings.indexView.length; i++) {
      switch (settings.indexView[i]) {
        case "id":
            elem.innerHTML += `<div class="id" onclick="dashboardUpdate('id','` + kit.id + `')">` + kit.id + '</div>';
          break;
        case "city":
          elem.innerHTML += `<div class="city" onclick="dashboardUpdate('city','` + kit.city + `')">` + kit.city + '</div>';
          break;
        case "user":
          elem.innerHTML += `<div class="user" onclick="dashboardUpdate('user','` + kit.owner_username + `')">` + kit.owner_username + '</div>';
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
    elem.innerHTML += '<div class="lastUpdate">' + new Date(kit.last_reading_at).toLocaleString("en-GB") + '</div>';
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

  function webSocketIndexUpdate() {
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
              targetUpdate.textContent = dateNow.toLocaleString("en-GB");
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

  function searchBar() {
    if (settings.searchBar) {
      // Display
      if (!document.getElementById("searchInput")) {
        let searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = "filter";
        searchInput.classList.add("fuzzy-search");
        searchInput.id = "searchInput";
        document.getElementById("main").insertAdjacentElement('afterbegin', searchInput);
        // Search init
        let mainList = new List('main', { 
          valueNames: ['name', 'city', 'tag', 'id', 'lastUpdate']
        });
      }
      
    }
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
function getKit(id) {
  const kitUrl = `https://api.smartcitizen.me/v0/devices/${id}`;
  https: fetch(kitUrl)
  .then((res) => {
    if (res.status == 429) alertUpdate(id, "tooManyRequests");
    return res.json();
  })
  .then((kit) => {
    displayKit(kit);
  });
}

// display kit (detail)
function displayKit(kit) {
  document.getElementById("main").innerHTML = "";
  detailInterface();
  kitData(kit);
  loading(false);
  webSocketDetailUpdate();

  function detailInterface() {
    let header = document.getElementById('header');
    // title
    header.insertAdjacentHTML('beforeend', '<div id="title">' + settings.title + ': <span>' + kit.name + '</span></div>');
    // subtitle
    header.insertAdjacentHTML('beforeend', '<div id="subtitle">' + kit.description + '</div>');
    // reset
    header.insertAdjacentHTML('beforeend', '<div id="back">← Back to index</div>');
    document.getElementById("back").onclick = function () {
      resetFilters();
    };
    // read more
    document.getElementById("main").insertAdjacentHTML('beforeend', '<a href="https://smartcitizen.me/kits/' + kit.id + '" class="more" target="_blank">More info on this kit&nbsp↗</a>');
  }
  
  function kitData(kit) {
    document.getElementById("main").insertAdjacentHTML('afterbegin', '<ul class="list" id="sensors"></div>');
    let d = new Date();
    let today = d.toISOString().slice(0, 10);
    let then = new Date(d.setDate(d.getDate()-5)).toISOString().slice(0, 10); // 5 days ago
    for (let i = 0; kit.data.sensors.length > i; i++) {
      const sensorUrl = `https://api.smartcitizen.me/v0/devices/${kit.id}/readings?sensor_id=${kit.data.sensors[i].id}&rollup=1h&from=${then}&to=${today}`;
      https: fetch(sensorUrl)
      .then((res) => {
        return res.json();
      })
      .then((sensor) => {
        let readings = sensor.readings;
        let data = [[], []];
        for (const reading of readings) {
          let date = new Date(reading[0]).getTime() / 1000;
          data[0].push(date);
          data[1].push(reading[1]);
        }
        if (settings.sensors) {
          for (let i = 0; i < settings.sensors.length; i++) {
            if (sensor.sensor_id == settings.sensors[i].id) {
              displaySensor();
            }
          }
        } else {
          displaySensor();
        }

        function displaySensor() {
          if (data != undefined && data[0].length > 0) {
            let value = Math.floor(kit.data.sensors[i].value);
            let sensorStatus;
            if (settings.sensors) {
              if ((settings.sensors[i].threshold[0] < value) && (value < settings.sensors[i].threshold[1])) {
                sensorStatus = 'inRange'
              } else {
                sensorStatus = 'outRange'
              }
            } else {
              sensorStatus = 'noRange'
            }
            document.getElementById("sensors").insertAdjacentHTML('beforeend', '<li id="' + kit.data.sensors[i].id + '" class="' + sensorStatus + '"></li>');
            document.getElementById(kit.data.sensors[i].id).insertAdjacentHTML('beforeend', '<h2><span class="value">' + value + '</span>' + kit.data.sensors[i].unit + '</h2>');
            document.getElementById(kit.data.sensors[i].id).insertAdjacentHTML('beforeend', '<h3>' + kit.data.sensors[i].description + '</h3>');
            const canvasWidth = 600;
            const canvasHeight = (canvasWidth / 3) * 2;
            const opts = {
              class: "chart",
              width: canvasWidth,
              height: canvasHeight,
              series: [
                {},
                {
                  spanGaps: true,
                  label: sensor.sensor_key,
                  width: 1,
                  stroke: settings.styles.colorBase,
                  fill: settings.styles.colorBase,
                  width: 1,
                },
              ]
            };
            let uplot = new uPlot(opts, data, document.getElementById(kit.data.sensors[i].id));
          }
        }
      });
    }
  }

  function webSocketDetailUpdate() {
    const socket = io.connect("wss://ws.smartcitizen.me", { reconnect: true });
    socket.on("data-received", d => {
      if (d.id == kit.id) {
        for (let i = 0; i < d.data.sensors.length; i++) {
          let id = d.data.sensors[i].id;
          let elem = document.getElementById(id);
          if (elem) {
            let currentValue = elem.getElementsByClassName("value")[0];
            let newValue = d.data.sensors[i].value;
            console.log(currentValue);
            console.log(newValue);
            currentValue.innerHTML = newValue;
            elem.classList.remove("updated", "inRange", "outRange");
            elem.classList.add("updated");
            console.log(d.data.sensors[i].name + ': updated!');
          }
        }
      }
    });
  }
}

// loading screen
function loading(status) {
  status ? document.body.classList.add("isLoading") : document.body.classList.remove("isLoading");
}

// global interface
function globalInterface() {
  // title
  document.title = settings.title;
  // styles
  if (settings.styles) {
    styleKeys = Object.keys(settings.styles);
    styleValues = Object.values(settings.styles);
    for (let i = 0; i < styleKeys.length; i++) {
      document.documentElement.style.setProperty('--' + styleKeys[i], styleValues[i]);
    }
  }
  // header
  if (document.getElementById("header")) {
    document.getElementById("header").remove();
  }
  let header = document.createElement("header");
  header.id = "header"
  document.body.prepend(header);
  // logo
  if (! document.getElementById("logo")) {
    header.insertAdjacentHTML('afterbegin', '<img id="logo" width="80" src="assets/' + settings.logo + '" alt="' + settings.title + '">');
  }
  document.getElementById("logo").onclick = function () {
    resetFilters();
  };
}

function resetFilters() {
  ((settings.filter.type) && (settings.filter.value)) ? urlAddParameters(settings.filter.type, settings.filter.value) : urlAddParameters(null);
  dashboardInit();
}