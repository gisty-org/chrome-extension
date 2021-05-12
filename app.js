var submit_button = document.getElementById("submit");
var start_button = document.getElementById("start");
var stop_button = document.getElementById("stop");
var resume_button = document.getElementById("resume");
var ss_button = document.getElementById("ss");
var is_google_meet = false;
var spanClassName = "CNusmb";
var div = document.getElementById("span_text");
var idx = 1;
var catch_meet = false;
var google_meet_transcript_data = "";
var take_snapshot = false;

function get_data() {
  //console.log('came here');
  var idx = 1;
  var spans = document.getElementsByClassName("CNusmb");
  // console.log(spans);
  var take_snapshot = false;
  var global_text = "";
  for (let i = 0; i < spans.length; i++) {
    console.log(spans[i].innerText, spans[i].classList.contains("from-cs"));
    if (!spans[i].classList.contains("from-cs")) {
      var text = spans[i].innerText;
      var res = text.split(" ");
      //console.log(res);
      for (let i = 0; i < res.length; i++) {
        if (res[i] == "take" || res[i] == "Take") {
          if (
            i != res.length - 1 &&
            (res[i + 1] == "snapshot" || res[i + 1] == "snapshot.")
          ) {
            console.log("detected take snapshot");
            take_snapshot = true;
          }
        }
      }
      global_text += text;
      global_text += " ";
      // console.log(text);
      // div.textContent += text;
      spans[i].classList.add("from-cs");
    }
  }
  return { text: global_text, flag: take_snapshot };
}

function start_fetching_meet() {
  console.log("started");
  // while(true){
  if (catch_meet) {
    //console.log('inside');
    setTimeout(() => {
      chrome.tabs.executeScript(
        null,
        { code: "(" + get_data + ")();" },
        (results) => {
          // console.log('FUN RES');
          // console.log(results);
          // div.innerText += " ";
          // div.innerText += results;
          google_meet_transcript_data += " ";
          google_meet_transcript_data += results[0].text;
          localStorage.setItem("meet-data", google_meet_transcript_data);
          console.log(results[0].flag, results, "value of take snapshot bool");
          if (results[0].flag) {
            console.log("take snapshot!! :)");
            takeScreenShot();
            acknowledgeSSSuccess();
          }
          start_fetching_meet();
        }
      );
    }, 5000);
  } else return;
  // }
}

function get_host_name() {
  return window.location.host;
}

start_button.addEventListener("click", async function () {
  localStorage.setItem("images", JSON.stringify([]));
  await chrome.tabs.executeScript(
    null,
    { code: "(" + get_host_name + ")();" },
    (results) => {
      console.log(results);
      if (results[0] == "meet.google.com") {
        is_google_meet = true;
        console.log("It is a G Meet");
      }
      if (is_google_meet) {
        catch_meet = true;
        console.log("starting recording...");
        submit_button.style.display = "inline-block";
        start_button.style.display = "none";
        start_fetching_meet();
      } else toggleSpeechRecognition();
    }
  );
});

submit_button.addEventListener("click", function (e) {
  e.preventDefault();
  if (!is_google_meet) toggleSpeechRecognition();
  else {
    recognizing = false;
    submit_button.style.display = "none";
    start_button.style.display = "inline-block";
  }
  const req = new XMLHttpRequest();
  const baseUrl = BASE_URL_VS + "/text/1";
  const subject_name = document.getElementById("subject_name").value;
  const lecture_name = document.getElementById("lecture_name").value;
  const num_lines = document.getElementById("num_lines").value;
  if (num_lines == null) num_lines = -1;
  // const transcript = document.getElementById('transcript').value;
  // const transcript_data = localStorage.getItem('current_session');
  if (is_google_meet) {
    catch_meet = false;
    transcript_data = google_meet_transcript_data;
  }
  const urlParams = {
    subject_name: subject_name,
    lecture_name: lecture_name,
    transcript: localStorage.getItem("meet-data"),
    email:
      (JSON.parse(localStorage.getItem("user")) &&
        JSON.parse(localStorage.getItem("user")).email) ||
      TEMP_EMAIL,
    images: JSON.parse(localStorage.getItem("images")),
    is_gmeet: is_google_meet,
    num_lines: num_lines,
  };
  console.log(urlParams);
  req.open("POST", baseUrl);
  req.setRequestHeader("Content-Type", "application/json");
  req.send(JSON.stringify(urlParams));

  req.onreadystatechange = function () {
    // Call a function when the state changes.
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      console.log("Got response 200!");
      transcript_data = [];
      localStorage.setItem("images", null);
    }
  };

  is_google_meet = false;
});

