const conversationContainer = document.querySelector("#conversation-list ul");

document.addEventListener("DOMContentLoaded", function () {
  const allChildren = conversationContainer.querySelectorAll("li");

  Array.prototype.forEach.call(
    conversationContainer.querySelectorAll("li"),
    function (element) {
      element.onclick = addSelected;
    }
  );

  function addSelected(element) {
    element = this;
    if (element.classList.contains("selected")) {
      element.classList.remove("selected");
    } else {
      allChildren.forEach(function (e) {
        e.classList.remove("selected");
      });
      element.classList.add("selected");
    }
  }
});
