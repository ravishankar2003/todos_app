document.addEventListener('DOMContentLoaded', function() {
    const datePicker = document.getElementById('datePicker');
  
    if (datePicker) {
      datePicker.addEventListener('change', function() {
        const newDate = datePicker.value;
        document.querySelector('input[name="date"]').value = newDate;
  
        document.getElementById('dateForm').submit();
      });
    } else {
      console.error("datePicker element not found.");
    }
  });