stop_button.addEventListener("click", function (e) {
  e.preventDefault();
  if (!is_google_meet) toggleSpeechRecognition();
  else {
    recognizing = false;
    stop_button.style.display = "none";
    resume_button.style.display = "inline-block";
  }

  if (is_google_meet) {
    catch_meet = false;
    transcript_data = google_meet_transcript_data;
  }
});

resume_button.addEventListener("click", function (e) {
  e.preventDefault();
  if (!is_google_meet) toggleSpeechRecognition();
  else {
    recognizing = true;
    stop_button.style.display = "inline-block";
    resume_button.style.display = "none";
    console.log("resume");
  }

  if (is_google_meet) {
    catch_meet = true;
    transcript_data = google_meet_transcript_data;
  }
  start_fetching_meet();
});

var recognizing = false;
var recognition = new webkitSpeechRecognition();
var transcript_data = [];
var start_time;
var end_time;
recognition.continuous = true;
recognition.interimResults = true;

recognition.onstart = function () {
  recognizing = true;
  recordSession();
};

recognition.onerror = function (event) {
  console.log(
    "Recognition error: ",
    event.message ? event.message : event.error
  );
  if (event.error == "not-allowed") {
    window.open("chrome-extension://" + CHROME_EXTENSION_ID + "/perms.html");
  }
  if (
    event.error == "no-speech" ||
    event.error == "audio-capture" ||
    event.error == "network" ||
    event.error == "bad-grammar"
  ) {
    refresh();
  }
};

recognition.onend = function () {
  recognizing = false;
};

recognition.onresult = function (event) {
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i][0].confidence > 0.1) {
      if (event.results[i].isFinal) {
        console.log(event.results);
        var text = event.results[i][0].transcript;
        addToTranscript("current_session", text);
        var res = text.split(" ");
        for (let i = 0; i < res.length; i++) {
          if (res[i] == "take") {
            if (i != res.length - 1 && res[i + 1] == "snapshot") {
              takeScreenShot();
              acknowledgeSSSuccess();
            }
          }
        }
      }
    }
  }
};

function toggleSpeechRecognition(event) {
  if (recognizing) {
    recognition.stop();
    submit_button.style.display = "none";
    start_button.style.display = "inline-block";
    return;
  } else {
    submit_button.style.display = "inline-block";
    start_button.style.display = "none";
    recognition.start();
  }
}

function recordSession() {
  createSession();

  beginTime = new Date();

  window.location.hash = currentSession.name;
}

function createSession() {
  var id, name, startTime;
  name = "new_session";
  startTime = new Date();
  currentSession = { id: id, name: name, startTime: startTime };
  // saveToLocalStorage('current_session', currentSession);
}

function addToTranscript(sessionName, text) {
  if (text) {
    var endTime = new Date();
    transcript_data.push({
      startTime: beginTime,
      endTime: endTime,
      text: text,
    });
    // Reset the beginTime
    beginTime = endTime;
    console.log(transcript_data);
    // saveToLocalStorage(sessionName, JSON.stringify(transcript));
  }
}

function saveToLocalStorage(key, data) {
  if (data && localStorage) {
    if (typeof data === "object") {
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      localStorage.setItem(key, data);
    }
  }
}

function refresh(event) {
  recognizing = false;
  recognition.abort();
  try {
    recognition.start();
  } catch (e) {}
}

function acknowledgeSSSuccess() {
  ss.style.backgroundColor = "green";
  setTimeout(3000, () => {
    ss.style.backgroundColor = null;
  });
}
