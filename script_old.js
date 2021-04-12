window.onload = function () {
  initDashboard();
};

//  setInterval(function () {
//   initDashboard();
//  }, 10000);

function newKitId() {
  // Empty html
  hideShow("kitData", "hide");
  hideShow("sensorsData", "hide");
  let kitId = document.getElementById("kitIdInput").value;
  urlAddParameter("kitId", kitId);
  kitId.length > 0 && getKitData(kitId);
}

function initDashboard() {
  let kitId = urlGetParameters();
  if (kitId != null && kitId.length > 0) {
    document.getElementById("kitIdInput").value = kitId;
    getKitData(kitId);
  }
  keyboardShortcuts();
}

function getKitData(id) {
  const api_kit_url = `https://api.smartcitizen.me/v0/devices/${id}`;
  fetch(api_kit_url)
    .then((res) => {
      if (res.status == 429) hintUpdate(id, "tooManyRequests");
      return res.json();
    })
    .then((kit) => {
      if (kit.id != "record_not_found") {
        if (kit.system_tags.includes("online")) {
          hintUpdate(id, "success");
          displayKit(kit);
          getSensorsData(kit);
          hideShow("kitData", "show");
          hideShow("sensorsData", "show");
        } else {
          hintUpdate(id, "offline");
          hideShow("sensorsData", "hide");
        }
      } else {
        hintUpdate(id, "failure");
        hideShow("sensorsData", "hide");
      }
      urlAddParameter("kitId", id);
    });
}

function displayKit(kit) {
  dataToHtml("kitDataTitle", kit.name);
  dataToHtml("kitDataDescription", kit.description);
}

function getSensorsData(kit) {
  // Loop through all sensors
  document.getElementById("sensorsData").innerHTML = "";
  for (let i = 0; kit.data.sensors.length > i; i++) {
    const api_sensor_url = `https://api.smartcitizen.me/v0/devices/${kit.id}/readings?sensor_id=${kit.data.sensors[i].id}&rollup=1h&from=2021-03-01&to=2021-03-31`;
    https: fetch(api_sensor_url)
      .then((res) => {
        return res.json();
      })
      .then((sensor) => {
        displaySensor(kit, sensor, i);
      });
  }
}

function displaySensor(kit, sensor, i) {
  let readings = sensor.readings;
  let data = [[], []];
  for (const reading of readings) {
    let date = new Date(reading[0]).getTime() / 1000;
    console.log(date)
    data[0].push(date);
    data[1].push(reading[1]);
  }
  if (data != undefined && data[0].length > 0) {
    const canvasWidth = 600;
    const canvasHeight = (canvasWidth / 3) * 2;
    const opts = {
      title: kit.data.sensors[i].description,
      id: kit.data.sensors[i].id,
      class: "chart",
      width: canvasWidth,
      height: canvasHeight,
      series: [
        {},
        {
          show: true,
          spanGaps: true,
          label: sensor.sensor_key,
          fill: "#000",
        },
      ],
      axes: [
        {},
        {
          show: true,
          label: kit.data.sensors[i].name,
          labelSize: 30,
          gap: 5,
          size: 50,
          stroke: "black",
          grid: {
            show: true,
            stroke: "#eee",
            width: 2,
            dash: [],
          },
          ticks: {
            show: true,
            stroke: "#eee",
            width: 2,
            dash: [],
            size: 10,
          },
        },
      ],
    };
    let uplot = new uPlot(opts, data, document.getElementById("sensorsData"));
    sensorDataUpdate(kit.data.sensors[i]);
  }
}

function sensorDataUpdate(sensor) {
  const target = document
    .getElementById(sensor.id)
    .getElementsByClassName("u-wrap")[0];
  if (target) {
    const elem = document.createElement("div");
    elem.classList.add("u-value");
    elem.innerText = sensor.prev_value + " " + sensor.unit;
    target.parentNode.insertBefore(elem, target);
  }
}

function urlCheck() {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  return { url, params };
}

function urlAddParameter(parameter, value) {
  let { url, params } = urlCheck();
  params.set(parameter, value);
  let new_url = url.toString();
  history.pushState({}, null, new_url);
}

function urlGetParameters() {
  let { url, params } = urlCheck();
  kitId = params.get("kitId");
  return kitId;
}

// Data to html
function dataToHtml(elementId, elementData) {
  if (!!elementData) {
    document.getElementById(elementId).innerText = elementData;
    hideShow(elementId, "show");
  } else {
    hideShow(elementId, "hide");
  }
}

// Hint update
function hintUpdate(id, status) {
  let message;
  switch (status) {
    case "success":
      message = `The kit #${id} has been found, here are the data.`;
      break;
    case "failure":
      message = `We did not find the kit #${id} in our records.`;
      break;
    case "tooManyRequests":
      message =
        "Too many requests, please wait 10 seconds before trying again.";
      break;
    case "offline":
      message = `The kit #${id} has been found, but seems to be offline.`;
      break;
    default:
      message = "The ID number is the unique identifier of your kit.";
      break;
  }
  document.getElementById("kitIdHint").innerText = message;
}

// Hide and show html elements
function hideShow(elementId, status) {
  if (status === "show") {
    document.getElementById(elementId).style.display = "flex";
  } else if (status === "hide") {
    document.getElementById(elementId).style.display = "none";
  }
}

function keyboardShortcuts() {
  // enter
  document
    .getElementById("kitIdInput")
    .addEventListener("keyup", function (event) {
      if (event.keyCode === 13) {
        // cancel default action
        event.preventDefault();
        // trigger elements
        document.getElementById("kitIdButton").click();
      }
    });
}
