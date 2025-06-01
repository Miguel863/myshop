
const stripe = Stripe("pk_test_51RUo6XPet7MAMNceBluJLqAH1qV9MDLbsCg0DtjQ6QQ5q23mgWX5vJrCNSDfsjR1MfZ3eZXxKWkj4StREOHx5joE00WXMAZFOj");

document.getElementById("checkout-button").addEventListener("click", () => {
  fetch("/create-checkout-session", {
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
