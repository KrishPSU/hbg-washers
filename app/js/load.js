const socket = io();



socket.on('all-machine-status', (data) => {
    for (let i=0; i<data.length; i++) {
        let machine = data[i];
        for (let j=0; j<book_btns.length; j++) {
            let btn = book_btns[j];
            if (machine.id == btn.getAttribute('data-machine-id')) {
                btn.setAttribute('data-machine-status', data[i].available);
                if (machine.available) {
                    btn.innerText = "Available";
                    btn.classList.remove("booked");
                    btn.disabled = false;
                } else {
                    // btn.innerText = `Booked until ${prettyPrintTime(machine.time_end)}`;
                    btn.innerText = "Booked";
                    btn.classList.add("booked");
                    btn.disabled = true;
                }
            }
        }
    }
});


function prettyPrintTime(time) {
    let [hours, minutes] = time.split(':');

    // Remove leading 0 from hour if present
    if (hours.startsWith('0')) {
        hours = hours.slice(1);
    }

    return `${hours}:${minutes}`;
}
