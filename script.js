// A function to show the toast (toast controller)
const showToast = (message, isError = false) => {
  const toast = document.getElementById("toast");
  toast.className = isError ? "toast-error" : "toast-success";
  toast.classList.add("toast-visible");
  toast.textContent = message;

  setTimeout(() => {
    toast.classList.add("toast-hidden");
  }, 3000);
};

// A function to validate the form [!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)]
const validateForm = (form) => {
  const errors = [];
  const fields = [
    { name: "name", label: "Full name" },
    { name: "email", label: "Email" },
    { name: "message", label: "Message" },
  ];

  // If a field is missing, add an error to the errors array
  fields.forEach((field) => {
    if (!form.elements[field.name].value.trim()) {
      errors.push(`${field.label} is required!`);
    }
  });

  // Basic email validation
  const email = form.elements.email.value;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Please eneter a valid email!");
  }

  return errors;
};

// Form submission

const form = document.getElementById("contactForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  // Validate
  const errors = validateForm(form);
  if (errors.length > 0) {
    showToast(errors.join(", "), true);
    return;
  }

  // Prepare the JSON data
  const jsonData = {
    name: form.elements.name.value,
    email: form.elements.email.value,
    message: form.elements.message.value,
  };

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Request failed");
    }

    showToast("Message sent successfully!");
    form.reset();
    setTimeout(() => {
      window.location.href = "/thank-you.html";
    }, 1500);
  } catch (error) {
    console.error("Sending error: ", error);
    showToast(error.message || "Failed to send email", true);
  }
});
