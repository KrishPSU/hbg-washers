

const book_btns = document.querySelectorAll('.book-btn');

const modal = document.querySelector('dialog');
const machine_id_label = document.getElementById('machine-id');
const time_selected = document.getElementById('time-selected');
const email_field = document.getElementById('email');
const submit_modal = document.getElementById('submit-modal');
const close_modal_btn = document.getElementById('close-modal');

book_btns.forEach(book_btn => {
    book_btn.addEventListener('click', () => {
        const machineId = book_btn.getAttribute('data-machine-id');
        const machineAvailable = book_btn.getAttribute('data-machine-status');
        if (!machineAvailable) return;
        machine_checkout(machineId);
    })
});


close_modal_btn.addEventListener('click', () => {
    modal.close();
});

time_selected.addEventListener('change', () => {
    if (time_selected.value == "none") {
        submit_modal.disabled = true;
    } else {
        submit_modal.disabled = false;
    }
});


function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


function machine_checkout(machineId) {
    switch(machineId) {
        case "w1":
            machine_id_label.innerText = "Washer 1";
            break;
        case "w2":
            machine_id_label.innerText = "Washer 2";
            break;
        case "d1":
            machine_id_label.innerText = "Dryer 1";
            break;
        case "d2":
            machine_id_label.innerText = "Dryer 2";
            break;
        default:
            machine_id_label.innerText = "404";
    }
    machine_id_label.setAttribute("data-machine-id", machineId);
    modal.showModal();
}


submit_modal.addEventListener('click', () => {
    if (!isValidEmail(email_field.value.trim())) return;
    if (time_selected.value == "none") return;

    socket.emit('book-machine', machine_id_label.getAttribute("data-machine-id"), email_field.value.trim(), time_selected.value);
});



socket.on('machine-booked-successfully', (machineId) => {
    modal.close();
    bookMachineInClient(machineId);
    sendAlert(`${getMachineNameById(machineId)} Booked!`, "Please check your email to make sure you will be notified.", "success");
});


socket.on('machine-already-booked', (machineId) => {
    modal.close();
    bookMachineInClient(machineId);
    sendAlert(`Sorry, ${getMachineNameById(machineId)} is already booked.`, "Check again later to see if it is free.", "error");
});


function bookMachineInClient(machineId) {
    book_btns.forEach((btn) => {
        if (btn.getAttribute('data-machine-id') == machineId) {
            btn.classList.add('booked');
            btn.setAttribute('data-machine-status', false);
            btn.innerText = "Booked";
            btn.disabled = true;
            return;
        }
    });   
}


function getMachineNameById(machineId) {
    switch(machineId) {
        case "w1":
            return "Washer 1";
        case "w2":
            return "Washer 2";
        case "d1":
            return "Dryer 1";
        case "d2":
            return "Dryer 2";
        default:
            // console.error(`Machine id:${machineId} non-existent.`);
            return "404";
    }
}
