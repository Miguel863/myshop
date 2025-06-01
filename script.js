
const stripe = Stripe("pk_test_51RUo6QB6DmJRVInbacgTDXRgyFScbvi9inJpObyns5iREBZkgRkJEmyGa0aZ46a4o3Op3Is8HDnGqFxLEVhciWSO00hxAYBaNA");

document.getElementById("checkout-button").addEventListener("click", () => {
  fetch("https://myshop-1223.onrender.com/create-checkout-session", {
    method: "POST",
  })
    .then((res) => res.json())
    .then((data) => {
      if(data.url) {
        window.location.href = data.url;
      } else {
        document.getElementById("message").textContent = "Error al iniciar pago.";
      }
    })
    .catch(() => {
      document.getElementById("message").textContent = "Error de red.";
    });
});
