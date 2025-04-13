
const alert = document.querySelector('.alert');
const alert_title = document.getElementById('alert-title');
const alert_info = document.getElementById('alert-info');

document.querySelectorAll('.closebtn').forEach(btn => {
    btn.onclick = function () {
      const alert = this.parentElement;
      alert.style.opacity = "0";
      setTimeout(() => {
        alert.classList.add('hide');
      }, 300);
    }
});



function sendAlert(title, info, type) {
    alert_title.innerText = title;
    alert_info.innerText = info;
    switch(type) {
        case 'success':
          alert.classList.remove('info');
          alert.classList.remove('warning');
          alert.classList.add('success');
          break;
        case 'error':
            alert.classList.remove('info');
            alert.classList.add('warning');
            alert.classList.remove('success');
          break;
        default:
            alert.classList.add('info');
            alert.classList.remove('warning');
            alert.classList.remove('success');
      }
    alert.classList.remove('hide');
}
