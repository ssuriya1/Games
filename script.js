// Function to update the card based on JSON data
function updateCard(jsonData) {
  var chatCard = document.getElementById("chatCard");
  chatCard.innerHTML = "";

  jsonData.forEach(function (data) {
    let anchorCard = document.createElement("a");
    anchorCard.href = data.url;
    anchorCard.classList.add("anchorCard");

    var card = document.createElement("div");
    card.classList.add("card");

    if (data.title) {
      var title = document.createElement("div");
      title.classList.add("title");
      title.textContent = data.title;
      card.appendChild(title);
    }

    if (data.imageURL) {
      var image = document.createElement("img");
      image.classList.add("image");
      image.src = data.imageURL;
      image.alt = data.imageURL;
      card.appendChild(image);
    }

    if (data.description) {
      var description = document.createElement("div");
      description.classList.add("description");
      description.textContent = data.description;
      card.appendChild(description);
    }

    anchorCard.appendChild(card);
    chatCard.appendChild(anchorCard);
  });
}

function changeClass(e) {
  e.classList.toggle("off");
  e.classList.toggle("on");
}
document.querySelectorAll("span").forEach((span) =>
  span.addEventListener("click", function () {
    changeClass(this);
  })
);

// Toggle dark/light mode
var modeToggle = document.getElementById("modeToggle");
modeToggle.addEventListener("click", function () {
  var body = document.body;
  if (body.classList.contains("dark-mode")) {
    body.classList.remove("dark-mode");
    body.classList.add("light-mode");
  } else {
    body.classList.remove("light-mode");
    body.classList.add("dark-mode");
  }
});

// JSON data stored as a variable
var jsonData = [
  {
    title: "Guess the Number",
    imageURL: "guess the number.png",
    url: "Guess The Number/index.html",
  },
  {
    title: "Ping Pong",
    imageURL: "Canvas.png",
    url: "Canvas/index.html",
  },
  {
    title: "Quiz",
    imageURL: "Quiz.png",
    description: "Unable to play this game in browser.",
    url: "#",
  },
];

updateCard(jsonData);
