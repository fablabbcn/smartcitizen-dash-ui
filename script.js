window.onload = function () {
  initDashboard();
};

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
  document.getElementById("kitIdInput").value = kitId;
  kitId.length > 0 && getKitData(kitId);
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
        hintUpdate(id, "success");
        displayKit(kit);
        getSensorsData(kit);
        hideShow("kitData", "show");
        hideShow("sensorsData", "show");
      } else {
        hintUpdate(id, "failure");
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
  for (let i = 0; kit.data.sensors.length > i; i++) {
    const api_sensor_url = `https://api.smartcitizen.me/v0/devices/${kit.id}/readings?sensor_id=${kit.data.sensors[i].id}&rollup=4h&from=2021-03-01&to=2021-03-31`;
    https: fetch(api_sensor_url)
      .then((res) => {
        return res.json();
      })
      .then((sensor) => {
        displaySensor(sensor);
      });
  }
}

function displaySensor(sensor) {
  let readings = sensor.readings;
  let data = [[], []]
  for (const reading of readings) {
    let date = new Date(reading[0]).getTime();
    data[0].push(date);
    data[1].push(reading[1]);
  }
  if (data != undefined && data[0].length > 0) {
    let opts = {
      title: sensor.id,
      id: sensor.id,
      class: "chart",
      width: 800,
      height: 400,
      series: [
        {},
        {
          show: true,
          spanGaps: true,
          label: sensor.sensor_key,
          value: (self, rawValue) => "$" + rawValue.toFixed(2),
          stroke: "red",
          width: 0.1,
          fill: "rgba(255, 0, 0, 0.3)",
          dash: [10, 5],
        },
      ],
    };
    let uplot = new uPlot(opts, data, document.getElementById("sensorsData"));
  }
}



function urlCheck() {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  return {url, params}
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
      message = "Too many requests, please wait 10 seconds before trying again.";
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
    document.getElementById(elementId).style.display = "block";
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


