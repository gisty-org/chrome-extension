var CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/codemafia/image/upload";
var CLOUDINARY_UPLOAD_PRESET = "ksx2b0v2";

const canIRun = navigator.mediaDevices.getDisplayMedia;

function acknowledgeSSSuccess() {
  ss.style.display = "none";
  ss_in.style.display = "inline-block";
  setTimeout(() => {
    ss.style.display = "inline-block";
    ss_in.style.display = "none";
  }, 3000);
}

const takeScreenShot = async (e) => {
  chrome.tabs.captureVisibleTab(async function (imageUri) {
    console.log(imageUri);
    const res = await fetch(imageUri);
    const buff = await res.arrayBuffer();
    // clone so we can rename, and put into array for easy proccessing
    const file = [
      new File([buff], `photo_${new Date()}.jpg`, {
        type: "image/jpeg",
      }),
    ];
    console.log(file[0]);
    var formData = new FormData();
    formData.append("file", file[0]);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("tags", "browser_upload");
    //   alert(formData);
    for (var pair of formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }
    console.log(formData);
    const req = new XMLHttpRequest();
    req.open("POST", CLOUDINARY_URL);
    req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    req.send(formData);

    req.onreadystatechange = function () {
      // Call a function when the state changes.
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        console.log("Got response 200!");
        var response = JSON.parse(req.responseText);
        var url = response.secure_url;
        if (JSON.parse(localStorage.getItem("images")) == null) {
          var img = [url];
          localStorage.setItem("images", JSON.stringify(img));
          console.log(JSON.parse(localStorage.getItem("images")));
        } else {
          var imgs = JSON.parse(localStorage.getItem("images"));
          console.log(imgs);
          imgs.push(url);
          localStorage.setItem("images", JSON.stringify(imgs));
          console.log(JSON.parse(localStorage.getItem("images")));
        }
        console.log(localStorage.getItem("images"));
      } else {
        console.log(req.response);
      }
    };
    console.log(req.response);
    console.log(req.response.secure_url);
    acknowledgeSSSuccess();
    return file;
  });
};

const button = (document.getElementById("ss").onclick = () =>
  canIRun ? takeScreenShot() : {});
