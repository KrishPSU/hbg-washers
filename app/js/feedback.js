const feedback_btn = document.getElementById('feedback-btn');
const close_feedback_btn = document.getElementById('close-feedback-btn');
const cancel_feedback_btn = document.getElementById('cancel-feedback-btn');
const submit_feedback_btn = document.getElementById('submit-feedback-btn');

feedback_btn.addEventListener('click', () => {
    openModal();
});

close_feedback_btn.addEventListener('click', () => {
    closeModal();
});

cancel_feedback_btn.addEventListener('click', () => {
    closeModal();
});

submit_feedback_btn.addEventListener('click', () => {
    submitFeedback();
});



function openModal() {
    document.getElementById('overlay').classList.remove('hidden');
    document.body.classList.add('modal-open');
}
  
function closeModal() {
    document.getElementById('overlay').classList.add('hidden');
    document.body.classList.remove('modal-open');
    document.getElementById('feedbackInput').value = '';
    document.getElementById('feedbackMessage').textContent = '';
}
  
function submitFeedback() {
    const input = document.getElementById("feedbackInput");
    const message = document.getElementById("feedbackMessage");
    const feedback = input.value.trim();
  
    if (!feedback) {
      message.style.color = "red";
      message.textContent = "Please enter some feedback.";
      return;
    }
  
    socket.emit('new-feedback', feedback);
    message.style.color = "green";
    message.textContent = "Thanks for your feedback!";
    input.value = "";
  
    setTimeout(() => {
      closeModal();
    }, 1000);
}
