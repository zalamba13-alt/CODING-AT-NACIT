const registrationForm = document.getElementById("registration-form");
const eventDateInput = document.getElementById("event-date");
const formStatus = document.getElementById("form-status");

const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
eventDateInput.min = localToday;

if (window.flatpickr) {
    flatpickr(eventDateInput, {
        dateFormat: "Y-m-d",
        minDate: "today",
        disableMobile: true
    });
}

registrationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!registrationForm.reportValidity()) {
        return;
    }

    const name = document.getElementById("name").value.trim();
    const selectedEvent = document.getElementById("event").value;
    const selectedDate = eventDateInput.value;
    const confirmation = `Thanks, ${name}! Your request for ${selectedEvent} on ${selectedDate} is ready. This demo does not send it to a server.`;

    formStatus.textContent = confirmation;

    if (window.Swal) {
        Swal.fire({
            title: "Registration details ready",
            text: confirmation,
            icon: "success",
            confirmButtonColor: "#4b2e20"
        });
    }
});
