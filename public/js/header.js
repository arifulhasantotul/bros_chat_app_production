// url location
const currentLocation = location.href;
// menu item for active
const menuItem = document.querySelectorAll(".nav_item a");
const menuLength = menuItem.length;
// sub menu item
const arrow = document.querySelectorAll(".arrow");
const sidebar = document.querySelector(".sidebar");
const sidebarBtn = document.querySelector(".toggle_button");

// adding url based active class
for (let i = 0; i < menuLength; i++) {
  if (menuItem[i].href === currentLocation) {
    menuItem[i].className = "active";
  }
}

// sub menu arrow sign
for (let i = 0; i < arrow.length; i++) {
  arrow[i].addEventListener("click", (e) => {
    let arrowParent = e.target.parentElement.parentElement;
    arrowParent.classList.toggle("showMenu");
  });
}

sidebarBtn.addEventListener("click", () => {
  sidebar.classList.toggle("close");
  sidebarBtn.classList.toggle("rotate");
});
