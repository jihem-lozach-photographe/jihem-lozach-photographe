// Petit script commun (on l'enrichira ensuite)
(function () {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
